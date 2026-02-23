export default class ScoreSystem {
  score: number = 0;
  scoreText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scoreText = scene.add.text(10, 10, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff'
    });
  }

  addPoints(points: number) {
    this.score += points;
    this.scoreText.setText(`Score: ${this.score}`);
  }

  getScore(): number {
    return this.score;
  }
}