import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as PIXI from 'pixi.js';
import { Platform } from './Platform';

export class Player {
  public sprite: PIXI.Container;
  public model: THREE.Group | null = null;
  public x: number;
  public y: number;
  public velocityX: number = 0;
  public velocityY: number = 0;
  private speed: number = 5;
  private jumpPower: number = 15;
  private gravity: number = 0.8;
  private isOnGround: boolean = false;
  private keys: { [key: string]: boolean } = {};
  private mixer: THREE.AnimationMixer | null = null;

  constructor(x: number, y: number, scene: THREE.Scene, onModelLoaded?: () => void) {
    this.x = x;
    this.y = y;

    // Create a container for positioning
    this.sprite = new PIXI.Container();
    this.sprite.x = x;
    this.sprite.y = y;

    // Load the dragon model
    this.loadDragonModel(scene, onModelLoaded);

    // Setup keyboard controls
    this.setupControls();
  }

  private loadDragonModel(scene: THREE.Scene, onModelLoaded?: () => void): void {
    const loader = new GLTFLoader();
    const dragonUrl = 'https://gamecraft.integration.pp.frogmind.com/assets/models/b24132fd-534e-4deb-b6c8-354c09f20136.glb';

    console.log('Loading dragon model from:', dragonUrl);

    loader.load(
      dragonUrl,
      (gltf) => {
        this.model = gltf.scene;
        
        // Scale the dragon to be much larger
        this.model.scale.set(3.0, 3.0, 3.0);
        this.model.rotation.y = Math.PI / 2; // Face right initially
        
        // Add a small tilt for better visibility
        this.model.rotation.x = -0.2;
        
        // Position the model
        this.updateModelPosition();
        
        scene.add(this.model);
        
        console.log('✅ Dragon model loaded successfully!');
        console.log('Dragon position:', this.model.position);
        console.log('Dragon scale:', this.model.scale);

        // Setup animations if available
        if (gltf.animations && gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(this.model);
          console.log(`Found ${gltf.animations.length} animations`);
          gltf.animations.forEach((clip) => {
            const action = this.mixer!.clipAction(clip);
            action.play();
          });
        }

        if (onModelLoaded) onModelLoaded();
      },
      (progress) => {
        const percent = (progress.loaded / progress.total * 100).toFixed(2);
        console.log('Loading dragon:', percent + '%');
      },
      (error) => {
        console.error('❌ Error loading dragon model:', error);
      }
    );
  }

  private updateModelPosition(): void {
    if (this.model) {
      // Convert 2D position to 3D position
      // Map X from 0-800 to -20 to 20
      // Map Y from 0-600 to 15 to -15 (invert Y)
      this.model.position.x = (this.x - 400) / 20;
      this.model.position.y = -(this.y - 300) / 20;
      this.model.position.z = 0;
    }
  }

  private setupControls(): void {
    window.addEventListener('keydown', (e) => {
      this.keys[e.key] = true;
      
      // Jump
      if ((e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') && this.isOnGround) {
        this.velocityY = -this.jumpPower;
        this.isOnGround = false;
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.key] = false;
    });
  }

  update(delta: number): void {
    // Horizontal movement
    if (this.keys['ArrowLeft'] || this.keys['a']) {
      this.velocityX = -this.speed;
      // Face left
      if (this.model) {
        this.model.rotation.y = -Math.PI / 2;
      }
    } else if (this.keys['ArrowRight'] || this.keys['d']) {
      this.velocityX = this.speed;
      // Face right
      if (this.model) {
        this.model.rotation.y = Math.PI / 2;
      }
    } else {
      this.velocityX = 0;
    }

    // Apply gravity
    this.velocityY += this.gravity * delta;

    // Update position
    this.x += this.velocityX * delta;
    this.y += this.velocityY * delta;

    // Update sprite position
    this.sprite.x = this.x;
    this.sprite.y = this.y;

    // Update 3D model position
    this.updateModelPosition();

    // Update animation mixer
    if (this.mixer) {
      this.mixer.update(0.016 * delta); // Assuming 60fps
    }

    // Keep player in bounds horizontally
    if (this.x < 15) this.x = 15;
    if (this.x > 785) this.x = 785;
  }

  checkPlatformCollisions(platforms: Platform[]): void {
    this.isOnGround = false;

    platforms.forEach(platform => {
      const playerBounds = this.getBounds();
      const platformBounds = platform.getBounds();

      if (this.checkCollision(playerBounds, platformBounds)) {
        // Calculate overlap amounts
        const overlapLeft = (playerBounds.x + playerBounds.width) - platformBounds.x;
        const overlapRight = (platformBounds.x + platformBounds.width) - playerBounds.x;
        const overlapTop = (playerBounds.y + playerBounds.height) - platformBounds.y;
        const overlapBottom = (platformBounds.y + platformBounds.height) - playerBounds.y;

        // Find the smallest overlap
        const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

        // Landing on top
        if (minOverlap === overlapTop && this.velocityY > 0) {
          this.y = platformBounds.y - 27; // Adjust for player height (54/2)
          this.velocityY = 0;
          this.isOnGround = true;
        }
        // Hitting from below
        else if (minOverlap === overlapBottom && this.velocityY < 0) {
          this.y = platformBounds.y + platformBounds.height + 27;
          this.velocityY = 0;
        }
        // Side collisions
        else if (minOverlap === overlapLeft) {
          this.x = platformBounds.x - 12;
          this.velocityX = 0;
        }
        else if (minOverlap === overlapRight) {
          this.x = platformBounds.x + platformBounds.width + 12;
          this.velocityX = 0;
        }
      }
    });
  }

  private checkCollision(rect1: PIXI.Rectangle, rect2: PIXI.Rectangle): boolean {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  getBounds(): PIXI.Rectangle {
    return new PIXI.Rectangle(this.x - 12, this.y - 27, 24, 54);
  }

  reset(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.velocityX = 0;
    this.velocityY = 0;
    this.sprite.x = x;
    this.sprite.y = y;
    this.updateModelPosition();
  }
}
