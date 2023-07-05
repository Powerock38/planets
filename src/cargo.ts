import { Astre } from "./astre"
import { BuildEntity } from "./buildentity"
import { Entity } from "./entity"
import { Inventory } from "./inventory"

export class Cargo extends BuildEntity {
  static canBuild(
    astres: Astre[],
    x: number,
    y: number
  ): false | [Cargo, Entity] {
    for (const astre of astres) {
      if (astre.collidesInGravityRange(x, y)) {
        const nearestInventory = Inventory.nearestInventory(x, y, 500)

        const lx = x - astre.realX
        const ly = y - astre.realY
        console.log(nearestInventory)
        const cargo = new Cargo(lx, ly, nearestInventory?.inventory)
        return [cargo, astre]
      }
    }
    return false
  }

  static drawPreview(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const radius = 100
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.fill()
  }

  flowRate = 0.2
  inventory: Inventory

  constructor(x: number, y: number, public takeFromInventory?: Inventory) {
    super(100, x, y, 4, "#FFFFFF")
    this.inventory = new Inventory(1000, x, y)
  }

  updateSelf() {}

  drawSelf(ctx: CanvasRenderingContext2D) {
    super.drawSelf(ctx)

    ctx.fillStyle = "#000000"
    ctx.font = "20px Arial"
    ctx.fillText(this.inventory.items.size.toString(), this.x, this.y)
  }
}
