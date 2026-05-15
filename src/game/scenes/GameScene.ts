import Phaser from 'phaser';
import Asteroid from '../objects/Asteroid';
import Spaceship from '../objects/Spaceship';
import Projectile from '../objects/Projectile';
import ScoreSystem from '../systems/ScoreSystem';
import HealthSystem from '../systems/HealthSystem';
import LevelSystem from '../systems/LevelSystem';

export default class GameScene extends Phaser.Scene {
  private asteroids!: Phaser.Physics.Arcade.Group;
  private spaceship!: Spaceship;
  private projectiles!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private spacebar!: Phaser.Input.Keyboard.Key;
  private lastFired = 0; // Add a private property to track the last firing time
  private scoreSystem!: ScoreSystem;
  private healthSystem!: HealthSystem;
  private levelSystem!: LevelSystem;
  private totalScore: number = 0;
  private spawnTimer!: Phaser.Time.TimerEvent;
  private isTransitioning: boolean = false;
  private survivalTimeText?: Phaser.GameObjects.Text;

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
    // Reset per-game state
    this.totalScore = 0;
    this.isTransitioning = false;
    this.survivalTimeText = undefined;

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

    // Initialize the level system
    this.levelSystem = new LevelSystem(this);

    const currentLevel = this.levelSystem.getCurrentLevel();

    // Spawn an initial asteroid
    this.spawnAsteroid();

    // Set up a timer to spawn asteroids using the current level's interval
    this.spawnTimer = this.time.addEvent({
      delay: currentLevel.asteroidSpawnInterval,
      callback: this.spawnAsteroid,
      callbackScope: this,
      loop: true,
    });

    // Start survival timer if this is the final level
    if (currentLevel.survivalTime !== null) {
      this.startSurvivalTimer(currentLevel.survivalTime);
    }

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
    const level = this.levelSystem.getCurrentLevel();
    const asteroid = new Asteroid(this, x, 0, level.asteroidHealth);
    this.asteroids.add(asteroid); // Add to the physics group
    this.add.existing(asteroid); // Ensure the asteroid is added to the display list

    // Set velocity using the current level's asteroid speed
    asteroid.setVelocityY(level.asteroidSpeed);
  }

  private handleProjectileAsteroidCollision(projectile: Projectile, asteroid: Asteroid) {
    // Debugging: Log collision detection
    console.log('Collision detected between projectile and asteroid!');

    projectile.destroy(); // Destroy the projectile
    const wasDestroyed = asteroid.takeDamage(); // Apply damage to the asteroid
    if (wasDestroyed) {
      this.scoreSystem.addPoints(10);

      if (!this.isTransitioning) {
        const level = this.levelSystem.getCurrentLevel();
        if (!this.levelSystem.isLastLevel() && level.scoreToAdvance !== null && this.scoreSystem.getScore() >= level.scoreToAdvance) {
          this.startLevelTransition();
        }
      }
    }
  }

  private handleSpaceshipAsteroidCollision(spaceshipObj: Spaceship, asteroidObj: Asteroid) {
    if (this.isTransitioning || !spaceshipObj.active || !asteroidObj.active) {
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

  private startLevelTransition() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    this.totalScore += this.scoreSystem.getScore();

    // Pause physics and input
    this.physics.pause();
    this.input.keyboard!.enabled = false;

    // Stop spawn timer
    this.spawnTimer.remove(false);

    // Clear all asteroids and projectiles
    this.asteroids.clear(true, true);
    this.projectiles.clear(true, true);

    const { width, height } = this.cameras.main;
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7).setDepth(20);

    const currentLevelNum = this.levelSystem.getLevelNumber();
    const levelCompleteText = this.add
      .text(width / 2, height / 2, `Level ${currentLevelNum} Complete!`, {
        fontSize: '48px',
        color: '#ffffff',
      })
      .setOrigin(0.5)
      .setDepth(21);

    this.time.delayedCall(1500, () => {
      levelCompleteText.destroy();

      const nextConfig = this.levelSystem.advance();
      if (nextConfig === null) {
        // All levels exhausted — go to victory (safety fallback)
        overlay.destroy();
        this.scene.start('VictoryScene', { totalScore: this.totalScore });
        return;
      }

      const nextLevelNum = this.levelSystem.getLevelNumber();
      const getReadyText = this.add
        .text(width / 2, height / 2, `Level ${nextLevelNum}\nGet Ready!`, {
          fontSize: '48px',
          color: '#ffffff',
          align: 'center',
        })
        .setOrigin(0.5)
        .setDepth(21);

      this.time.delayedCall(1500, () => {
        getReadyText.destroy();
        overlay.destroy();

        // Reset systems for the new level
        this.scoreSystem.reset();
        this.healthSystem.reset();

        // Recreate spawn timer with new level's interval
        this.spawnTimer = this.time.addEvent({
          delay: nextConfig.asteroidSpawnInterval,
          callback: this.spawnAsteroid,
          callbackScope: this,
          loop: true,
        });

        // Start survival timer if the new level is the final level
        if (nextConfig.survivalTime !== null) {
          this.startSurvivalTimer(nextConfig.survivalTime);
        }

        // Resume physics and input
        this.physics.resume();
        this.input.keyboard!.resetKeys();
        this.input.keyboard!.enabled = true;
        this.isTransitioning = false;
      });
    });
  }

  private startSurvivalTimer(duration: number) {
    const { width } = this.cameras.main;
    let remaining = Math.ceil(duration / 1000);

    this.survivalTimeText = this.add
      .text(width - 10, 44, `Time: ${remaining}s`, {
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(1, 0)
      .setDepth(10);

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        remaining--;
        if (this.survivalTimeText) {
          this.survivalTimeText.setText(`Time: ${remaining}s`);
        }
      },
      repeat: remaining - 1,
    });

    this.time.delayedCall(duration, () => {
      if (this.survivalTimeText) {
        this.survivalTimeText.destroy();
        this.survivalTimeText = undefined;
      }
      this.scene.start('VictoryScene', {
        totalScore: this.totalScore + this.scoreSystem.getScore(),
      });
    });
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

