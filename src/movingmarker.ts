import { Entity } from "./entity";
import { ZOOM } from "./main";

export class MovingMarker extends Entity {
  targetLocalX?: number;
  targetLocalY?: number;

  constructor(x: number, y: number, public target?: Entity) {
    super(25 / ZOOM, x, y);

    if (target) {
      this.targetLocalX = x - target.realX;
      this.targetLocalY = y - target.realY;
    }
  }

  updateSelf() {
    if (this.target && this.targetLocalX && this.targetLocalY) {
      this.x = this.target.realX + this.targetLocalX;
      this.y = this.target.realY + this.targetLocalY;
    }
  }

  drawSelf(ctx: CanvasRenderingContext2D) {
    this.drawingRadius = 25 / ZOOM;
    const crossRadius = this.drawingRadius * 0.9
    const stopCrossRadius = this.drawingRadius * 0.2
    const dashSize = this.drawingRadius * 0.1

    ctx.save();
    ctx.setLineDash([dashSize, dashSize]);
    ctx.lineWidth = dashSize;
    ctx.strokeStyle = "red";
    ctx.translate(this.x, this.y);
    ctx.beginPath();

    ctx.arc(0, 0, this.drawingRadius, 0, Math.PI * 2)
    ctx.moveTo(-crossRadius, crossRadius);
    ctx.lineTo(-stopCrossRadius, stopCrossRadius);
    ctx.moveTo(crossRadius, crossRadius);
    ctx.lineTo(stopCrossRadius, stopCrossRadius);
    ctx.moveTo(crossRadius, -crossRadius);
    ctx.lineTo(stopCrossRadius, -stopCrossRadius);
    ctx.moveTo(-crossRadius, -crossRadius);
    ctx.lineTo(-stopCrossRadius, -stopCrossRadius);
    ctx.stroke();
    ctx.restore();
  }
}
