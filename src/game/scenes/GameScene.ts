import Phaser from 'phaser';
import Asteroid from '../objects/Asteroid';
import Spaceship from '../objects/Spaceship';
import Projectile from '../objects/Projectile';

export default class GameScene extends Phaser.Scene {
  private asteroids!: Phaser.Physics.Arcade.Group;
  private spaceship!: Spaceship;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spacebar!: Phaser.Input.Keyboard.Key;
  private lastFired = 0; // Add a private property to track the last firing time

  constructor() {
    super('GameScene');
  }

  preload() {
    // Load the spaceship texture
    this.load.image('spaceship', 'assets/spaceship.png'); // Replace with your texture path

    // Load the asteroid texture atlas
    this.load.image('asteroids', 'assets/a.png'); // Replace with your texture atlas path

    this.load.image('projectile', 'assets/explosions/images/rocket_flame/rocket_1_0000.png'); // Replace with your projectile texture path
  }

  create() {
    this.cameras.main.setBackgroundColor('#000000'); // Black background

    // Create a physics group for asteroids
    this.asteroids = this.physics.add.group();

    // Create a physics group for projectiles
    this.projectiles = this.physics.add.group();

    // Spawn an initial asteroid
    this.spawnAsteroid();

    // Set up a timer to spawn asteroids every 3 seconds
    this.time.addEvent({
      delay: 3000,
      callback: this.spawnAsteroid,
      callbackScope: this,
      loop: true,
    });

    // Create the spaceship in the middle of the screen
    const screenCenterX = this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.height / 2;
    this.spaceship = new Spaceship(this, screenCenterX, screenCenterY);
    this.add.existing(this.spaceship); // Add spaceship to the scene

    // Create cursor keys
    this.cursors = this.input.keyboard.createCursorKeys();

    // Create spacebar key
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Set up collision between projectiles and asteroids
    this.physics.add.overlap(this.projectiles, this.asteroids, this.handleProjectileAsteroidCollision, undefined, this);
  }

  private spawnAsteroid() {
    const x = Phaser.Math.Between(0, this.cameras.main.width);
    const asteroid = new Asteroid(this, x, 0);
    this.asteroids.add(asteroid); // Add to the physics group
    this.add.existing(asteroid); // Ensure the asteroid is added to the display list

    // Set velocity to make the asteroid move downward
    asteroid.setVelocityY(100); // Adjust the speed as needed
  }

  private handleProjectileAsteroidCollision(projectile: Projectile, asteroid: Asteroid) {
    // Debugging: Log collision detection
    console.log('Collision detected between projectile and asteroid!');

    projectile.destroy(); // Destroy the projectile
    asteroid.takeDamage(); // Apply damage to the asteroid

     // Optional: Add a visual effect (e.g., flash the asteroid)
    this.tweens.add({
      targets: asteroid,
      alpha: 0.5,
      duration: 100,
      yoyo: true,
      repeat: 1,
    });
  }

  update(time: number, delta: number) {
    // Handle spaceship movement based on cursor keys
    if (this.cursors.left.isDown) {
      this.spaceship.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.spaceship.setVelocityX(200);
    } else {
      this.spaceship.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.spaceship.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.spaceship.setVelocityY(200);
    } else {
      this.spaceship.setVelocityY(0);
    }

    // Handle projectile firing
    if (this.spacebar.isDown) {
      this.fireProjectile();
    }

    // Keep spaceship within bounds
    const { width, height } = this.cameras.main;
    const halfSpaceshipWidth = this.spaceship.width / 2;
    const halfSpaceshipHeight = this.spaceship.height / 2;

    // Clamp the spaceship's position
    this.spaceship.x = Phaser.Math.Clamp(this.spaceship.x, halfSpaceshipWidth, width - halfSpaceshipWidth);
    this.spaceship.y = Phaser.Math.Clamp(this.spaceship.y, halfSpaceshipHeight, height - halfSpaceshipHeight);

    // Game loop code will go here
  }

  private fireProjectile() {
    // Add a cooldown to control firing rate
    const firingRate = 100; // milliseconds
    if (this.time.now > this.lastFired + firingRate) {
      const projectileX = this.spaceship.x;
      const projectileY = this.spaceship.y - 20; // Spawn from the top of the spaceship
      const projectile = new Projectile(this, projectileX, projectileY);
      this.projectiles.add(projectile);
      this.add.existing(projectile); // Add projectile to the scene
      projectile.fire(projectileX, projectileY);
      this.lastFired = this.time.now;
    }
  }
}