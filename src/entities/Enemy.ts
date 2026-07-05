import Phaser from 'phaser';
import { Player } from './Player';
import {
  ENEMY_HP, ENEMY_PATROL_SPEED, ENEMY_AGGRO_SPEED,
  ENEMY_DETECT_RADIUS, ENEMY_DEAGGRO_MULT, ENEMY_ATTACK_RANGE,
  ENEMY_ATTACK_CD, ENEMY_PATROL_HALF, ENEMY_SCALE,
} from '../constants';

export const enum EnemyState {
  PATROL   = 'PATROL',
  AGGRO    = 'AGGRO',
  ATTACKING= 'ATTACKING',
  HURT     = 'HURT',
  DEAD     = 'DEAD',
}

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  hp     = ENEMY_HP;
  maxHp  = ENEMY_HP;
  isDead = false;

  // Exposed so CombatSystem can register overlaps
  attackHitbox: Phaser.GameObjects.Rectangle | null = null;

  private enemyState  = EnemyState.PATROL;
  private spawnX      = 0;
  private spawnY      = 0;
  private patrolLeft  = 0;
  private patrolRight = 0;
  private facingRight = true;
  private attackTimer = 0;
  private attackActive= false;
  private attackElapsed = 0;
  private readonly ATK_DUR = 300;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'orc-idle');
    this.spawnX      = x;
    this.spawnY      = y;
    this.patrolLeft  = x - ENEMY_PATROL_HALF;
    this.patrolRight = x + ENEMY_PATROL_HALF;
    this.setScale(ENEMY_SCALE);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
  }

  update(time: number, delta: number, player: Player): void {
    if (this.enemyState === EnemyState.DEAD) return;
    if (this.enemyState === EnemyState.HURT) return;

    if (this.attackTimer > 0) this.attackTimer -= delta;
    if (this.attackActive) {
      this.attackElapsed += delta;
      if (this.attackElapsed >= this.ATK_DUR) this._teardownHitbox();
    }

    // Update hitbox position to follow enemy
    if (this.attackHitbox) {
      const offX = this.facingRight ? 55 : -55;
      this.attackHitbox.setPosition(this.x + offX, this.y - 5);
    }

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    switch (this.enemyState) {
      case EnemyState.PATROL:   this._doPatrol(dist);          break;
      case EnemyState.AGGRO:    this._doAggro(dist, player);   break;
      case EnemyState.ATTACKING: /* wait for anim */           break;
    }
  }

  takeDamage(amount: number): void {
    if (this.isDead) return;
    this.hp -= amount;
    if (this.hp <= 0) {
      this.hp = 0;
      this._die();
    } else {
      this._hurt();
    }
  }

  respawn(x: number, y: number): void {
    this.hp           = ENEMY_HP;
    this.isDead       = false;
    this.enemyState   = EnemyState.PATROL;
    this.attackTimer  = 0;
    this.attackActive = false;
    this.spawnX       = x;
    this.spawnY       = y;
    this.patrolLeft   = x - ENEMY_PATROL_HALF;
    this.patrolRight  = x + ENEMY_PATROL_HALF;
    this._teardownHitbox();
    this.setActive(true).setVisible(true).setAlpha(1);
    this.body!.reset(x, y);
    this.play('orc-idle');
  }

  // ── States ──────────────────────────────────────────────────────────────────

  private _doPatrol(distToPlayer: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    // Switch to aggro if player close
    if (distToPlayer < ENEMY_DETECT_RADIUS) {
      this.enemyState = EnemyState.AGGRO;
      return;
    }
    // Oscillate
    if (this.facingRight) {
      body.setVelocityX(ENEMY_PATROL_SPEED);
      if (this.x >= this.patrolRight) this.facingRight = false;
    } else {
      body.setVelocityX(-ENEMY_PATROL_SPEED);
      if (this.x <= this.patrolLeft) this.facingRight = true;
    }
    this.setFlipX(!this.facingRight);
    this.play('orc-walk', true);
  }

  private _doAggro(distToPlayer: number, player: Player): void {
    const body    = this.body as Phaser.Physics.Arcade.Body;
    const deaggro = ENEMY_DETECT_RADIUS * ENEMY_DEAGGRO_MULT;

    if (distToPlayer > deaggro) {
      this.enemyState = EnemyState.PATROL;
      return;
    }

    // Attack if in range and cooldown ready
    if (distToPlayer <= ENEMY_ATTACK_RANGE && this.attackTimer <= 0) {
      this._startAttack(player);
      return;
    }

    // Chase
    const dx = player.x - this.x;
    this.facingRight = dx > 0;
    this.setFlipX(!this.facingRight);
    body.setVelocityX(this.facingRight ? ENEMY_AGGRO_SPEED : -ENEMY_AGGRO_SPEED);
    this.play('orc-walk', true);
  }

  private _startAttack(_player: Player): void {
    this.enemyState   = EnemyState.ATTACKING;
    this.attackTimer  = ENEMY_ATTACK_CD;
    this.attackActive = true;
    this.attackElapsed= 0;
    (this.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
    this._spawnHitbox();
    this.play('orc-attack', true);
    this.once('animationcomplete', () => {
      if (this.enemyState === EnemyState.ATTACKING) {
        this.enemyState = EnemyState.AGGRO;
      }
    });
  }

  private _spawnHitbox(): void {
    const offX = this.facingRight ? 55 : -55;
    const hb   = this.scene.add.rectangle(
      this.x + offX, this.y - 5,
      55, 45,
      0xff0000, 0
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
  }

  private _hurt(): void {
    this.enemyState = EnemyState.HURT;
    (this.body as Phaser.Physics.Arcade.Body).setVelocityX(this.facingRight ? -120 : 120);
    this.play('orc-hurt', true);
    this.once('animationcomplete', () => {
      if (this.enemyState === EnemyState.HURT) this.enemyState = EnemyState.AGGRO;
    });
  }

  private _die(): void {
    this.isDead       = true;
    this.enemyState   = EnemyState.DEAD;
    this._teardownHitbox();
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(0);
    body.setEnable(false);
    this.play('orc-death', true);
    this.once('animationcomplete', () => {
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 600,
        onComplete: () => this.setActive(false).setVisible(false),
      });
    });
  }
}
