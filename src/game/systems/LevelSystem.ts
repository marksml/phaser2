import Phaser from 'phaser';

export interface LevelConfig {
  level: number;
  asteroidSpawnInterval: number;
  asteroidSpeed: number;
  asteroidHealth: number;
  scoreToAdvance: number | null;
  survivalTime: number | null;
}

const LEVELS: LevelConfig[] = [
  { level: 1, asteroidSpawnInterval: 2000, asteroidSpeed: 100, asteroidHealth: 10, scoreToAdvance: 50, survivalTime: null },
  { level: 2, asteroidSpawnInterval: 2000, asteroidSpeed: 150, asteroidHealth: 13, scoreToAdvance: 200, survivalTime: null },
  { level: 3, asteroidSpawnInterval: 1500, asteroidSpeed: 200, asteroidHealth: 15, scoreToAdvance: null, survivalTime: 60000 },
];

export default class LevelSystem {
  private currentLevelIndex = 0;
  private levelText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.levelText = scene.add
      .text(scene.scale.width - 10, 10, 'Level: 1', {
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(1, 0)
      .setDepth(10);
  }

  getCurrentLevel(): LevelConfig {
    return LEVELS[this.currentLevelIndex];
  }

  advance(): LevelConfig | null {
    this.currentLevelIndex++;
    if (this.currentLevelIndex < LEVELS.length) {
      this.levelText.setText(`Level: ${this.getLevelNumber()}`);
      return LEVELS[this.currentLevelIndex];
    }
    return null;
  }

  isLastLevel(): boolean {
    return this.getCurrentLevel().scoreToAdvance === null;
  }

  getLevelNumber(): number {
    return this.currentLevelIndex + 1;
  }

  reset() {
    this.currentLevelIndex = 0;
    this.levelText.setText('Level: 1');
  }

  destroy() {
    this.levelText.destroy();
  }
}
