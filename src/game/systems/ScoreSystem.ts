import Phaser from 'phaser';

export default class ScoreSystem {
  private score = 0;
  private scoreText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scoreText = scene.add.text(10, 10, 'Scores : 0', {
      fontSize: '24px',
      color: '#ffffff'
    });
  }

  reset() {
    this.score = 0;
    this.updateText();
  }

  addPoints(points: number) {
    this.score += points;
    this.updateText();
  }

  getScore(): number {
    return this.score;
  }

  private updateText() {
    this.scoreText.setText(`Scores : ${this.score}`);
  }
}
