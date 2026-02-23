import Phaser from 'phaser';

export default class Asteroid extends Phaser.Physics.Arcade.Sprite {
  private radius: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Randomly select a frame from the atlas
    super(scene, x, y, 'asteroids'); // Use the loaded texture key
    // Scale the texture to half size
    this.setScale(0.1);

    this.radius = Phaser.Math.Between(10, 40);

    // Initialize physics body
    scene.physics.add.existing(this);
    this.body.setCircle(this.radius);

    // Set initial velocity
    this.setVelocityY(100); // Adjust speed as needed
  }

  // Method to handle damage
  takeDamage() {
    this.health--;
    if (this.health <= 0) {
      this.explode();
    }
  }

  private explode() {
    // Destroy the asteroid
    this.destroy();

    // Spawn smaller asteroid particles (optional implementation)
    // ...
  }
}
