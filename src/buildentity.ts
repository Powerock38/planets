import { Astre } from "./astre"
import { Entity } from "./entity"
import { PolygonEntity } from "./polygonentity"
import { Ship } from "./ship"

export abstract class BuildEntity extends PolygonEntity {
  static tryBuild(ship: Ship, x: number, y: number) {
    const canBuildRes = this.canBuild(ship.universe.getAstres(), x, y)
    if (!canBuildRes) {
      return false
    }

    const [build, parent] = canBuildRes

    const doCollidesWithExistingBuild = (
      ship.universe
        .getChildrenFlat()
        .filter((otherBuild) => "isBuildEntity" in otherBuild) as BuildEntity[]
    ).find((otherBuild) =>
      PolygonEntity.doPolygonsCollide(
        // because parent is not yet set
        PolygonEntity.relativeToAbsolute(
          build.verticesRelative,
          parent.realX,
          parent.realY
        ),
        otherBuild.getVerticesAbsolute()
      )
    )

    if (doCollidesWithExistingBuild) {
      return false
    }

    parent.addChild(build)
    console.log("built", build)
    return true
  }

  static canBuild(
    _: Astre[],
    __: number,
    ___: number
  ): false | [BuildEntity, Entity] {
    throw new Error("Not implemented")
  }

  static drawPreview(_: CanvasRenderingContext2D, __: number, ___: number) {
    throw new Error("Not implemented")
  }

  readonly isBuildEntity = true
}
