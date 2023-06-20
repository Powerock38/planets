import { Astre } from "./astre";
import { Entity } from "./entity";

export class Universe extends Entity {
  constructor() {
    super(Infinity);
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const child of this.children) {
      child.draw(ctx);
    }
  }

  drawSelf: undefined;

  updateSelf: undefined;

  addChild(child: Entity) {
    this.children.push(child);
    child.parent = undefined;
  }

  findAstre(predicate: (astre: Astre) => boolean): Astre | undefined {
    const astres = this.getChildrenFlat().filter(
      (planet) => planet instanceof Astre
    ) as Astre[];

    return astres.find(predicate);
  }

  get astres(): Astre[] {
    return this.getChildrenFlat().filter(
      (planet) => planet instanceof Astre
    ) as Astre[];
  }
}
