import * as PIXI from 'pixi.js';

export class Coin {
  public graphics: PIXI.Graphics;
  public active: boolean = true;
  private x: number;
  private y: number;
  private rotation: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;

    this.graphics = new PIXI.Graphics();
    this.draw();
    this.graphics.x = x;
    this.graphics.y = y;

    // Animate coin
    this.animate();
  }

  private draw(): void {
    this.graphics.clear();
    
    // Golden coin
    this.graphics.beginFill(0xffd700);
    this.graphics.drawCircle(0, 0, 10);
    this.graphics.endFill();

    // Inner circle
    this.graphics.beginFill(0xffed4e);
    this.graphics.drawCircle(0, 0, 7);
    this.graphics.endFill();

    // Star or symbol
    this.graphics.lineStyle(2, 0xffa500);
    this.graphics.moveTo(-4, 0);
    this.graphics.lineTo(4, 0);
    this.graphics.moveTo(0, -4);
    this.graphics.lineTo(0, 4);
  }

  private animate(): void {
    const animateRotation = () => {
      if (this.active) {
        this.rotation += 0.05;
        this.graphics.rotation = this.rotation;
        requestAnimationFrame(animateRotation);
      }
    };
    animateRotation();
  }

  collect(): void {
    this.active = false;
    
    // Collect animation
    this.graphics.scale.set(1.5);
    setTimeout(() => {
      this.graphics.alpha = 0;
    }, 50);
  }

  getBounds(): PIXI.Rectangle {
    return new PIXI.Rectangle(this.x - 10, this.y - 10, 20, 20);
  }
}
