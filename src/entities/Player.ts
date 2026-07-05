import Phaser from 'phaser';
import {
  PLAYER_HP, PLAYER_SPEED, PLAYER_JUMP_VEL,
  PLAYER_ATTACK_CD, PLAYER_ATTACK_DUR, PLAYER_IFRAMES, PLAYER_SCALE,
  PLAYER_SPAWN_X, PLAYER_SPAWN_Y,
} from '../constants';
import { InputController } from '../systems/InputController';

export const enum PlayerState {
  IDLE     = 'IDLE',
  RUNNING  = 'RUNNING',
  JUMPING  = 'JUMPING',
  FALLING  = 'FALLING',
  ATTACKING= 'ATTACKING',
  HURT     = 'HURT',
  DEAD     = 'DEAD',
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  hp         = PLAYER_HP;
  maxHp      = PLAYER_HP;
  isDead     = false;
  facingRight= true;

  // Hitbox exposed so CombatSystem can register it
  attackHitbox: Phaser.GameObjects.Rectangle | null = null;

  private playerState  = PlayerState.IDLE;
  private keys:         InputController;
  private attackTimer  = 0;   // ms until next attack allowed
  private iframeTimer  = 0;   // ms of invincibility remaining
  private attackActive = false;
  private attackElapsed= 0;
  private spawnX       = PLAYER_SPAWN_X;
  private spawnY       = PLAYER_SPAWN_Y;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'soldier-idle');
    this.setScale(PLAYER_SCALE);
    this.keys = new InputController(scene);
  }

  // Called by Phaser after add.existing()
  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
  }

  update(time: number, delta: number): void {
    this.keys.update();
    this._tickTimers(delta);

    if (this.playerState === PlayerState.DEAD) return;
    if (this.playerState === PlayerState.HURT) return; // wait for anim to finish

    this._handleMovement();
    this._handleAttack(time);
    this._resolveState();
    this._playAnim();
  }

  // ── Public interface ────────────────────────────────────────────────────────

  takeDamage(amount: number): void {
    if (this.isDead || this.iframeTimer > 0 || this.playerState === PlayerState.DEAD) return;
    this.hp -= amount;
    this.iframeTimer = PLAYER_IFRAMES;
    if (this.hp <= 0) {
      this.hp = 0;
      this._die();
    } else {
      this._hurt();
    }
  }

  respawn(x: number, y: number): void {
    this.hp          = PLAYER_HP;
    this.isDead      = false;
    this.playerState = PlayerState.IDLE;
    this.iframeTimer = 0;
    this.attackTimer = 0;
    this.attackActive= false;
    this._teardownHitbox();
    this.setActive(true).setVisible(true).setAlpha(1);
    this.body!.reset(x, y);
    this.play('soldier-idle');
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  private _tickTimers(delta: number): void {
    if (this.attackTimer > 0)  this.attackTimer  -= delta;
    if (this.iframeTimer > 0) {
      this.iframeTimer -= delta;
      // Flash during iframe
      this.setAlpha(Math.floor(this.iframeTimer / 80) % 2 === 0 ? 0.4 : 1);
    } else {
      this.setAlpha(1);
    }

    if (this.attackActive) {
      this.attackElapsed += delta;
      if (this.attackElapsed >= PLAYER_ATTACK_DUR) {
        this._teardownHitbox();
      }
    }
  }

  private _handleMovement(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.playerState === PlayerState.ATTACKING) {
      // Allow horizontal movement during attack but at reduced speed
      const spd = PLAYER_SPEED * 0.4;
      if (this.keys.left)  body.setVelocityX(-spd);
      else if (this.keys.right) body.setVelocityX(spd);
      else body.setVelocityX(0);
      return;
    }

    if (this.keys.left) {
      body.setVelocityX(-PLAYER_SPEED);
      this.facingRight = false;
      this.setFlipX(true);
    } else if (this.keys.right) {
      body.setVelocityX(PLAYER_SPEED);
      this.facingRight = true;
      this.setFlipX(false);
    } else {
      body.setVelocityX(0);
    }

    if (this.keys.jumpPressed && body.blocked.down) {
      body.setVelocityY(PLAYER_JUMP_VEL);
    }
  }

  private _handleAttack(_time: number): void {
    if (this.keys.attackJustPressed && this.attackTimer <= 0 && !this.attackActive) {
      this.attackTimer  = PLAYER_ATTACK_CD;
      this.attackActive = true;
      this.attackElapsed= 0;
      this.playerState  = PlayerState.ATTACKING;
      this._spawnHitbox();
    }
  }

  private _spawnHitbox(): void {
    const offX  = this.facingRight ? 60 : -60;
    const hb    = this.scene.add.rectangle(
      this.x + offX, this.y - 5,
      60, 50,
      0xffff00, 0   // invisible (alpha=0)
    );
    this.scene.physics.add.existing(hb, false);
    this.attackHitbox = hb;
  }

  private _teardownHitbox(): void {
    if (this.attackHitbox) {
      this.attackHitbox.destroy();
      this.attackHitbox = null;
    }
    this.attackActive = false;
    if (this.playerState === PlayerState.ATTACKING) {
      this.playerState = PlayerState.IDLE;
    }
  }

  private _hurt(): void {
    this.playerState = PlayerState.HURT;
    this.play('soldier-hurt', true);
    this.once('animationcomplete', () => {
      if (this.playerState === PlayerState.HURT) this.playerState = PlayerState.IDLE;
    });
    // Knock back
    const body = this.body as Phaser.Physics.Arcade.Body;
    const dir  = this.facingRight ? -1 : 1;
    body.setVelocityX(dir * 180);
  }

  private _die(): void {
    this.isDead      = true;
    this.playerState = PlayerState.DEAD;
    this._teardownHitbox();
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(0);
    this.play('soldier-death', true);
    this.once('animationcomplete', () => {
      // Notify HUD via scene reference
      (this.scene as any).hud?.showDeathScreen();
    });
  }

  private _resolveState(): void {
    if (this.playerState === PlayerState.ATTACKING) return;
    const body = this.body as Phaser.Physics.Arcade.Body;
    const vx   = body.velocity.x;
    const vy   = body.velocity.y;

    if (!body.blocked.down) {
      this.playerState = vy < 0 ? PlayerState.JUMPING : PlayerState.FALLING;
    } else if (Math.abs(vx) > 10) {
      this.playerState = PlayerState.RUNNING;
    } else {
      this.playerState = PlayerState.IDLE;
    }
  }

  private _playAnim(): void {
    switch (this.playerState) {
      case PlayerState.IDLE:      this.play('soldier-idle',   true); break;
      case PlayerState.RUNNING:   this.play('soldier-run',    true); break;
      case PlayerState.JUMPING:   this.play('soldier-run',    true); break;
      case PlayerState.FALLING:   this.play('soldier-idle',   true); break;
      case PlayerState.ATTACKING: this.play('soldier-attack', true); break;
    }
  }
}
