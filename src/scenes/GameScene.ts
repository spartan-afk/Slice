import Phaser from 'phaser';
import { Player }        from '../entities/Player';
import { Enemy }         from '../entities/Enemy';
import { CombatSystem }  from '../systems/CombatSystem';
import { HUD }           from '../systems/HUD';
import {
  WORLD_WIDTH, WORLD_HEIGHT, GAME_WIDTH,
  ENEMY_SPAWNS, PLAYER_SPAWN_X, PLAYER_SPAWN_Y,
} from '../constants';

// ─── Platform layout [x, y, w, h] ────────────────────────────────────────────
const GROUND: [number, number, number, number] = [0, 720, 3200, 80];

const FLOATING_PLATFORMS: [number, number, number, number][] = [
  [180,  560,  300,  22],
  [560,  430,  220,  22],
  [870,  560,  260,  22],
  [1180, 390,  300,  22],
  [1540, 470,  220,  22],
  [1830, 340,  320,  22],
  [2190, 460,  260,  22],
  [2530, 540,  220,  22],
  [2800, 380,  360,  22],
];

export class GameScene extends Phaser.Scene {
  player!:          Player;
  enemies!:         Phaser.GameObjects.Group;
  // Two separate groups so we can use different collision rules
  groundGroup!:     Phaser.Physics.Arcade.StaticGroup;
  floatingGroup!:   Phaser.Physics.Arcade.StaticGroup;
  combat!:          CombatSystem;
  hud!:             HUD;

  // Expose a combined reference for CombatSystem / enemy colliders
  get allPlatforms(): Phaser.Physics.Arcade.StaticGroup[] {
    return [this.groundGroup, this.floatingGroup];
  }

  constructor() { super({ key: 'GameScene' }); }

  create(): void {
    // ── Background ───────────────────────────────────────────────────────────
    this._buildBackground();
    this._buildStars();

    // ── Platforms ─────────────────────────────────────────────────────────────
    this.groundGroup   = this.physics.add.staticGroup();
    this.floatingGroup = this.physics.add.staticGroup();
    this._buildGround();
    this._buildFloating();

    // ── Player ────────────────────────────────────────────────────────────────
    this.player = new Player(this, PLAYER_SPAWN_X, PLAYER_SPAWN_Y);
    this.add.existing(this.player);
    this.physics.add.existing(this.player);

    // Ground: full collision from all sides
    this.physics.add.collider(this.player, this.groundGroup);

    // Floating platforms: one-way — only collide when player is falling/still.
    this.physics.add.collider(this.player, this.floatingGroup);

    // ── Enemies ───────────────────────────────────────────────────────────────
    this.enemies = this.add.group();
    for (const [x, y] of ENEMY_SPAWNS) {
      const e = new Enemy(this, x, y);
      this.add.existing(e);
      this.physics.add.existing(e);
      // Enemies get full collision with both groups (they don't jump)
      this.physics.add.collider(e, this.groundGroup);
      this.physics.add.collider(e, this.floatingGroup);
      this.enemies.add(e);
    }

    // ── Combat system ─────────────────────────────────────────────────────────
    this.combat = new CombatSystem(this);

    // ── HUD ───────────────────────────────────────────────────────────────────
    this.hud = new HUD(this);

    // ── Camera ───────────────────────────────────────────────────────────────
    this.cameras.main
      .setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)
      .startFollow(this.player, true, 0.1, 0.1);

    // ── Respawn input ─────────────────────────────────────────────────────────
    this.input.keyboard!.on('keydown-R', () => {
      if (this.player.isDead) this._respawn();
    });
  }

  update(time: number, delta: number): void {
    if (!this.player.isDead) {
      this.player.update(time, delta);
    }

    for (const obj of this.enemies.getChildren()) {
      const e = obj as unknown as Enemy;
      if (e.active) e.update(time, delta, this.player);
    }

    this.combat.update(time);
    this.hud.update(this.player);
  }

  // ── Private helpers ──────────────────────────────────────────────────────────

  private _buildBackground(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x0d0d1a, 0x0d0d1a, 0x1a1a2e, 0x1a1a2e, 1);
    bg.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    bg.fillStyle(0x12122a);
    const mts: [number, number, number][] = [
      [0,350,200],[180,300,240],[380,330,200],[540,290,280],[780,320,220],
      [1000,280,300],[1250,310,250],[1460,270,280],[1680,300,230],[1870,290,270],
      [2080,310,240],[2290,280,310],[2530,300,260],[2760,290,300],[2980,320,220],
    ];
    for (const [x, y, w] of mts) {
      bg.fillTriangle(x, WORLD_HEIGHT, x + w / 2, y, x + w, WORLD_HEIGHT);
    }
  }

  private _buildStars(): void {
    const gfx = this.add.graphics().setScrollFactor(0.06);
    gfx.fillStyle(0xffffff);
    for (let i = 0; i < 150; i++) {
      const x = Phaser.Math.Between(0, GAME_WIDTH);
      const y = Phaser.Math.Between(0, 260);
      const r = Math.random() < 0.2 ? 1.5 : 1;
      gfx.fillRect(x, y, r, r);
    }
  }

  private _buildGround(): void {
    const [x, y, w, h] = GROUND;
    const gfx = this.add.graphics();
    gfx.fillStyle(0x1e1e2f).fillRect(x, y, w, h);
    gfx.fillStyle(0x3a3a5c).fillRect(x, y, w, 5);
    gfx.fillStyle(0x5c5c8a, 0.4).fillRect(x, y, w, 2);

    const img = this.physics.add.staticImage(x + w / 2, y + h / 2, '__DEFAULT')
      .setVisible(false).setDisplaySize(w, h).refreshBody();
    this.groundGroup.add(img, true);
  }

  private _buildFloating(): void {
    for (const [x, y, w, h] of FLOATING_PLATFORMS) {
      const gfx = this.add.graphics();
      gfx.fillStyle(0x2a2a42).fillRect(x, y, w, h);
      gfx.fillStyle(0x5a5a8a).fillRect(x, y, w, 4);
      gfx.fillStyle(0x8888bb, 0.5).fillRect(x, y, w, 2);
      gfx.fillStyle(0x3a3a55).fillRect(x, y, 3, h);
      gfx.fillStyle(0x3a3a55).fillRect(x + w - 3, y, 3, h);

      const img = this.physics.add.staticImage(x + w / 2, y + h / 2, '__DEFAULT')
        .setVisible(false).setDisplaySize(w, h).refreshBody();
      
      const body = img.body as Phaser.Physics.Arcade.StaticBody;
      body.checkCollision.down = false;
      body.checkCollision.left = false;
      body.checkCollision.right = false;

      this.floatingGroup.add(img, true);
    }
  }

  private _respawn(): void {
    this.player.respawn(PLAYER_SPAWN_X, PLAYER_SPAWN_Y);

    const children = this.enemies.getChildren();
    for (let i = 0; i < children.length; i++) {
      const e = children[i] as unknown as Enemy;
      const [sx, sy] = ENEMY_SPAWNS[i];
      e.respawn(sx, sy);
    }

    this.hud.hideDeathScreen();
  }
}
