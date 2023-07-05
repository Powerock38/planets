import { Astre } from "./astre"
import { BuildEntity } from "./buildentity"
import { Inventory } from "./inventory"
import { IMAGES } from "./main"
import { Ore } from "./ore"

export class Quarry extends BuildEntity {
  static canBuild(
    astres: Astre[],
    x: number,
    y: number
  ): false | [Quarry, Ore] {
    for (const astre of astres) {
      if (astre.collidesInGravityRange(x, y)) {
        const ore = (
          astre.children.filter(
            (ore) =>
              ore instanceof Ore &&
              ore.amount > 0 &&
              !ore.children.find((child) => child instanceof Quarry)
          ) as Ore[]
        ).find(
          (ore) =>
            Math.sqrt((x - ore.realX) ** 2 + (y - ore.realY) ** 2) < ore.radius
        )

        if (ore) {
          const quarry = new Quarry(ore)
          return [quarry, ore]
        }
      }
    }
    return false
  }

  static drawPreview(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const radius = 1000
    ctx.drawImage(IMAGES.quarry, x - radius / 2, y - radius / 2, radius, radius)
  }

  static angleSpeed = 0.1

  miningRate = 0.1
  amountPerMining = 1

  inventory: Inventory

  angle = 0

  constructor(public ore: Ore) {
    super(ore.radius, 0, 0, 0, "#FFFFFF")
    this.inventory = new Inventory(100, ore.realX, ore.realY) // fixme: ore.realX, ore.realY are copied instead of referenced
  }

  updateSelf() {
    if (this.ore.amount >= this.amountPerMining) {
      if (Date.now() % 1000 < 1 / this.miningRate) {
        console.log("mining")
        this.ore.amount -= this.amountPerMining
        this.inventory.add(this.ore.oreType.type, this.amountPerMining)
        console.log(this.inventory)
      }
      this.angle += Quarry.angleSpeed
    }
  }

  drawSelf(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.angle)
    ctx.translate(-this.x, -this.y)

    ctx.drawImage(
      IMAGES.quarry,
      this.x - this.radius / 2,
      this.y - this.radius / 2,
      this.radius,
      this.radius
    )

    ctx.restore()
  }
}
