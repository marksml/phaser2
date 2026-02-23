import Phaser from 'phaser';

export default class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, '');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Create projectile shape
    const graphics = scene.add.graphics();
    graphics.fillStyle(0xffff00);
    graphics.fillRect(0, 0, 4, 10);
    graphics.generateTexture('projectile', 4, 10);
    graphics.destroy();

    this.setTexture('projectile');
    this.setVelocityY(-300);
  }
}