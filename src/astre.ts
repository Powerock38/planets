import { Entity } from "./entity";
import { Ore } from "./ore";
import { Vector } from "./types";
import { rnd, rndChoose } from "./utils";

export class Astre extends Entity {
  static colors = [
    "#FED7A4",
    "#F7AB57",
    "#F58021",
    "#F05D24",
    "#F26825",
    "#E3E6E8",
    "#C1C0C0",
    "#949494",
    "#848686",
    "#7E7F7F",
    "#A1ACB6",
    "#6C7B48",
    "#B18C73",
    "#151340",
    "#212D60",
    "#DFA964",
    "#A07845",
    "#AE946E",
    "#52575D",
    "#21384C",
    "#F6CDAA",
    "#FAB176",
    "#DB6B30",
    "#6F2315",
    "#4F1F11",
    "#CEECF9",
    "#C3E6F0",
    "#BCDEE7",
    "#AACBD2",
    "#739097",
    "#CBDEF2",
    "#867AB9",
    "#7563AC",
    "#6751A2",
    "#4B3D81",
    "#F9E4C4",
    "#DCC592",
    "#B99F7A",
    "#8F6F40",
    "#412F21",
    "#E1D399",
    "#B3AE84",
    "#C1B685",
    "#E5D59D",
    "#9D9366",
    "#CEDCEB",
    "#969FA1",
    "#798791",
    "#4C5062",
    "#424C5C",
  ];

  color: string;

  constructor(
    x: number,
    y: number,
    public mass = rnd(100, 100000),
    nbMoons = rnd(0, 10),
    radius = rnd(500, 1000),
    nbOres = rnd(0, 5),
    public orbitDirection = rndChoose([-1, 1])
  ) {
    super(radius, x, y);

    this.color = rndChoose(Astre.colors);

    if (nbOres) {
      this.addChildren(
        Array.from({ length: nbOres }, () => {
          const ore = Ore.randomOreType();
          const angle = Math.random() * 2 * Math.PI;
          const radius = rnd(0, Math.min(ore.max, this.radius * 0.99));
          const distanceFromCenter = rnd(0, this.radius - radius);
          const x = Math.round(distanceFromCenter * Math.cos(angle));
          const y = Math.round(distanceFromCenter * Math.sin(angle));
          return new Ore(x, y, radius, ore);
        })
      );
    }

    if (nbMoons) {
      this.addChildren(
        Array.from({ length: nbMoons }, (_, i) => {
          const orbit = Math.max(
            this.radius * 2.1,
            rnd(this.mass, this.mass * 3)
          );
          const angle = (i / nbMoons) * Math.PI * 2;

          return new Astre(
            orbit * Math.cos(angle),
            orbit * Math.sin(angle),
            rnd(this.mass * 0.1, this.mass * 0.9),
            rnd(0, nbMoons * 0.1)
          );
        })
      );
    }
  }

  drawSelf(ctx: CanvasRenderingContext2D) {
    if (this.parent instanceof Astre) {
      ctx.beginPath();
      ctx.lineWidth = 5;
      ctx.arc(0, 0, Math.sqrt(this.x ** 2 + this.y ** 2), 0, 2 * Math.PI);
      ctx.strokeStyle = "white";
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();

    ctx.beginPath();
    ctx.lineWidth = 20;
    ctx.arc(this.x, this.y, this.radius + this.mass, 0, 2 * Math.PI);
    ctx.strokeStyle = "yellow";
    ctx.stroke();
  }

  updateSelf() {
    if (this.parent instanceof Astre) {
      const pos = this.computeNewPosition();
      this.x = pos.x;
      this.y = pos.y;
    }
  }

  computeNewPosition(): Vector {
    if (this.parent instanceof Astre) {
      const angle = Math.atan2(this.y, this.x);
      const orbit = Math.sqrt(this.x ** 2 + this.y ** 2);
      const newAngle = angle + this.orbitDirection / (this.parent.mass / 10);
      return { x: orbit * Math.cos(newAngle), y: orbit * Math.sin(newAngle) };
    }

    return { x: this.x, y: this.y };
  }

  computeNewRealPosition(): Vector {
    if (this.parent instanceof Astre) {
      const parentPos = this.parent.computeNewRealPosition();
      const pos = this.computeNewPosition();
      return { x: parentPos.x + pos.x, y: parentPos.y + pos.y };
    }

    return { x: this.x, y: this.y };
  }
}
