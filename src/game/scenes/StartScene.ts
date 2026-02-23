import Phaser from 'phaser';

export default class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Title
    this.add.text(width / 2, height / 2 - 100, 'Asteroid Escape', {
      fontSize: '48px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Start button
    const startButton = this.add.text(width / 2, height / 2 + 50, 'Start', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#0000ff',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setInteractive();

    startButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}