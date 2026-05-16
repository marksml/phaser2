import Phaser from 'phaser';

export default class HealthSystem {
  private health = 10;
  private static readonly MAX_HEALTH = 10;
  private heartTexts: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene) {
    for (let i = 0; i < HealthSystem.MAX_HEALTH; i++) {
      const heart = scene.add
        .text(10 + i * 26, 44, '❤', {
          fontSize: '24px',
          color: '#ff0000',
        })
        .setDepth(10);
      this.heartTexts.push(heart);
    }
  }

  takeDamage(): number {
    if (this.health <= 0) {
      return 0;
    }
    this.health--;
    this.heartTexts[this.health].setText('♡').setColor('#555555');
    return this.health;
  }

  reset() {
    this.health = HealthSystem.MAX_HEALTH;
    this.heartTexts.forEach((heart) => {
      heart.setText('❤').setColor('#ff0000');
    });
  }

  getHealth(): number {
    return this.health;
  }

  /** Test-only: drain all health to zero and update HUD. */
  drainAll(): void {
    while (this.health > 0) {
      this.takeDamage();
    }
  }
}
