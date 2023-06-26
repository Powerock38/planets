import { Ore } from "./ore"
import { PolygonEntity } from "./polygonentity"
import { Vec2 } from "./types"
import { rndChoose, rndExponential, rndFloat, rndInt } from "./utils"

export class Astre extends PolygonEntity {
  static colors = [
    "#FED7A4",
    "#F7AB57",
    "#F58021",
    "#F05D24",
    "#F26825",
    "#E3E6E8",
    "#C1C0C0",
    "#949494",
    "#848686",
    "#7E7F7F",
    "#A1ACB6",
    "#6C7B48",
    "#B18C73",
    "#151340",
    "#212D60",
    "#DFA964",
    "#A07845",
    "#AE946E",
    "#52575D",
    "#21384C",
    "#F6CDAA",
    "#FAB176",
    "#DB6B30",
    "#6F2315",
    "#4F1F11",
    "#CEECF9",
    "#C3E6F0",
    "#BCDEE7",
    "#AACBD2",
    "#739097",
    "#CBDEF2",
    "#867AB9",
    "#7563AC",
    "#6751A2",
    "#4B3D81",
    "#F9E4C4",
    "#DCC592",
    "#B99F7A",
    "#8F6F40",
    "#412F21",
    "#E1D399",
    "#B3AE84",
    "#C1B685",
    "#E5D59D",
    "#9D9366",
    "#CEDCEB",
    "#969FA1",
    "#798791",
    "#4C5062",
    "#424C5C",
  ]

  angle = 0

  constructor(
    x: number,
    y: number,
    public mass = rndInt(100, 100000),
    nbMoons = rndInt(0, 10),
    public radius = rndInt(500, 1000),
    nbOres = rndInt(0, 5),
    public nbRings = rndExponential(1), // if 0, it's part of a ring
    color = rndChoose(Astre.colors),
    private orbitDirection = rndChoose([-1, 1]),
    private orbitSpeed = rndFloat(Math.PI / 100000, Math.PI / 1000),
    sides = rndChoose([0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  ) {
    super(radius, x, y, sides, color)
    this.drawingRadius = this.radius + this.mass

    // ORES
    for (let i = 0; i < nbOres; i++) {
      let isValidCircle = false
      let newOre: Ore | undefined
      const oreType = Ore.randomOreType()

      let triesLeft = 1000

      while (!isValidCircle && triesLeft-- > 0) {
        // Generate random radius for the new ore
        const randomRadius = rndInt(
          10,
          Math.min(oreType.max, Math.floor(this.getInnerRadius()))
        )

        // Generate random position within this astre
        const angle = Math.random() * 2 * Math.PI
        const distanceFromCenter = rndInt(0, this.getInnerRadius() - randomRadius)
        const randomX = Math.round(distanceFromCenter * Math.cos(angle))
        const randomY = Math.round(distanceFromCenter * Math.sin(angle))

        newOre = new Ore(randomRadius, randomX, randomY, oreType)

        // Check if the new ore overlaps with any existing ores
        isValidCircle = !this.children
          .filter((entity) => entity instanceof Ore)
          .some((ore) => {
            const dx = ore.x - newOre!.x
            const dy = ore.y - newOre!.y
            const distance = Math.sqrt(dx * dx + dy * dy)
            return distance < ore.radius + newOre!.radius
          })
      }

      if (newOre && isValidCircle) {
        this.addChild(newOre)
      }

      // const oreType = Ore.randomOreType()
      // const angle = Math.random() * 2 * Math.PI
      // const radius = rndInt(0, Math.min(oreType.max, this.radius * 0.99))
      // const distanceFromCenter = rndInt(0, this.radius - radius)
      // const x = Math.round(distanceFromCenter * Math.cos(angle))
      // const y = Math.round(distanceFromCenter * Math.sin(angle))
      // this.addChild(new Ore(radius, x, y, oreType))
    }

    // Asteroids belt
    let astreOrbit = this.radius + this.mass
    if (nbRings) {
      this.addChildren(
        Array.from({ length: Math.floor(nbRings) }, (_, i) => {
          const ringOrbit = astreOrbit + i * 1000
          const ringOrbitDirection = rndChoose([-1, 1])
          const ringOrbitSpeed = rndFloat(Math.PI / 10000, Math.PI / (i * 1000))
          const nbAsteroids = Math.floor((2 * Math.PI * ringOrbit) / 1000)

          return Array.from({ length: Math.floor(nbAsteroids) }, (_, j) => {
            const astreRadius = rndInt(50, 100)
            const orbitAngle = (j / nbAsteroids) * Math.PI * 2

            const asteroid = new Astre(
              ringOrbit * Math.cos(orbitAngle),
              ringOrbit * Math.sin(orbitAngle),
              0,
              0,
              astreRadius,
              1,
              0,
              rndChoose(Astre.colors),
              ringOrbitDirection,
              ringOrbitSpeed + rndChoose([-1, 1]) * rndFloat(0, Math.PI / 1000)
            )

            return asteroid
          })
        }).flat()
      )
    }

    // Moons
    if (nbMoons) {
      this.addChildren(
        Array.from({ length: nbMoons }, (_, i) => {
          const astreRadius = rndInt(500, 1000)
          const astreMass = rndInt(this.mass * 0.1, this.mass * 0.9)
          astreOrbit += astreRadius + astreMass
          const orbitAngle = (i / nbMoons) * Math.PI * 2

          const astre = new Astre(
            astreOrbit * Math.cos(orbitAngle),
            astreOrbit * Math.sin(orbitAngle),
            astreMass,
            rndInt(0, nbMoons * 0.1),
            astreRadius
          )

          astreOrbit += rndInt(astreMass * 0.2, astreMass * 1.5)

          return astre
        })
      )
    }
  }

  drawSelf(ctx: CanvasRenderingContext2D) {
    // orbit
    if (this.parent instanceof Astre && this.nbRings !== 0) {
      ctx.lineWidth = this.radius / 200
      ctx.beginPath()
      ctx.arc(0, 0, Math.sqrt(this.x ** 2 + this.y ** 2), 0, 2 * Math.PI)
      ctx.strokeStyle = "#F0F0F0"
      ctx.stroke()
    }

    // astre
    super.drawSelf(ctx)

    // gravity field
    if (this.mass) {
      ctx.lineWidth = 20
      ctx.setLineDash([this.mass / 10, this.mass / 10])

      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius + this.mass, 0, 2 * Math.PI)
      ctx.strokeStyle = "yellow"
      ctx.stroke()

      ctx.setLineDash([])
    }
  }

  updateSelf() {
    if (this.parent instanceof Astre) {
      const pos = this.computeNewPosition()
      this.x = pos.x
      this.y = pos.y
    }
  }

  computeNewPosition(): Vec2 {
    if (this.parent instanceof Astre) {
      const angle = Math.atan2(this.y, this.x)
      const orbit = Math.sqrt(this.x ** 2 + this.y ** 2)
      const orbitAngle = angle + this.orbitDirection * this.orbitSpeed
      return {
        x: orbit * Math.cos(orbitAngle),
        y: orbit * Math.sin(orbitAngle),
      }
    }

    return { x: this.x, y: this.y }
  }

  computeNewAbsolutePosition(): Vec2 {
    if (this.parent instanceof Astre) {
      const parentPos = this.parent.computeNewAbsolutePosition()
      const pos = this.computeNewPosition()
      return { x: parentPos.x + pos.x, y: parentPos.y + pos.y }
    }

    return { x: this.x, y: this.y }
  }

  collidesInGravityRange(x: number, y: number) {
    const distance = Math.sqrt((this.realX - x) ** 2 + (this.realY - y) ** 2)
    return distance < this.radius + this.mass
  }
}
