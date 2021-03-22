import player from "./player";

let ID = 1;

export class Entity {
  constructor(options) {
    this.id = ID++;
    this.type = options.type;
    this.x = options.x;
    this.y = options.y;
    this.height = options.height;
    this.width = options.width;
    this.boundHeight = options.boundHeight;
    this.boundWidth = options.boundWidth;
    this.img = options.img;

    const deltaX = (this.width - this.boundWidth) / 2;
    const deltaY = (this.height - this.boundHeight) / 2;

    this.playerBounds = {
      x1: this.x + deltaX,
      x2: this.x + deltaX + this.boundWidth,
      y1: this.y + deltaY,
      y2: this.y + deltaY + this.boundHeight,
    };

    // useless
    this.segments = [
      {
        start: { x: this.x, y: this.y },
        end: { x: this.x + this.width, y: this.y },
      },
      {
        start: { x: this.x, y: this.y + this.height },
        end: { x: this.x + this.width, y: this.y + this.height },
      },
      {
        start: { x: this.x, y: this.y },
        end: { x: this.x, y: this.y + this.height },
      },
      {
        start: { x: this.x + this.width, y: this.y },
        end: { x: this.x + this.width, y: this.y + this.height },
      },
    ];

    const { x1, x2, y1, y2 } = this.playerBounds;

    // top bottom left right
    this.playerBoundsSegments = [
      {
        start: { x: x1, y: y1 },
        end: { x: x2, y: y1 },
      },
      {
        start: { x: x1, y: y2 },
        end: { x: x2, y: y2 },
      },
      {
        start: { x: x1, y: y1 },
        end: { x: x1, y: y2 },
      },
      {
        start: { x: x2, y: y1 },
        end: { x: x2, y: y2 },
      },
    ];
  }
}
