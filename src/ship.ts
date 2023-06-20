import { Astre } from "./astre"
import { Entity } from "./entity"
import { hudText } from "./hud"
import { IMAGES } from "./main"
import { MovingMarker } from "./movingmarker"
import { Universe } from "./universe"
import { rndChoose, rndInt } from "./utils"

export class Ship extends Entity {
  static flameColors = ["#FED7A4", "#F7AB57", "#F58021", "#F05D24", "#F26825"]

  angle = 0
  speed = 0
  speedAngle = 0
  maxSpeed = 300
  maxSpeedAngle = 0.2
  movingMarker?: MovingMarker
  stopDistance = this.maxSpeed * 3

  constructor(private universe: Universe) {
    super(30)
  }

  moveTo(x: number, y: number, target?: Entity) {
    this.movingMarker = new MovingMarker(x, y, target)
  }

  removeMovingMarker() {
    this.movingMarker = undefined
    this.speed = 0
    this.speedAngle = 0
  }

  updateSelf() {
    let influenceX = 0,
      influenceY = 0
    let onAstre: Astre | undefined
    const astres = this.universe.astres

    for (const astre of astres) {
      const dx = astre.realX - this.x
      const dy = astre.realY - this.y
      const distanceFromCenter = Math.sqrt(dx * dx + dy * dy)
      const gravityRange = astre.radius + astre.mass

      const doCollide = astre.collides(this.x, this.y)

      if (doCollide) {
        onAstre = astre
        break
      } else if (
        distanceFromCenter < gravityRange
      ) {
        const gravity = Math.min(
          this.maxSpeed * 0.5,
          astre.mass * (gravityRange / (distanceFromCenter - astre.radius) ** 2)
        )
        const angle = Math.atan2(dy, dx)
        influenceX += Math.cos(angle) * gravity
        influenceY += Math.sin(angle) * gravity
      }
    }

    if (onAstre) {
      console.log("on astre", onAstre.id, onAstre.mass)
      const newAbsolutePos = onAstre.computeNewAbsolutePosition()
      // overwrite gravity influences
      influenceX = newAbsolutePos.x - onAstre.realX
      influenceY = newAbsolutePos.y - onAstre.realY
    }

    if (this.movingMarker) {
      this.movingMarker.update()

      const dx = this.movingMarker.x - this.x
      const dy = this.movingMarker.y - this.y

      // rotate
      let angleDiff = Math.atan2(dy, dx) - this.angle
      if (angleDiff > Math.PI) {
        angleDiff -= Math.PI * 2
      } else if (angleDiff < -Math.PI) {
        angleDiff += Math.PI * 2
      }

      this.speedAngle =
        Math.min(Math.abs(angleDiff), this.maxSpeedAngle) * Math.sign(angleDiff)

      // move
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (angleDiff < 0.1) {
        this.speed = Math.max(
          1,
          this.maxSpeed * Math.min(1, (distance - this.stopDistance) / distance)
        )
      }

      if (distance < this.stopDistance) {
        this.removeMovingMarker()
      }
    }

    const newX = this.x + influenceX + Math.cos(this.angle) * this.speed
    const newY = this.y + influenceY + Math.sin(this.angle) * this.speed
    const dx = newX - this.x
    const dy = newY - this.y
    const horizontal = (dx > 0 ? "right" : "left") + dx.toFixed(2)
    const vertical = (dy > 0 ? "down" : "up") + dy.toFixed(2)
    hudText("direction", `${horizontal} ${vertical}`)

    hudText("speed", "speed=" + this.speed.toFixed(2))

    this.angle += this.speedAngle
    this.x = newX
    this.y = newY
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

    this.movingMarker?.draw(ctx)
  }
}
