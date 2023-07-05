import { Entity } from "./entity"
import { Vec2 } from "./types"

export abstract class PolygonEntity extends Entity {
  static doPolygonsCollide(vertices1: Vec2[], vertices2: Vec2[]) {
    for (const vertices of [vertices1, vertices2]) {
      for (let i = 0; i < vertices.length; i++) {
        const p1 = vertices[i]
        const p2 = vertices[(i + 1) % vertices.length]
        const normal = { x: p2.y - p1.y, y: p1.x - p2.x }

        const minMax1 = this.getMinMax(vertices1, normal)
        const minMax2 = this.getMinMax(vertices2, normal)

        if (minMax1.min > minMax2.max || minMax1.max < minMax2.min) {
          return false
        }
      }
    }

    return true
  }

  static getMinMax(vertices: Vec2[], normal: Vec2) {
    let min = Infinity
    let max = -Infinity

    for (const vertex of vertices) {
      const projection = vertex.x * normal.x + vertex.y * normal.y
      min = Math.min(min, projection)
      max = Math.max(max, projection)
    }

    return { min, max }
  }

  static generateVertices(radius: number, sides: number) {
    const verticesRelative = []
    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI * 2 * i) / sides
      const vertexX = Math.cos(angle) * radius
      const vertexY = Math.sin(angle) * radius
      verticesRelative.push({ x: vertexX, y: vertexY })
    }
    return verticesRelative
  }

  static relativeToAbsolute(verticesRelative: Vec2[], x: number, y: number) {
    return verticesRelative.map((vertex) => ({
      x: vertex.x + x,
      y: vertex.y + y,
    }))
  }

  verticesRelative: Vec2[] = []

  constructor(
    radius: number,
    public x: number,
    public y: number,
    public sides: number, // < 3 = circle
    public color: string
  ) {
    super(radius, x, y)

    if (this.sides >= 3) {
      this.generateVertices()
    }
  }

  generateVertices() {
    this.verticesRelative = PolygonEntity.generateVertices(
      this.radius,
      this.sides
    )
  }

  getVerticesAbsolute() {
    return PolygonEntity.relativeToAbsolute(
      this.verticesRelative,
      this.realX,
      this.realY
    )
  }

  drawSelf(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color

    ctx.beginPath()

    if (this.sides < 3) {
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
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
        Math.sqrt((x - this.realX) ** 2 + (y - this.realY) ** 2) < this.radius
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

  getInnerRadius(): number {
    if (this.sides < 3) {
      return this.radius
    } else {
      return this.radius * Math.cos(Math.PI / this.sides)
    }
  }
}
