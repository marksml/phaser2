import Phaser from 'phaser';

export default class VictoryScene extends Phaser.Scene {
  private totalScore: number = 0;

  constructor() {
    super('VictoryScene');
  }

  init(data: { totalScore: number }) {
    this.totalScore = data.totalScore;
  }

  create() {
    const { width, height } = this.cameras.main;

    // "You Win!" title
    this.add
      .text(width / 2, height / 2 - 100, 'You Win!', {
        fontSize: '48px',
        color: '#ffd700',
      })
      .setOrigin(0.5);

    // Total score
    this.add
      .text(width / 2, height / 2 - 40, `Total Score: ${this.totalScore}`, {
        fontSize: '32px',
        color: '#ffffff',
      })
      .setOrigin(0.5);

    // Play Again button
    const playAgainButton = this.add
      .text(width / 2, height / 2 + 50, 'Play Again', {
        fontSize: '32px',
        color: '#ffffff',
        backgroundColor: '#0000ff',
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive();

    playAgainButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}
