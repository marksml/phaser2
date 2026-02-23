import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  score: number = 0;

  constructor() {
    super('GameOverScene');
  }

  init(data: { score: number }) {
    this.score = data.score;
  }

  create() {
    const { width, height } = this.cameras.main;

    // Game Over text
    this.add.text(width / 2, height / 2 - 100, 'Game Over', {
      fontSize: '48px',
      color: '#ff0000'
    }).setOrigin(0.5);

    // Score
    this.add.text(width / 2, height / 2 - 50, `Score: ${this.score}`, {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Retry button
    const retryButton = this.add.text(width / 2, height / 2 + 50, 'Retry', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#0000ff',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    retryButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}