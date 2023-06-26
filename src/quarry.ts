import { Entity } from "./entity"
import { Inventory } from "./inventory"
import { IMAGES } from "./main"
import { Ore } from "./ore"

export class Quarry extends Entity {
  static angleSpeed = 0.1

  miningRate = 1
  angle = 0

  constructor(public ore: Ore, public outputInventory: Inventory) {
    super(ore.radius, 0, 0)
  }

  updateSelf() {
    if (this.ore.amount >= this.miningRate) {
      this.ore.amount -= this.miningRate
      this.outputInventory.add(this.ore.oreType.type, this.miningRate)
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
