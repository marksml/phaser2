import Phaser from 'phaser';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Create simple ship shape
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x00ff00);
    graphics.fillTriangle(0, -10, -5, 10, 5, 10);
    graphics.generateTexture('player', 10, 20);
    graphics.destroy();

    this.setTexture('player');
    this.setCollideWorldBounds(true);
  }

  update(pointer: Phaser.Input.Pointer) {
    // Move to touch position, but only horizontally in lower half
    if (pointer.isDown) {
      this.x = Phaser.Math.Clamp(pointer.x, this.width / 2, this.scene.cameras.main.width - this.width / 2);
    }
  }
}