import { Astre } from "./astre"
import { Entity } from "./entity"
import { hudText } from "./hud"
import { Inventory } from "./inventory"
import { IMAGES } from "./main"
import { Marker } from "./marker"
import { Ore } from "./ore"
import { Quarry } from "./quarry"
import { Universe } from "./universe"
import { rndChoose, rndInt } from "./utils"

export class Ship extends Entity {
  static flameColors = ["#FED7A4", "#F7AB57", "#F58021", "#F05D24", "#F26825"]

  angle = 0
  speed = 0
  speedAngle = 0
  maxSpeed = 300
  maxSpeedAngle = 0.2
  marker?: Marker
  initialDistance = 0

  onAstre?: Astre
  inventory = new Inventory()
  reachRadius = 100

  constructor(private universe: Universe) {
    super(30, 0, 0)
  }

  buildQuarry() {
    if (this.onAstre) {
      const ore = (
        this.onAstre.children.filter(
          (ore) =>
            ore instanceof Ore &&
            ore.amount > 0 &&
            !ore.children.find((child) => child instanceof Quarry)
        ) as Ore[]
      ).find((ore) => ore.collides(this.x, this.y))

      if (ore) {
        const quarry = new Quarry(ore, this.inventory)
        ore.addChild(quarry)
        console.log("built quarry", quarry)
      }
    }
  }

  moveTo(x: number, y: number) {
    const target = this.universe.findAstre((astre) =>
      astre.collidesInGravityRange(x, y)
    )
    console.log(target)
    this.marker = new Marker(x, y, target)
    this.initialDistance = Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2)
  }

  removeMovingMarker() {
    this.marker = undefined
    this.speed = 0
    this.speedAngle = 0
    this.initialDistance = 0
  }

  updateSelf() {
    let influenceX = 0,
      influenceY = 0
    let astres = this.onAstre
      ? [this.onAstre, ...this.universe.getAstresExcept(this.onAstre)]
      : this.universe.getAstres()

    for (const astre of astres) {
      if (astre.collidesInGravityRange(this.x, this.y)) {
        if (this.onAstre !== astre) {
          this.onAstre = astre
          console.log("on astre", this.onAstre)
        }

        const newAbsolutePos = this.onAstre.computeNewAbsolutePosition()
        influenceX = newAbsolutePos.x - this.onAstre.realX
        influenceY = newAbsolutePos.y - this.onAstre.realY

        break
        // const gravity = Math.min(this.maxSpeed * 0.5, astre.mass * (gravityRange / (distanceFromCenter - astre.radius) ** 2))
        // const angle = Math.atan2(dy, dx)
        // influenceX += Math.cos(angle) * gravity
        // influenceY += Math.sin(angle) * gravity
      }
    }

    this.moveTowardsMarker()

    this.x = this.x + influenceX + Math.cos(this.angle) * this.speed
    this.y = this.y + influenceY + Math.sin(this.angle) * this.speed
    this.angle += this.speedAngle

    hudText("speed", "speed=" + this.speed.toFixed(2))
  }

  private moveTowardsMarker() {
    if (this.marker) {
      this.marker.update()

      const dx = this.marker.x - this.x
      const dy = this.marker.y - this.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      let angleDiff = Math.atan2(dy, dx) - this.angle
      if (angleDiff > Math.PI) {
        angleDiff -= Math.PI * 2
      } else if (angleDiff < -Math.PI) {
        angleDiff += Math.PI * 2
      }

      this.speedAngle =
        Math.min(Math.abs(angleDiff), this.maxSpeedAngle) * Math.sign(angleDiff)

      this.speed = Math.min(distance, this.maxSpeed)

      if (distance <= this.maxSpeed) {
        this.removeMovingMarker()
      }
    }
  }

  drawSelf(ctx: CanvasRenderingContext2D) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(this.angle)
    ctx.translate(-this.x, -this.y)
    ctx.lineWidth = 2

    if (this.speed > 0) {
      for (let i = 0; i < 20; i++) {
        const angle = rndInt(-20, 20) * (Math.PI / 180)
        const length = (rndInt(20, 30) * this.speed) / this.maxSpeed
        ctx.strokeStyle = rndChoose(Ship.flameColors)
        ctx.beginPath()
        const origX = this.x - 30
        const origY = this.y
        ctx.moveTo(origX, origY)
        ctx.lineTo(
          Math.round(origX - Math.cos(angle) * length),
          Math.round(origY + Math.sin(angle) * length)
        )
        ctx.closePath()
        ctx.stroke()
      }
    }

    if (this.speedAngle < 0) {
      for (let i = 0; i < 10; i++) {
        const angle = rndInt(-10, 10) * (Math.PI / 180) + Math.PI / 2
        const length = rndInt(10, 20)
        ctx.strokeStyle = rndChoose(Ship.flameColors)
        ctx.beginPath()
        const origX = this.x + 2
        const origY = this.y + 5
        ctx.moveTo(origX, origY)
        ctx.lineTo(
          Math.round(origX + Math.cos(angle) * length),
          Math.round(origY + Math.sin(angle) * length)
        )
        ctx.closePath()
        ctx.stroke()
      }
    }
    if (this.speedAngle > 0) {
      for (let i = 0; i < 10; i++) {
        const angle = rndInt(-10, 10) * (Math.PI / 180) - Math.PI / 2
        const length = (rndInt(10, 20) * this.speedAngle) / this.maxSpeedAngle
        ctx.strokeStyle = rndChoose(Ship.flameColors)
        ctx.beginPath()
        const origX = this.x + 2
        const origY = this.y - 5
        ctx.moveTo(origX, origY)
        ctx.lineTo(
          Math.round(origX + Math.cos(angle) * length),
          Math.round(origY + Math.sin(angle) * length)
        )
        ctx.closePath()
        ctx.stroke()
      }
    }

    //ship
    const imgWidth = 80
    const imgHeight = 60
    ctx.drawImage(
      IMAGES.ship,
      this.x - imgWidth / 2,
      this.y - imgHeight / 2,
      imgWidth,
      imgHeight
    )

    ctx.restore()

    this.marker?.draw(ctx)
  }
}
