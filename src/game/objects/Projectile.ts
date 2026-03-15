import Phaser from 'phaser';

export default class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'projectile');

    // Create a small circle texture for the projectile
    const graphics = scene.add.graphics();
    graphics.fillStyle(0xff0000, 1); // Red color
    graphics.fillCircle(5, 5, 5); // Radius: 5
    graphics.generateTexture('projectile', 10, 10);
    graphics.destroy();

    this.setTexture('projectile');

    // Initialize physics body
    scene.physics.add.existing(this);
    (this.body as Phaser.Physics.Arcade.Body).setSize(10, 10); // Match the texture size

    // Set initial velocity (will be updated when fired)
    this.setVelocity(0, 0);
  }

  // Method to fire the projectile in a given direction
  fire(x: number, y: number) {
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.setVelocity(0, -500); // Move upward
  }
}
