import Phaser from 'phaser';
import { Player }  from '../entities/Player';
import { Enemy  }  from '../entities/Enemy';
import { ENEMY_CONTACT_DMG } from '../constants';
import { GameScene } from '../scenes/GameScene';

export class CombatSystem {
  private scene:   GameScene;
  private player:  Player;
  private enemies: Phaser.GameObjects.Group;

  // Which enemies were hit in the current sword swing (cleared when hitbox gone)
  private hitEnemiesThisSwing = new Set<Enemy>();

  constructor(scene: GameScene) {
    this.scene   = scene;
    this.player  = scene.player;
    this.enemies = scene.enemies;

    // Enemy body → Player contact damage (continuous)
    this.scene.physics.add.overlap(
      this.player,
      this.enemies,
      (_p, _e) => {
        const e = _e as unknown as Enemy;
        if (!e.isDead) this.player.takeDamage(ENEMY_CONTACT_DMG);
      },
    );
  }

  update(_time: number): void {
    const hb = this.player.attackHitbox;

    // ── Player hitbox → Enemies ──────────────────────────────────────────────
    if (hb) {
      const hbBounds = (hb as Phaser.GameObjects.Rectangle).getBounds();
      for (const obj of this.enemies.getChildren()) {
        const enemy = obj as unknown as Enemy;
        if (enemy.isDead || !enemy.active) continue;
        if (this.hitEnemiesThisSwing.has(enemy)) continue;

        const eBounds = enemy.getBounds();
        if (Phaser.Geom.Intersects.RectangleToRectangle(hbBounds, eBounds)) {
          this.hitEnemiesThisSwing.add(enemy);
          enemy.takeDamage(1);
          this.scene.tweens.add({ targets: enemy, alpha: 0.2, duration: 60, yoyo: true });
        }
      }
    } else {
      this.hitEnemiesThisSwing.clear();
    }

    // ── Enemy hitboxes → Player ──────────────────────────────────────────────
    const pBounds = this.player.getBounds();
    for (const obj of this.enemies.getChildren()) {
      const enemy = obj as unknown as Enemy;
      if (enemy.isDead || !enemy.active || !enemy.attackHitbox) continue;
      const hbBounds = (enemy.attackHitbox as Phaser.GameObjects.Rectangle).getBounds();
      if (Phaser.Geom.Intersects.RectangleToRectangle(hbBounds, pBounds)) {
        this.player.takeDamage(1);
      }
    }
  }
}
