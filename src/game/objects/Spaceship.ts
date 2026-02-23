import Phaser from 'phaser';

export default class Spaceship extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'spaceship'); // Use the loaded texture key

    // Scale the texture to half size
    this.setScale(0.7);

    // Initialize physics body
    scene.physics.add.existing(this);
    this.body.setSize(50, 30); // Keep the physics body size consistent with the original texture

    // Set initial velocity
    this.setVelocity(0, 0);
  }

  // Method to move the spaceship left
  moveLeft() {
    this.setVelocityX(-200); // Adjust speed as needed
  }

  // Method to move the spaceship right
  moveRight() {
    this.setVelocityX(200); // Adjust speed as needed
  }

  // Method to stop the spaceship
  stop() {
    this.setVelocityX(0);
  }

  // Method to set velocity directly
  setVelocity(x: number, y: number) {
    super.setVelocity(x, y);
  }
}
