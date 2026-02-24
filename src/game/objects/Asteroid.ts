import Phaser from 'phaser';

export default class Asteroid extends Phaser.Physics.Arcade.Sprite {
  private radius: number;
  private health: number = 3; // Initialize health here

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
    console.log(`Asteroid health: ${this.health}`);
    if (this.health <= 0) {
      this.explode();
    }
  }

  private explode() {
    // Disable the physics body
    if (this.body) {
      this.body.enable = false;
    }

    
    // Remove the asteroid
    this.setActive(false);
    this.setVisible(false);
    this.destroy();
  }
}
