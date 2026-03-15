import Phaser from 'phaser';
import Asteroid from '../objects/Asteroid';
import Spaceship from '../objects/Spaceship';
import Projectile from '../objects/Projectile';
import ScoreSystem from '../systems/ScoreSystem';
import HealthSystem from '../systems/HealthSystem';

export default class GameScene extends Phaser.Scene {
  private asteroids!: Phaser.Physics.Arcade.Group;
  private spaceship!: Spaceship;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spacebar!: Phaser.Input.Keyboard.Key;
  private lastFired = 0; // Add a private property to track the last firing time
  private scoreSystem!: ScoreSystem;
  private healthSystem!: HealthSystem;

  constructor() {
    super('GameScene');
  }

  preload() {
    // Load the spaceship texture
    //this.load.image('spaceship', 'assets/spaceship.png'); // Replace with your texture path
    this.load.image('spaceship', 'assets/spaceships/10.png'); // Replace with your texture path

    // Load the asteroid texture atlas
    this.load.image('asteroids', 'assets/a.png'); // Replace with your texture atlas path

    this.load.image('projectile', 'assets/explosions/images/rocket_flame/rocket_1_0000.png'); // Replace with your projectile texture path

    this.load.image('background', 'assets/background/bg5.jpg'); // Replace with your background texture path
  }

  create() {
    // Add the background image and scale it to fit the screen
    const background = this.add.image(0, 0, 'background').setOrigin(0, 0);
    background.displayWidth = this.cameras.main.width;
    background.displayHeight = this.cameras.main.height;

    // Create a physics group for asteroids
    this.asteroids = this.physics.add.group();

    // Create a physics group for projectiles
    this.projectiles = this.physics.add.group();

    // Initialize the score system
    this.scoreSystem = new ScoreSystem(this);
    this.scoreSystem.reset();

    // Initialize the health system
    this.healthSystem = new HealthSystem(this);
    this.healthSystem.reset();

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
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Create spacebar key
    this.spacebar = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Set up collision between projectiles and asteroids
    this.physics.add.overlap(this.projectiles, this.asteroids, (p, a) => this.handleProjectileAsteroidCollision(p as Projectile, a as Asteroid), undefined, this);

    // Set up collision between spaceship and asteroids
    this.physics.add.overlap(this.spaceship, this.asteroids, (s, a) => this.handleSpaceshipAsteroidCollision(s as Spaceship, a as Asteroid), undefined, this);
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
    const wasDestroyed = asteroid.takeDamage(); // Apply damage to the asteroid
    if (wasDestroyed) {
      this.scoreSystem.addPoints(10);
    }
   
  }

  private handleSpaceshipAsteroidCollision(spaceshipObj: Spaceship, asteroidObj: Asteroid) {
    if (!spaceshipObj.active || !asteroidObj.active) {
      return;
    }

    const damaged = spaceshipObj.takeDamage(this);
    if (!damaged) {
      return; // Spaceship is invincible, ignore collision
    }

    // Explode the asteroid
    asteroidObj.explode(asteroidObj.x, asteroidObj.y);
    asteroidObj.disableBody(true, true);
    this.time.delayedCall(1000, () => {
      asteroidObj.destroy();
    });

    // Reduce health HUD
    const remaining = this.healthSystem.takeDamage();

    if (remaining === 0) {
      spaceshipObj.explode(this);
      this.time.delayedCall(700, () => {
        this.scene.start('GameOverScene', { score: this.scoreSystem.getScore() });
      });
    }
  }

  update(_time: number, _delta: number) {
    // Skip update if spaceship has been destroyed
    if (!this.spaceship.active) {
      return;
    }

    // Clean up asteroids that have passed the bottom of the screen
    [...this.asteroids.getChildren()].forEach((asteroid) => {
      if ((asteroid as Asteroid).y > this.scale.height + 50) {
        asteroid.destroy();
      }
    });

    // Handle spaceship movement based on cursor keys
    if (this.cursors.left.isDown) {
      this.spaceship.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.spaceship.setVelocityX(300);
    } else {
      this.spaceship.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.spaceship.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.spaceship.setVelocityY(300);
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
      
      const projectile1X = this.spaceship.x - 26; // Spawn slightly to the left of the spaceship
      const projectile1Y = this.spaceship.y - 20; // Spawn from the top of the spaceship
      const projectile1 = new Projectile(this, projectile1X, projectile1Y);
      
      const projectile2X = this.spaceship.x + 26; // Spawn slightly to the right of the spaceship
      const projectile2Y = this.spaceship.y - 20; // Spawn from the top of the spaceship
      const projectile2 = new Projectile(this, projectile2X, projectile2Y);
      
      this.projectiles.add(projectile1);
      this.add.existing(projectile1); // Add projectile to the scene
      projectile1.fire(projectile1X, projectile1Y);

      this.projectiles.add(projectile2);
      this.add.existing(projectile2); // Add projectile to the scene
      projectile2.fire(projectile2X, projectile2Y);
      
      this.lastFired = this.time.now;
    }
  }
}
