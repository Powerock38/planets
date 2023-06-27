import { Astre } from "./astre"
import { Entity } from "./entity"
import { BGCANVAS, bgCtx } from "./main"
import { Ship } from "./ship"
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
      const x = rndInt(0, nbSolarSystems)
      const y = rndInt(0, nbSolarSystems)
      const color = rndChoose(Universe.starColors)

      this.solarSystems.push({ x, y, color })
    }
  }

  goToSolarSystem(ship: Ship, solarSystem: SolarSystem) {
    const star = this.getCurrentStar()
    if (star) {
      this.removeChild(star)
    }

    ship.onAstre = undefined

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

    this.drawStars(bgCtx)
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const child of this.children) {
      child.draw(ctx)
    }
  }

  drawSelf: undefined

  drawStars(bgCtx: CanvasRenderingContext2D) {
    bgCtx.clearRect(0, 0, BGCANVAS.width, BGCANVAS.height)
    const star = this.getCurrentStar()
    for (const solarSystem of this.solarSystems) {
      if (solarSystem.star?.id !== star?.id) {
        const x = (solarSystem.x / this.solarSystems.length) * BGCANVAS.width
        const y = (solarSystem.y / this.solarSystems.length) * BGCANVAS.height
        bgCtx.beginPath()
        bgCtx.fillRect(x, y, 1, 1)
        bgCtx.fillStyle = solarSystem.color
        bgCtx.fill()
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

  getCurrentStar(): Astre | undefined {
    return this.children.find((child) => child instanceof Astre) as Astre
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
