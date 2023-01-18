import { Entity } from "./entity";
import { hexToRgb, rndChoose } from "./utils";

type OreType = {
  type: string;
  max: number;
  color: string;
};

export class Ore extends Entity {
  static oreTypes: OreType[] = [
    { type: "cobalt", rarity: 0.2, max: 300, color: "#2F4F4F" },
    { type: "nickel", rarity: 0.4, max: 500, color: "#808080" },
    { type: "gold", rarity: 0.1, max: 100, color: "#FFD700" },
    { type: "platinum", rarity: 0.2, max: 250, color: "#E5E4E2" },
    { type: "iron", rarity: 0.7, max: 1000, color: "#A9A9A9" },
    { type: "silver", rarity: 0.2, max: 200, color: "#C0C0C0" },
    { type: "uranium", rarity: 0.1, max: 50, color: "#00FF00" },
    { type: "aluminium", rarity: 0.5, max: 800, color: "#A9A9A9" },
    { type: "copper", rarity: 0.7, max: 1000, color: "#B87333" },
  ].flatMap((ore) => Array(ore.rarity * 10).fill(ore));

  static randomOreType(): OreType {
    return rndChoose(this.oreTypes);
  }

  type: string;
  color: string;

  constructor(x: number, y: number, radius: number, oreType: OreType) {
    super(radius, x, y);
    this.type = oreType.type;
    this.color = oreType.color;
  }

  updateSelf: undefined;

  drawSelf(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    const rgb = hexToRgb(this.color);
    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`;
    ctx.fill();
  }
}
