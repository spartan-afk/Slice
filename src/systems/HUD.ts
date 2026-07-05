import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { PLAYER_HP } from '../constants';

const HEART_SIZE  = 16;
const HEART_GAP   = 6;
const HUD_PADDING = 14;

export class HUD {
  private scene:       Phaser.Scene;
  private gfx:         Phaser.GameObjects.Graphics;
  private overlay:     Phaser.GameObjects.Graphics;
  private deathText:   Phaser.GameObjects.Text;
  private respawnText: Phaser.GameObjects.Text;
  private lastHp      = -1;
  private flashAlpha  = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Use a separate fixed camera so HUD doesn't scroll
    this.gfx = scene.add.graphics().setScrollFactor(0).setDepth(100);

    // Full-screen tint overlay
    this.overlay = scene.add.graphics().setScrollFactor(0).setDepth(99);

    // Death overlay text
    this.deathText = scene.add.text(
      scene.scale.width / 2,
      scene.scale.height / 2 - 40,
      'YOU DIED',
      {
        fontFamily: '"Georgia", serif',
        fontSize:   '56px',
        color:      '#cc2222',
        stroke:     '#000000',
        strokeThickness: 6,
        shadow: { offsetX: 0, offsetY: 4, color: '#880000', blur: 12, fill: true },
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(101).setAlpha(0);

    this.respawnText = scene.add.text(
      scene.scale.width / 2,
      scene.scale.height / 2 + 28,
      'Press  R  to Respawn',
      {
        fontFamily: 'monospace',
        fontSize:   '20px',
        color:      '#aaaacc',
        stroke:     '#000000',
        strokeThickness: 3,
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(101).setAlpha(0);
  }

  update(player: Player): void {
    // Damage flash
    if (player.hp < this.lastHp && !player.isDead) {
      this.flashAlpha = 0.35;
    }
    if (this.flashAlpha > 0) {
      this.flashAlpha -= 0.02;
      if (this.flashAlpha < 0) this.flashAlpha = 0;
    }

    if (player.hp !== this.lastHp || this.flashAlpha > 0) {
      this.lastHp = player.hp;
      this._draw(player);
    }
  }

  showDeathScreen(): void {
    // Dark overlay
    this.overlay.clear();
    this.overlay.fillStyle(0x000000, 0.72);
    this.overlay.fillRect(0, 0, this.scene.scale.width, this.scene.scale.height);

    // Fade in text
    this.scene.tweens.add({ targets: this.deathText,   alpha: 1, duration: 700, delay: 200 });
    this.scene.tweens.add({ targets: this.respawnText, alpha: 1, duration: 700, delay: 700 });
  }

  hideDeathScreen(): void {
    this.overlay.clear();
    this.deathText.setAlpha(0);
    this.respawnText.setAlpha(0);
  }

  // ── Private ──────────────────────────────────────────────────────────────────

  private _draw(player: Player): void {
    this.gfx.clear();

    // Damage flash
    if (this.flashAlpha > 0) {
      this.gfx.fillStyle(0xff0000, this.flashAlpha);
      this.gfx.fillRect(0, 0, this.scene.scale.width, this.scene.scale.height);
    }

    // HP panel background
    const totalW  = PLAYER_HP * (HEART_SIZE + HEART_GAP) - HEART_GAP + HUD_PADDING * 2;
    const totalH  = HEART_SIZE + HUD_PADDING * 2;
    this.gfx.fillStyle(0x000000, 0.5);
    this.gfx.fillRoundedRect(HUD_PADDING, HUD_PADDING, totalW, totalH, 6);

    // Hearts
    for (let i = 0; i < PLAYER_HP; i++) {
      const hx = HUD_PADDING * 2 + i * (HEART_SIZE + HEART_GAP);
      const hy = HUD_PADDING * 2;
      if (i < player.hp) {
        // Filled heart — red
        this._drawHeart(hx, hy, 0xee3333, 1.0);
      } else {
        // Empty heart — dark
        this._drawHeart(hx, hy, 0x333344, 0.8);
      }
    }

    // Attack cooldown pip (small bar under hearts)
    // (visual feedback for attack availability — purely cosmetic)
  }

  private _drawHeart(x: number, y: number, color: number, alpha: number): void {
    this.gfx.fillStyle(color, alpha);
    // Simple pixelated heart via two overlapping circles + diamond
    const s = HEART_SIZE / 2;
    this.gfx.fillCircle(x + s * 0.5, y + s * 0.55, s * 0.52);
    this.gfx.fillCircle(x + s * 1.5, y + s * 0.55, s * 0.52);
    this.gfx.fillTriangle(
      x,       y + s * 0.9,
      x + s*2, y + s * 0.9,
      x + s,   y + s * 2,
    );
  }
}
