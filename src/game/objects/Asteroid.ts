import Phaser from 'phaser';

export default class Asteroid extends Phaser.Physics.Arcade.Sprite {
  size: number;
  points: number;

  constructor(scene: Phaser.Scene, x: number, y: number, size: number = 1) {
    super(scene, x, y, '');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.size = size;
    this.points = size * 10; // small: 10, medium: 20, large: 30? Wait, spec says small 10, medium 20, large 50

    // Adjust points
    if (size === 1) this.points = 10;
    else if (size === 2) this.points = 20;
    else if (size === 3) this.points = 50;

    // Create asteroid shape
    const radius = 10 * size;
    const graphics = scene.add.graphics();
    graphics.fillStyle(0x888888);
    graphics.fillCircle(radius, radius, radius);
    graphics.generateTexture(`asteroid${size}`, radius * 2, radius * 2);
    graphics.destroy();

    this.setTexture(`asteroid${size}`);
    this.setVelocityY(50 + Math.random() * 100); // random speed
  }
}