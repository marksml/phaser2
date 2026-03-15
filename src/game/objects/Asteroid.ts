import Phaser from 'phaser';

export default class Asteroid extends Phaser.Physics.Arcade.Sprite {
  private health = 10;
  private isDying = false;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'asteroids');
    
    const asteroidScale = Phaser.Math.Between(1, 4) / 10;
    this.setScale(asteroidScale);

    scene.physics.add.existing(this);

    this.setVelocityY(100);
  }

  takeDamage(): boolean {
    if (this.health <= 0 || this.isDying) {
      return false;
    }

    this.health--;
    if (this.health <= 0) {
      this.isDying = true;
      const { x, y } = this;
      this.disableBody(true, true);
      this.explode(x, y);
      this.scene.time.delayedCall(1000, () => {
        this.destroy();
      });
      return true;
    }
    return false;
  }

  public explode(x: number, y: number) {
    const emitter = this.scene.add.particles(x, y, 'asteroids', {
      speed: { min: 220, max: 220 },
      angle: { min: 0, max: 360 },
      lifespan: 250,
      alpha: { start: 1.0, end: 0.5 },
      scale: { start: this.scale * 0.25, end: this.scale * 0.01 },
      quantity: 10,
      frequency: 0,
      emitting: true,
    });

    this.scene.time.delayedCall(100, () => {
      emitter.stop();
      this.scene.time.delayedCall(300, () => {
        emitter.destroy();
      });
    });
  }
}
