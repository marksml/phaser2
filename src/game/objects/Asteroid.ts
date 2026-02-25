import Phaser from 'phaser';

export default class Asteroid extends Phaser.Physics.Arcade.Sprite {
  private scale: number;
  private health: number = 10; // Initialize health here
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    // Randomly select a frame from the atlas
    super(scene, x, y, 'asteroids'); // Use the loaded texture key
    // Scale the texture to half size
    
    this.scale = Phaser.Math.Between(1, 4)/10; // Random scale between 0.1 and 0.4
    this.setScale(this.scale);

    // Initialize physics body
    scene.physics.add.existing(this);
    
    // Set initial velocity
    this.setVelocityY(100); // Adjust speed as needed
  }

  // Method to handle damage
  takeDamage() {
    if(this.health > 0) {
      this.health--;
      console.log(`Asteroid health: ${this.health}`);
      if (this.health <= 0) {
        this.explode();
        this.destroy(); // Destroy the asteroid when health is depleted
      }
    }
  }

  private explode() {
    // Get the game object from the scene
    // Assuming 'this' refers to an object that has a 'scene' property,
    // and that scene has a 'game' property (common in Phaser 3 Game Objects).
    const scene = this.scene;

    // CRITICAL DEBUGGING STEP: Log the asteroid's position
    console.log(`Asteroid exploding at: x=${this.x}, y=${this.y}`);


    // Define the texture key for your particles.
    // You need to have loaded a texture (e.g., an image or a sprite sheet)
    // with the key 'particle' in your Preload scene.
    const particleTextureKey = 'asteroids'; // Replace with your actual particle texture key
    
    // If 'particle' is a sprite sheet or atlas, you can specify frames.
    // Otherwise, if it's a single image, you can omit the 'frame' property or set it to 0.
    //const particleFrames = [0, 1, 2, 3, 4]; // Example: using specific frames from a sprite sheet
    
    // The emitter configuration object
    let emitterConfig = {
      // --- Basic Emitter Properties ---
      //x: this.x,   // Emitter's initial X position (where the asteroid exploded)
      //y: this.y,   // Emitter's initial Y position
      
      // 'frame' property defines which texture frame(s) to use for the particles.
      // Can be a single frame name/index, or an array for random selection.
      //frame: particleFrames,   

      // --- Particle Behavior ---
      // speed: How fast particles move.
      // Using min/max creates varied speeds for a more organic explosion.
      speed: { min: 100, max: 300 }, 
      
      // angle: Direction of emission. 
      // 0-360 degrees for a full radial explosion.
      angle: { min: 0, max: 360 }, 

      // lifespan: How long each particle exists in milliseconds.
      lifespan: 100, // Particles will last for 1.5 seconds

      // gravityX, gravityY: Apply gravity to particles. 
      // Set to 0 for no gravity, or provide values for falling/drifting effects.
      gravityX: 0,             
      gravityY: 0,             

      // --- Visual Effects ---
      // alpha: Controls particle transparency over their lifespan.
      // Starts opaque (1) and fades to transparent (0).
      alpha: { start: 1, end: 0 }, 
      
      // scale: Controls particle size over their lifespan.
      // Starts at 0.5 (half size) and shrinks to 0.1 (very small).
      scale: { start: 0.01, end: 0.01 }, 

      // blendMode: How particles blend with the background.
      // Phaser.BlendModes.ADD often creates a nice glowing effect.
      //blendMode: Phaser.BlendModes.ADD,

      // --- Emission Control for an Explosion ---
      // quantity: The number of particles to emit in a single burst.
      // This is crucial for your requirement of 2 particles on start.
      quantity: 2,             

      // frequency: How often new particles are emitted (in ms) when in 'flow' mode.
      // Set to 0 for an 'explode' effect (a single, instant burst of 'quantity' particles).
      frequency: 0,            

      // Optional: emitZone defines the area from which particles originate.
      // A small circle at the asteroid's center for a compact explosion.
      // emitZone: { type: 'random', source: new Phaser.Geom.Circle(0, 0, 5) }

      emitting: false,
      duration: 500 // Duration of the explosion effect (in ms)
    };
    
    // Create a particle emitter manager. This manager holds and controls emitters.
    // The 'particleTextureKey' is the key of the texture loaded into the game.
    //let particlesManager =  
    
    // Create an emitter from the manager using the defined configuration.
    let emitter = scene.add.particles(this.x, this.y, particleTextureKey, emitterConfig);

    // Since `frequency` is 0 and `quantity` is set, calling `start()` will
    // immediately emit the specified number of particles (2 in this case) once.
    emitter.start(); 

    
    // Optional: To clean up the emitter after its particles have died,
    // you might want to stop and then destroy the manager or emitter after the lifespan.
    // For simplicity, we'll let it run its course for now.
  }
}
