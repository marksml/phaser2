import Phaser from 'phaser';

export default class Asteroid extends Phaser.Physics.Arcade.Sprite {
  private scale: number;
  private health: number = 10; // Initialize health here

  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Randomly select a frame from the atlas
    super(scene, x, y, 'asteroids'); // Use the loaded texture key
    // Scale the texture to half size
    
    this.scale = Phaser.Math.Between(1, 4)/10; // Random scale between 0.1 and 0.4
    this.setScale(this.scale);

    // Initialize physics body
    scene.physics.add.existing(this);
    
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
