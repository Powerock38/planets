import { Astre } from "./astre";
import { Entity } from "./entity";
import { IMAGES } from "./main";
import { MovingMarker } from "./movingmarker";
import { Universe } from "./universe";
import { rnd, rndChoose } from "./utils";

export class Ship extends Entity {
  static flameColors = ["#FED7A4", "#F7AB57", "#F58021", "#F05D24", "#F26825"];

  angle = 0;
  speed = 0;
  speedAngle = 0;
  maxSpeed = 10;
  maxSpeedAngle = 0.2;
  movingMarker?: MovingMarker;
  stopDistance = 40;

  constructor(private universe: Universe) {
    super(30);
  }

  moveTo(x: number, y: number, target?: Entity) {
    this.movingMarker = new MovingMarker(x, y, target);
  }

  removeMovingMarker() {
    this.movingMarker = undefined;
    this.speed = 0;
    this.speedAngle = 0;
  }

  updateSelf() {
    let influenceX = 0,
      influenceY = 0;
    let onAstre: Astre | undefined;
    const astres = this.universe.astres;

    for (const astre of astres) {
      const dx = astre.realX - this.x;
      const dy = astre.realY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const gravityRange = astre.radius + astre.mass;

      if (distance < astre.radius) {
        onAstre = astre;
        break;
      } else if (distance < gravityRange && distance > astre.radius) {
        const gravity = (astre.mass * 1000) / distance ** 2;
        const angle = Math.atan2(dy, dx);
        influenceX += Math.cos(angle) * gravity;
        influenceY += Math.sin(angle) * gravity;
      }
    }

    if (onAstre) {
      const newRealPos = onAstre.computeNewRealPosition();
      // overwrite gravity influences
      influenceX = newRealPos.x - onAstre.realX;
      influenceY = newRealPos.y - onAstre.realY;
    }

    if (this.movingMarker) {
      this.movingMarker.update();

      const dx = this.movingMarker.x - this.x;
      const dy = this.movingMarker.y - this.y;

      // rotate
      let angleDiff = Math.atan2(dy, dx) - this.angle;
      if (angleDiff > Math.PI) {
        angleDiff -= Math.PI * 2;
      } else if (angleDiff < -Math.PI) {
        angleDiff += Math.PI * 2;
      }

      this.speedAngle =
        Math.min(Math.abs(angleDiff), this.maxSpeedAngle) *
        Math.sign(angleDiff);

      // move
      const distance = Math.sqrt(dx * dx + dy * dy);
      this.speed = Math.max(
        1,
        this.maxSpeed * Math.min(1, (distance - this.stopDistance) / distance)
      );

      if (distance < this.stopDistance) {
        this.removeMovingMarker();
      }
    }

    this.angle += this.speedAngle;
    this.x += influenceX + Math.cos(this.angle) * this.speed;
    this.y += influenceY + Math.sin(this.angle) * this.speed;
  }

  drawSelf(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.translate(-this.x, -this.y);
    ctx.lineWidth = 2;

    if (this.speed > 0) {
      for (let i = 0; i < 20; i++) {
        const angle = rnd(-20, 20) * (Math.PI / 180);
        const length = (rnd(20, 30) * this.speed) / this.maxSpeed;
        ctx.strokeStyle = rndChoose(Ship.flameColors);
        ctx.beginPath();
        const origX = this.x - 30;
        const origY = this.y;
        ctx.moveTo(origX, origY);
        ctx.lineTo(
          Math.round(origX - Math.cos(angle) * length),
          Math.round(origY + Math.sin(angle) * length)
        );
        ctx.closePath();
        ctx.stroke();
      }
    }

    if (this.speedAngle < 0) {
      for (let i = 0; i < 10; i++) {
        const angle = rnd(-10, 10) * (Math.PI / 180) + Math.PI / 2;
        const length = rnd(10, 20);
        ctx.strokeStyle = rndChoose(Ship.flameColors);
        ctx.beginPath();
        const origX = this.x + 2;
        const origY = this.y + 5;
        ctx.moveTo(origX, origY);
        ctx.lineTo(
          Math.round(origX + Math.cos(angle) * length),
          Math.round(origY + Math.sin(angle) * length)
        );
        ctx.closePath();
        ctx.stroke();
      }
    }
    if (this.speedAngle > 0) {
      for (let i = 0; i < 10; i++) {
        const angle = rnd(-10, 10) * (Math.PI / 180) - Math.PI / 2;
        const length = (rnd(10, 20) * this.speedAngle) / this.maxSpeedAngle;
        ctx.strokeStyle = rndChoose(Ship.flameColors);
        ctx.beginPath();
        const origX = this.x + 2;
        const origY = this.y - 5;
        ctx.moveTo(origX, origY);
        ctx.lineTo(
          Math.round(origX + Math.cos(angle) * length),
          Math.round(origY + Math.sin(angle) * length)
        );
        ctx.closePath();
        ctx.stroke();
      }
    }

    //ship
    const imgWidth = 80;
    const imgHeight = 60;
    ctx.drawImage(
      IMAGES.ship,
      this.x - imgWidth / 2,
      this.y - imgHeight / 2,
      imgWidth,
      imgHeight
    );

    ctx.restore();

    this.movingMarker?.draw(ctx);
  }
}
