import Phaser from 'phaser';

export default class Spaceship extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, textureKey: string = 'spaceship') {
    super(scene, x, y, textureKey); // Use the loaded texture key

    // Scale the texture to half size
    this.setScale(0.7);

    // Initialize physics body
    scene.physics.add.existing(this);
    (this.body as Phaser.Physics.Arcade.Body).setSize(50, 30); // Keep the physics body size consistent with the original texture

    // Set initial velocity
    this.setVelocity(0, 0);
  }

  // Method to move the spaceship left
  moveLeft() {
    this.setVelocityX(-300); // Adjust speed as needed
  }

  // Method to move the spaceship right
  moveRight() {
    this.setVelocityX(300); // Adjust speed as needed
  }

  // Method to stop the spaceship
  stop(): this {
    this.setVelocityX(0);
    return this;
  }

  // Method to set velocity directly
  setVelocity(x: number, y: number): this {
    super.setVelocity(x, y);
    return this;
  }

  private invincible = false;

  takeDamage(scene: Phaser.Scene): boolean {
    if (this.invincible) {
      return false;
    }
    this.invincible = true;
    const tween = scene.tweens.add({
      targets: this,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: -1,
    });
    scene.time.delayedCall(1000, () => {
      tween.stop();
      this.setAlpha(1);
      this.invincible = false;
    });
    return true;
  }

  explode(scene: Phaser.Scene): void {
    const emitter = scene.add.particles(this.x, this.y, this.texture.key, {
      speed: { min: 150, max: 300 },
      angle: { min: 0, max: 360 },
      lifespan: 400,
      alpha: { start: 1.0, end: 0.0 },
      scale: { start: this.scale * 0.5, end: 0 },
      quantity: 15,
      frequency: 0,
      emitting: true,
    });
    scene.time.delayedCall(150, () => {
      emitter.stop();
      scene.time.delayedCall(350, () => {
        emitter.destroy();
      });
    });
    this.disableBody(true, true);
    scene.time.delayedCall(600, () => {
      this.destroy();
    });
  }
}
