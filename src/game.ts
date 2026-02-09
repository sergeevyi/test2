import * as PIXI from 'pixi.js';
import * as THREE from 'three';
import { Player } from './entities/Player';
import { Platform } from './entities/Platform';
import { Coin } from './entities/Coin';
import { Enemy } from './entities/Enemy';

export class Game {
  private app: PIXI.Application;
  private scene: THREE.Scene;
  private player: Player;
  private platforms: Platform[] = [];
  private coins: Coin[] = [];
  private enemies: Enemy[] = [];
  private score: number = 0;
  private scoreText: PIXI.Text;
  private lives: number = 3;
  private livesText: PIXI.Text;
  private bgMusic: HTMLAudioElement;

  constructor(app: PIXI.Application, scene: THREE.Scene) {
    this.app = app;
    this.scene = scene;

    // Initialize background music
    this.bgMusic = new Audio('https://gamecraft.integration.pp.frogmind.com/assets/audio/48cfaf1c-5dcb-4a42-86a5-28ee1bb5fae0.mp3');
    this.bgMusic.loop = true;
    this.bgMusic.volume = 0.3; // Set volume to 30%
    
    // Play music (with user interaction fallback)
    this.bgMusic.play().catch(() => {
      // If autoplay is blocked, play on first user interaction
      const playOnInteraction = () => {
        this.bgMusic.play();
        window.removeEventListener('keydown', playOnInteraction);
        window.removeEventListener('click', playOnInteraction);
      };
      window.addEventListener('keydown', playOnInteraction);
      window.addEventListener('click', playOnInteraction);
    });

    // Create UI
    this.scoreText = new PIXI.Text('SCORE: 0', {
      fontSize: 24,
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.scoreText.position.set(10, 10);
    this.app.stage.addChild(this.scoreText);

    this.livesText = new PIXI.Text('LIVES: 3', {
      fontSize: 24,
      fill: '#ffffff',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    });
    this.livesText.position.set(10, 40);
    this.app.stage.addChild(this.livesText);

    // Create platforms first
    this.createPlatforms();

    // Create player with dragon model - start on the ground!
    this.player = new Player(100, 523, this.scene, () => {
      console.log('Dragon model loaded successfully!');
    });
    this.app.stage.addChild(this.player.sprite);

    // Create coins
    this.createCoins();

    // Create enemies
    this.createEnemies();

    // Show controls
    this.showControls();
  }

  private showControls(): void {
    const controlsText = new PIXI.Text('Arrow Keys / WASD to Move | Space/W to Jump', {
      fontSize: 16,
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 2,
    });
    controlsText.anchor.set(0.5, 0);
    controlsText.position.set(400, 560);
    this.app.stage.addChild(controlsText);
  }

  private createPlatforms(): void {
    // Ground - changed to black
    const ground = new Platform(
      0, 
      550, 
      800, 
      50, 
      0x000000 // Black color
    );
    this.platforms.push(ground);
    this.app.stage.addChild(ground.container);

    // Floating platforms
    const platformData = [
      { x: 200, y: 450, width: 150, height: 20 },
      { x: 400, y: 350, width: 150, height: 20 },
      { x: 600, y: 250, width: 150, height: 20 },
      { x: 150, y: 300, width: 100, height: 20 },
      { x: 500, y: 180, width: 120, height: 20 },
    ];

    platformData.forEach(data => {
      const platform = new Platform(data.x, data.y, data.width, data.height, 0x228b22);
      this.platforms.push(platform);
      this.app.stage.addChild(platform.container);
    });
  }

  private createCoins(): void {
    const coinPositions = [
      { x: 275, y: 410 },
      { x: 475, y: 310 },
      { x: 675, y: 210 },
      { x: 200, y: 260 },
      { x: 550, y: 140 },
      { x: 600, y: 140 },
    ];

    coinPositions.forEach(pos => {
      const coin = new Coin(pos.x, pos.y);
      this.coins.push(coin);
      this.app.stage.addChild(coin.graphics);
    });
  }

  private createEnemies(): void {
    const enemyPositions = [
      { x: 300, y: 420 },
      { x: 650, y: 220 },
    ];

    enemyPositions.forEach(pos => {
      const enemy = new Enemy(pos.x, pos.y);
      this.enemies.push(enemy);
      this.app.stage.addChild(enemy.sprite);
    });
  }

  update(delta: number): void {
    // Update player
    this.player.update(delta);

    // Check platform collisions
    this.player.checkPlatformCollisions(this.platforms);

    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update(delta);
      enemy.checkPlatformCollisions(this.platforms);

      // Check player-enemy collision
      if (this.checkCollision(this.player.getBounds(), enemy.getBounds())) {
        // Check if player is falling on enemy
        if (this.player.velocityY > 0 && this.player.y < enemy.y) {
          // Kill enemy
          this.app.stage.removeChild(enemy.sprite);
          this.enemies = this.enemies.filter(e => e !== enemy);
          this.player.velocityY = -10; // Bounce
          this.addScore(100);
        } else {
          // Player takes damage
          this.loseLife();
        }
      }
    });

    // Check coin collisions
    this.coins.forEach(coin => {
      if (coin.active && this.checkCollision(this.player.getBounds(), coin.getBounds())) {
        coin.collect();
        this.addScore(10);
        setTimeout(() => {
          this.app.stage.removeChild(coin.graphics);
        }, 100);
      }
    });

    // Camera follow player (simple scroll)
    if (this.player.x > 400) {
      const offsetX = 400 - this.player.x;
      this.app.stage.children.forEach(child => {
        if (child !== this.scoreText && child !== this.livesText) {
          child.x += offsetX * 0.1 * delta;
        }
      });
    }

    // Check if player fell off
    if (this.player.y > 700) {
      this.loseLife();
    }
  }

  private checkCollision(rect1: PIXI.Rectangle, rect2: PIXI.Rectangle): boolean {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  private addScore(points: number): void {
    this.score += points;
    this.scoreText.text = `SCORE: ${this.score}`;
  }

  private loseLife(): void {
    this.lives--;
    this.livesText.text = `LIVES: ${this.lives}`;
    
    if (this.lives <= 0) {
      this.gameOver();
    } else {
      // Reset player position - on the ground
      this.player.reset(100, 523);
    }
  }

  private gameOver(): void {
    // Stop the music on game over
    this.bgMusic.pause();
    
    const gameOverText = new PIXI.Text('GAME OVER!', {
      fontSize: 64,
      fill: '#ff0000',
      fontFamily: 'Arial',
      fontWeight: 'bold',
      stroke: '#ffffff',
      strokeThickness: 4,
    });
    gameOverText.anchor.set(0.5);
    gameOverText.position.set(400, 300);
    this.app.stage.addChild(gameOverText);

    const restartText = new PIXI.Text('Press R to Restart', {
      fontSize: 32,
      fill: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3,
    });
    restartText.anchor.set(0.5);
    restartText.position.set(400, 370);
    this.app.stage.addChild(restartText);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'r' || e.key === 'R') {
        location.reload();
      }
    });
  }
}
