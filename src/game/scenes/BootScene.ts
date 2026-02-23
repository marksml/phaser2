import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // No assets to load - using graphics for placeholders
  }

  create() {
    this.scene.start('StartScene');
  }
}