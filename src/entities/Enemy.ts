import * as PIXI from 'pixi.js';
import { Platform } from './Platform';

export class Enemy {
  public sprite: PIXI.Graphics;
  public x: number;
  public y: number;
  private velocityX: number = 2;
  private velocityY: number = 0;
  private gravity: number = 0.8;
  private direction: number = 1;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;

    this.sprite = new PIXI.Graphics();
    this.drawEnemy();
    this.sprite.x = x;
    this.sprite.y = y;
  }

  private drawEnemy(): void {
    const g = this.sprite;
    g.clear();

    // Goomba-like enemy (brown mushroom)
    g.beginFill(0x8b4513);
    g.drawEllipse(0, -10, 15, 12);
    g.endFill();

    // Body
    g.beginFill(0xa0522d);
    g.drawRect(-12, 0, 24, 15);
    g.endFill();

    // Eyes
    g.beginFill(0xffffff);
    g.drawCircle(-6, -8, 4);
    g.drawCircle(6, -8, 4);
    g.endFill();

    g.beginFill(0x000000);
    g.drawCircle(-6, -8, 2);
    g.drawCircle(6, -8, 2);
    g.endFill();

    // Angry eyebrows
    g.lineStyle(2, 0x000000);
    g.moveTo(-10, -12);
    g.lineTo(-4, -10);
    g.moveTo(10, -12);
    g.lineTo(4, -10);

    // Feet
    g.lineStyle(0);
    g.beginFill(0x8b4513);
    g.drawRect(-10, 15, 7, 3);
    g.drawRect(3, 15, 7, 3);
    g.endFill();
  }

  update(delta: number): void {
    // Move back and forth
    this.x += this.velocityX * this.direction * delta;

    // Apply gravity
    this.velocityY += this.gravity * delta;
    this.y += this.velocityY * delta;

    // Update sprite position
    this.sprite.x = this.x;
    this.sprite.y = this.y;

    // Simple AI: turn around at edges
    if (this.x < 50 || this.x > 750) {
      this.direction *= -1;
      this.sprite.scale.x *= -1; // Flip sprite
    }
  }

  checkPlatformCollisions(platforms: Platform[]): void {
    platforms.forEach(platform => {
      const enemyBounds = this.getBounds();
      const platformBounds = platform.getBounds();

      if (this.checkCollision(enemyBounds, platformBounds)) {
        // Landing on top
        if (this.velocityY > 0) {
          this.y = platformBounds.y - 18;
          this.velocityY = 0;
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
    return new PIXI.Rectangle(this.x - 12, this.y - 18, 24, 36);
  }
}
