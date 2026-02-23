import Phaser from 'phaser';
import Player from '../objects/Player';
import Asteroid from '../objects/Asteroid';
import Projectile from '../objects/Projectile';
import ScoreSystem from '../systems/ScoreSystem';

export default class GameScene extends Phaser.Scene {
  player!: Player;
  asteroids!: Phaser.Physics.Arcade.Group;
  projectiles!: Phaser.Physics.Arcade.Group;
  scoreSystem!: ScoreSystem;
  lastFired: number = 0;
  spawnTimer: number = 0;
  difficulty: number = 1;

  constructor() {
    super('GameScene');
  }

  create() {
    const { width, height } = this.cameras.main;

    // Create player
    this.player = new Player(this, width / 2, height - 100);

    // Create groups
    this.asteroids = this.physics.add.group();
    this.projectiles = this.physics.add.group();

    // Score system
    this.scoreSystem = new ScoreSystem(this);

    // Collisions
    this.physics.add.collider(this.player, this.asteroids, this.gameOver, undefined, this);
    this.physics.add.overlap(this.projectiles, this.asteroids, this.hitAsteroid, undefined, this);

    // Input
    this.input.on('pointerdown', this.fireProjectile, this);
  }

  update(time: number, delta: number) {
    // Update player
    this.player.update(this.input.activePointer);

    // Auto fire
    if (time > this.lastFired + 500) {
      this.fireProjectile();
      this.lastFired = time;
    }

    // Spawn asteroids
    this.spawnTimer += delta;
    if (this.spawnTimer > 2000 / this.difficulty) { // spawn rate increases with difficulty
      this.spawnAsteroid();
      this.spawnTimer = 0;
    }

    // Increase difficulty
    this.difficulty += delta / 30000; // increase every 30 seconds

    // Remove off-screen projectiles and asteroids
    this.projectiles.children.entries.forEach((proj: any) => {
      if (proj.y < 0) proj.destroy();
    });
    this.asteroids.children.entries.forEach((ast: any) => {
      if (ast.y > this.cameras.main.height) ast.destroy();
    });
  }

  spawnAsteroid() {
    const x = Math.random() * this.cameras.main.width;
    const size = Math.floor(Math.random() * 3) + 1; // 1,2,3
    const asteroid = new Asteroid(this, x, 0, size);
    this.asteroids.add(asteroid);
  }

  fireProjectile() {
    const projectile = new Projectile(this, this.player.x, this.player.y - 20);
    this.projectiles.add(projectile);
  }

  hitAsteroid(projectile: Projectile, asteroid: Asteroid) {
    projectile.destroy();
    asteroid.destroy();
    this.scoreSystem.addPoints(asteroid.points);
  }

  gameOver() {
    this.scene.start('GameOverScene', { score: this.scoreSystem.getScore() });
  }
}