import Phaser from 'phaser';
import { PreloadScene } from './scenes/PreloadScene';
import { GameScene }    from './scenes/GameScene';
import { GAME_WIDTH, GAME_HEIGHT, GRAVITY } from './constants';

new Phaser.Game({
  type: Phaser.AUTO,
  width:  GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game',
  backgroundColor: '#0d0d1a',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: GRAVITY },
      debug: false,
    },
  },
  scene: [PreloadScene, GameScene],
});
