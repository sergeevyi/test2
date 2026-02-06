import * as PIXI from 'pixi.js';

export class Platform {
  public graphics: PIXI.Graphics;
  public sprite?: PIXI.TilingSprite;
  public container: PIXI.Container;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private color: number;
  private useTexture: boolean;

  constructor(x: number, y: number, width: number, height: number, color: number, textureUrl?: string) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.useTexture = !!textureUrl;

    this.container = new PIXI.Container();
    this.graphics = new PIXI.Graphics();

    if (textureUrl) {
      // Use texture (for ground)
      const texture = PIXI.Texture.from(textureUrl);
      this.sprite = new PIXI.TilingSprite(texture, this.width, this.height);
      this.sprite.position.set(this.x, this.y);
      this.container.addChild(this.sprite);
    } else {
      // Use graphics (for floating platforms)
      this.draw();
      this.container.addChild(this.graphics);
    }
  }

  private draw(): void {
    this.graphics.beginFill(this.color);
    this.graphics.drawRect(this.x, this.y, this.width, this.height);
    this.graphics.endFill();

    // Add brick pattern for platforms
    if (this.color !== 0x8b4513) { // Not ground
      this.graphics.lineStyle(2, 0x1a5c1a);
      for (let i = 0; i < this.width; i += 30) {
        this.graphics.moveTo(this.x + i, this.y);
        this.graphics.lineTo(this.x + i, this.y + this.height);
      }
    }
  }

  getBounds(): PIXI.Rectangle {
    return new PIXI.Rectangle(this.x, this.y, this.width, this.height);
  }
}
