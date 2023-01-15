import { Entity } from "./entity";
import { CANVAS, ctx, IMAGES } from "./main";
import { rnd, rndChoose } from "./utils";

export class Ship extends Entity {
  moving = false;
  toX = 0;
  toY = 0;

  stopDistance = 20;

  constructor() {
    super();

    CANVAS.addEventListener("click", (e: MouseEvent) => {
      this.toX = e.clientX;
      this.toY = e.clientY;
      this.moving = true;
    });
  }

  update() {
    if (this.moving) {
      let dx = this.toX - this.x;
      let dy = this.toY - this.y;

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
      let distance = Math.sqrt(dx * dx + dy * dy);
      this.speed =
        this.maxSpeed *
        Math.min(1, Math.log2(distance / (this.stopDistance * 1.9)) + 1);

      this.angle += this.speedAngle;
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;

      if (distance < this.stopDistance && Math.abs(angleDiff) < 0.1) {
        this.moving = false;
      }

      console.log(this.speed, this.speedAngle);
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.translate(-this.x, -this.y);

    if (this.moving) {
      //swaggy flames
      const flameColors = [
        "#FED7A4",
        "#F7AB57",
        "#F58021",
        "#F05D24",
        "#F26825",
      ];
      if (this.speed > 0) {
        for (let i = 0; i < 20; i++) {
          let angle = rnd(-20, 20) * (Math.PI / 180);
          let length = rnd(10, 20);
          ctx.strokeStyle = rndChoose(flameColors);
          ctx.beginPath();
          let origX = this.x - 35;
          let origY = this.y;
          ctx.moveTo(origX, origY);
          ctx.lineTo(
            Math.round(origX - Math.cos(angle) * length),
            Math.round(origY + Math.sin(angle) * length)
          );
          ctx.closePath();
          ctx.stroke();
        }
      }

      if (this.speedAngle < -0.1) {
        for (let i = 0; i < 10; i++) {
          let angle = rnd(-10, 10) * (Math.PI / 180);
          angle += Math.PI / 2;
          let length = rnd(3, 7);
          ctx.strokeStyle = rndChoose(flameColors);
          ctx.beginPath();
          let origX = this.x + 2;
          let origY = this.y + 10;
          ctx.moveTo(origX, origY);
          ctx.lineTo(
            Math.round(origX + Math.cos(angle) * length),
            Math.round(origY + Math.sin(angle) * length)
          );
          ctx.closePath();
          ctx.stroke();
        }
      }
      if (this.speedAngle > 0.1) {
        for (let i = 0; i < 10; i++) {
          let angle = rnd(-10, 10) * (Math.PI / 180);
          angle -= Math.PI / 2;
          let length = rnd(3, 7);
          ctx.strokeStyle = rndChoose(flameColors);
          ctx.beginPath();
          let origX = this.x + 2;
          let origY = this.y - 10;
          ctx.moveTo(origX, origY);
          ctx.lineTo(
            Math.round(origX + Math.cos(angle) * length),
            Math.round(origY + Math.sin(angle) * length)
          );
          ctx.closePath();
          ctx.stroke();
        }
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
  }
}
