import { CANVAS, CENTER_X, CENTER_Y, ZOOM } from "./main";

export abstract class Entity {
  static generateId() {
    return Math.floor(Math.random() * 1000000)
  }

  id = Entity.generateId()

  children: Entity[] = []
  parent?: Entity

  private childrenFlat: Entity[] = []

  drawingRadius: number

  constructor(public radius: number, public x: number, public y: number) {
    this.drawingRadius = radius
  }

  abstract drawSelf?(ctx: CanvasRenderingContext2D): void

  abstract updateSelf?(): void

  get realX(): number {
    return this.parent ? this.parent.realX + this.x : this.x
  }

  get realY(): number {
    return this.parent ? this.parent.realY + this.y : this.y
  }

  update() {
    this.updateSelf?.()
    for (const child of this.children) {
      child.update()
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (
      this.realX + this.drawingRadius > CENTER_X &&
      this.realX - this.drawingRadius < CENTER_X + CANVAS.width / ZOOM &&
      this.realY + this.drawingRadius > CENTER_Y &&
      this.realY - this.drawingRadius < CENTER_Y + CANVAS.height / ZOOM
    ) {
      this.drawSelf?.(ctx)
    }
    if (this.children) {
      ctx.save()
      ctx.translate(this.x, this.y)
      for (const child of this.children) {
        child.draw(ctx)
      }
      ctx.restore()
    }
  }

  addChild(child: Entity, index = this.children.length) {
    this.children.splice(index, 0, child)
    child.parent = this
    this.childrenFlat = []
  }

  addChildren(children: Entity[]) {
    for (const child of children) {
      this.addChild(child)
    }
  }

  removeChild(child: Entity) {
    const index = this.children.indexOf(child)
    if (index !== -1) {
      this.children.splice(index, 1)
      this.childrenFlat = []
    }
  }

  removeFromParent() {
    if (this.parent) {
      this.parent.removeChild(this)
    }
  }

  getChildrenFlat() {
    // if (this.children && this.childrenFlat.length === 0) {
    this.childrenFlat = []
    for (const child of this.children) {
      this.childrenFlat.push(...child.getChildrenFlat())
      this.childrenFlat.push(child)
    }
    // }
    return this.childrenFlat
  }
}
