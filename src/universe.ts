import { Astre } from "./astre"
import { Entity } from "./entity"
import { CANVAS } from "./main"
import { rndChoose, rndInt } from "./utils"

type SolarSystem = {
  star?: Astre // star with orbiting planets, lazily generated
  color: string // color of the star
  x: number // x position in the universe
  y: number // y position in the universe
}

export class Universe extends Entity {
  static starColors = [
    "#FFD27D",
    "#FFA371",
    "#A6A8FF",
    "#FFFA86",
    "#A87BFF",
    "#FFFFFF",
    "#FED7A4",
    "#F7AB57",
    "#F58021",
    "#F05D24",
    "#F26825",
  ]

  solarSystems: SolarSystem[] = []

  constructor(nbSolarSystems: number) {
    super(0, 0, 0)

    for (let i = 0; i < nbSolarSystems; i++) {
      const x = rndInt(0, CANVAS.width)
      const y = rndInt(0, CANVAS.height)
      const color = rndChoose(Universe.starColors)

      this.solarSystems.push({ x, y, color })
    }

    if (nbSolarSystems) {
      this.goToSolarSystem(this.solarSystems[0])
    }
  }

  goToSolarSystem(solarSystem: SolarSystem) {
    const astres = this.getAstres()
    for (const astre of astres) {
      this.removeChild(astre)
    }

    if (!solarSystem.star) {
      solarSystem.star = new Astre(
        0,
        0,
        rndInt(1000, 100000),
        rndInt(3, 20),
        rndInt(1000, 10000),
        0,
        0,
        solarSystem.color,
        1,
        0,
        0
      )
    }

    this.addChild(solarSystem.star, 0)

    console.log(this.children)
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const child of this.children) {
      child.draw(ctx)
    }
  }

  drawSelf(ctx: CanvasRenderingContext2D) {
    for (const solarSystem of this.solarSystems) {
      if (solarSystem.star?.id !== this.getAstres()[0].id) {
        ctx.beginPath()
        ctx.arc(solarSystem.x, solarSystem.y, 0.5, 0, Math.PI * 2) // TODO: replace with something more performant
        ctx.fillStyle = solarSystem.color
        ctx.fill()
      }
    }
  }

  updateSelf: undefined

  findAstre(predicate: (astre: Astre) => boolean): Astre | undefined {
    const astres = this.getChildrenFlat().filter(
      (planet) => planet instanceof Astre
    ) as Astre[]

    return astres.find(predicate)
  }

  getAstres(): Astre[] {
    return this.getChildrenFlat().filter(
      (planet) => planet instanceof Astre
    ) as Astre[]
  }

  getAstresExcept(astre: Astre): Astre[] {
    return this.getChildrenFlat().filter(
      (planet) => planet instanceof Astre && planet !== astre
    ) as Astre[]
  }
}
