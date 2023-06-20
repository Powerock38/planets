import { Entity } from "./entity"
import { Vec2 } from "./types"

export abstract class PolygonEntity extends Entity {
  verticesRelative: Vec2[] = []

  constructor(
    private size: number,
    public x: number,
    public y: number,
    private sides: number, // < 3 = circle
    public color: string
  ) {
    super(size, x, y)

    if (this.sides >= 3) {
      this.generateVertices()
    }
  }

  generateVertices() {
    this.verticesRelative = []
    for (let i = 0; i < this.sides; i++) {
      const angle = (Math.PI * 2 * i) / this.sides
      const vertexX = Math.cos(angle) * this.size
      const vertexY = Math.sin(angle) * this.size
      this.verticesRelative.push({ x: vertexX, y: vertexY })
    }
  }

  drawSelf(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color

    ctx.beginPath()

    if (this.sides < 3) {
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    } else {
      for (const [i, vertex] of this.verticesRelative.entries()) {
        if (i === 0) {
          ctx.moveTo(this.x + vertex.x, this.y + vertex.y)
        } else {
          ctx.lineTo(this.x + vertex.x, this.y + vertex.y)
        }
      }
    }

    ctx.closePath()
    ctx.fill()
  }

  collides(x: number, y: number): boolean {
    if (this.sides < 3) {
      //circle
      return (
        Math.sqrt((x - this.realX) ** 2 + (y - this.realY) ** 2) < this.size
      )
    } else {
      // polygon
      let inside = false
      let i = 0
      let j = this.verticesRelative.length - 1

      for (; i < this.verticesRelative.length; j = i++) {
        const xi = this.realX + this.verticesRelative[i].x
        const yi = this.realY + this.verticesRelative[i].y
        const xj = this.realX + this.verticesRelative[j].x
        const yj = this.realY + this.verticesRelative[j].y

        const intersect =
          yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi

        if (intersect) {
          inside = !inside
        }
      }

      return inside
    }
  }
}
