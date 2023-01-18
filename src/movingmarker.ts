import { Entity } from "./entity";

export class MovingMarker extends Entity {
  targetLocalX?: number;
  targetLocalY?: number;

  crossRadius: number;
  stopCrossRadius: number;
  dashSize: number;

  constructor(x: number, y: number, public target?: Entity) {
    const radius = 100;
    super(radius, x, y);

    if (target) {
      this.targetLocalX = x - target.realX;
      this.targetLocalY = y - target.realY;
    }

    this.crossRadius = radius * 0.9;
    this.stopCrossRadius = radius * 0.2;
    this.dashSize = Math.max(3, Math.ceil(radius * 0.01));
  }

  updateSelf() {
    if (this.target && this.targetLocalX && this.targetLocalY) {
      this.x = this.target.realX + this.targetLocalX;
      this.y = this.target.realY + this.targetLocalY;
    }
  }

  drawSelf(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.setLineDash([this.dashSize, this.dashSize]);
    ctx.lineWidth = this.dashSize;
    ctx.strokeStyle = "red";
    ctx.translate(this.x, this.y);
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.moveTo(-this.crossRadius, this.crossRadius);
    ctx.lineTo(-this.stopCrossRadius, this.stopCrossRadius);
    ctx.moveTo(this.crossRadius, this.crossRadius);
    ctx.lineTo(this.stopCrossRadius, this.stopCrossRadius);
    ctx.moveTo(this.crossRadius, -this.crossRadius);
    ctx.lineTo(this.stopCrossRadius, -this.stopCrossRadius);
    ctx.moveTo(-this.crossRadius, -this.crossRadius);
    ctx.lineTo(-this.stopCrossRadius, -this.stopCrossRadius);
    ctx.stroke();
    ctx.restore();
  }
}
