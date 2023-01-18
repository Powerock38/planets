import { Entity } from "./entity";
import { Planet } from "./planet";

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

  isInside(_: number, __: number): boolean {
    return true;
  }

  addChild(child: Entity) {
    this.children.push(child);
    child.parent = undefined;
  }

  findPlanet(predicate: (entity: Entity) => boolean): Planet | undefined {
    const planets = this.getChildrenFlat().filter(
      (entity) => entity instanceof Planet
    ) as Planet[];

    return planets.find(predicate);
  }
}
