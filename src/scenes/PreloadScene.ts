import Phaser from 'phaser';
import { FRAME_W, FRAME_H } from '../constants';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    // ── Loading bar ──────────────────────────────────────────────────────────
    const { width, height } = this.scale;
    const barW = 320, barH = 12;
    const barX = (width - barW) / 2;
    const barY = height / 2;

    const bg  = this.add.graphics();
    const bar = this.add.graphics();
    bg.fillStyle(0x222233).fillRect(barX - 2, barY - 2, barW + 4, barH + 4);

    this.load.on('progress', (v: number) => {
      bar.clear();
      bar.fillStyle(0x6ee7b7).fillRect(barX, barY, barW * v, barH);
    });

    const label = this.add.text(width / 2, barY - 24, 'LOADING…', {
      fontFamily: 'monospace', fontSize: '14px', color: '#aaaacc',
    }).setOrigin(0.5);
    void label;

    // ── Soldier sprites ───────────────────────────────────────────────────────
    this.load.spritesheet('soldier-idle',   'assets/sprites/Soldier_Idle.png',   { frameWidth: FRAME_W, frameHeight: FRAME_H });
    this.load.spritesheet('soldier-walk',   'assets/sprites/Soldier_Walk.png',   { frameWidth: FRAME_W, frameHeight: FRAME_H });
    this.load.spritesheet('soldier-attack', 'assets/sprites/Soldier_Attack01.png',{ frameWidth: FRAME_W, frameHeight: FRAME_H });
    this.load.spritesheet('soldier-hurt',   'assets/sprites/Soldier_Hurt.png',   { frameWidth: FRAME_W, frameHeight: FRAME_H });
    this.load.spritesheet('soldier-death',  'assets/sprites/Soldier_Death.png',  { frameWidth: FRAME_W, frameHeight: FRAME_H });

    // ── Orc sprites ────────────────────────────────────────────────────────────
    this.load.spritesheet('orc-idle',   'assets/sprites/Orc_Idle.png',   { frameWidth: FRAME_W, frameHeight: FRAME_H });
    this.load.spritesheet('orc-walk',   'assets/sprites/Orc_Walk.png',   { frameWidth: FRAME_W, frameHeight: FRAME_H });
    this.load.spritesheet('orc-attack', 'assets/sprites/Orc_Attack01.png',{ frameWidth: FRAME_W, frameHeight: FRAME_H });
    this.load.spritesheet('orc-hurt',   'assets/sprites/Orc_Hurt.png',   { frameWidth: FRAME_W, frameHeight: FRAME_H });
    this.load.spritesheet('orc-death',  'assets/sprites/Orc_Death.png',  { frameWidth: FRAME_W, frameHeight: FRAME_H });
  }

  create(): void {
    this._buildAnims();
    this.scene.start('GameScene');
  }

  private _buildAnims(): void {
    const a = this.anims;

    // Soldier
    a.create({ key: 'soldier-idle',   frames: a.generateFrameNumbers('soldier-idle',   { start: 0, end: 5 }), frameRate: 8,  repeat: -1 });
    a.create({ key: 'soldier-run',    frames: a.generateFrameNumbers('soldier-walk',   { start: 0, end: 7 }), frameRate: 10, repeat: -1 });
    a.create({ key: 'soldier-attack', frames: a.generateFrameNumbers('soldier-attack', { start: 0, end: 5 }), frameRate: 14, repeat: 0  });
    a.create({ key: 'soldier-hurt',   frames: a.generateFrameNumbers('soldier-hurt',   { start: 0, end: 2 }), frameRate: 10, repeat: 0  });
    a.create({ key: 'soldier-death',  frames: a.generateFrameNumbers('soldier-death',  { start: 0, end: 3 }), frameRate: 7,  repeat: 0  });

    // Orc
    a.create({ key: 'orc-idle',   frames: a.generateFrameNumbers('orc-idle',   { start: 0, end: 5 }), frameRate: 7,  repeat: -1 });
    a.create({ key: 'orc-walk',   frames: a.generateFrameNumbers('orc-walk',   { start: 0, end: 7 }), frameRate: 9,  repeat: -1 });
    a.create({ key: 'orc-attack', frames: a.generateFrameNumbers('orc-attack', { start: 0, end: 5 }), frameRate: 12, repeat: 0  });
    a.create({ key: 'orc-hurt',   frames: a.generateFrameNumbers('orc-hurt',   { start: 0, end: 2 }), frameRate: 10, repeat: 0  });
    a.create({ key: 'orc-death',  frames: a.generateFrameNumbers('orc-death',  { start: 0, end: 3 }), frameRate: 7,  repeat: 0  });
  }
}
