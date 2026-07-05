import Phaser from 'phaser';

export class InputController {
  left        = false;
  right       = false;
  jumpPressed = false;
  attackJustPressed = false;

  private cursors:   Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA:      Phaser.Input.Keyboard.Key;
  private keyD:      Phaser.Input.Keyboard.Key;
  private keyW:      Phaser.Input.Keyboard.Key;
  private keySpace:  Phaser.Input.Keyboard.Key;
  private keyZ:      Phaser.Input.Keyboard.Key;
  private keyJ:      Phaser.Input.Keyboard.Key;

  // track previous attack state for JustDown detection
  private _prevAttack = false;

  constructor(scene: Phaser.Scene) {
    this.cursors  = scene.input.keyboard!.createCursorKeys();
    this.keyA     = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD     = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW     = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keySpace = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyZ     = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.keyJ     = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.J);
  }

  update(): void {
    this.left  = this.cursors.left.isDown  || this.keyA.isDown;
    this.right = this.cursors.right.isDown || this.keyD.isDown;
    this.jumpPressed = (
      Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.keyW)       ||
      Phaser.Input.Keyboard.JustDown(this.keySpace)
    );

    const attackNow = this.keyZ.isDown || this.keyJ.isDown;
    this.attackJustPressed = attackNow && !this._prevAttack;
    this._prevAttack = attackNow;
  }
}
