import Phaser from 'phaser';
import BootScene from './game/scenes/BootScene';
import StartScene from './game/scenes/StartScene';
import GameScene from './game/scenes/GameScene';
import GameOverScene from './game/scenes/GameOverScene';
import VictoryScene from './game/scenes/VictoryScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game',
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false
    }
  },
  scene: [BootScene, StartScene, GameScene, GameOverScene, VictoryScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);