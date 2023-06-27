import { HUD_VALUES } from "./hud"
import { PolygonEntity } from "./polygonentity"
import { hexToRgb, rndChoose } from "./utils"

export type OreType = {
  type: string
  max: number
  color: string
}

export class Ore extends PolygonEntity {
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
  ].flatMap((ore) => Array(ore.rarity * 10).fill(ore))

  static randomOreType(): OreType {
    return rndChoose(this.oreTypes)
  }

  amount: number

  constructor(radius: number, x: number, y: number, public oreType: OreType) {
    super(radius, x, y, 0, oreType.color)
    this.amount = radius
  }

  updateSelf() {
    const radius = this.amount
    const sides = Math.max(
      3,
      Math.floor((this.amount / this.oreType.max) * 9) + 3
    )
    if (radius !== this.radius || sides !== this.sides) {
      this.radius = radius
      this.sides = sides
      this.generateVertices()
    }
  }

  drawSelf(ctx: CanvasRenderingContext2D) {
    const rgb = hexToRgb(this.color)
    ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.8)`
    super.drawSelf(ctx)

    if (HUD_VALUES.get("showOreText")) {
      const fontSize = Math.max(100, this.amount)
      ctx.fillStyle = "#fff"
      ctx.font = `bold ${fontSize}px sans-serif`
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(this.oreType.type, this.x, this.y)
      ctx.fillText(this.amount.toString(), this.x, this.y + fontSize)
    }
  }
}
