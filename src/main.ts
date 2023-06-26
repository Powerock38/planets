import { Astre } from "./astre"
import { hudSlider, hudText } from "./hud"
import { Ship } from "./ship"
import { Vec2 } from "./types"
import { Universe } from "./universe"
import { loadImages, rndChoose } from "./utils"

export const CANVAS = document.getElementById("canvas") as HTMLCanvasElement
export const ctx = CANVAS.getContext("2d") as CanvasRenderingContext2D

function resizeCanvas() {
  CANVAS.width = document.body.clientWidth
  CANVAS.height = document.body.clientHeight
}

window.addEventListener("resize", resizeCanvas)
resizeCanvas()

//mousewheel zoom
export let ZOOM = 0.1
const MAX_ZOOM = 1
const MIN_ZOOM = 0.004
document.addEventListener("wheel", (e) => {
  let mult = 1
  if (ZOOM > 0.1) {
    mult = ZOOM * 10
  }

  if (e.deltaY > 0) {
    ZOOM -= 0.01 * mult
  } else if (e.deltaY < 0) {
    ZOOM += 0.01 * mult
  }

  ZOOM = Math.max(MIN_ZOOM, Math.min(ZOOM, MAX_ZOOM))

  hudText("zoom", `zoom=${ZOOM.toFixed(2)}`)
})

export let CENTER_X = -CANVAS.width / (2 * ZOOM)
export let CENTER_Y = -CANVAS.height / (2 * ZOOM)

function draw(pov: Vec2, universe: Universe) {
  ctx.clearRect(0, 0, CANVAS.width, CANVAS.height)
  // ctx.setLineDash([10, 10]);

  //center & zoom
  CENTER_X = pov.x - CANVAS.width / 2 / ZOOM
  CENTER_Y = pov.y - CANVAS.height / 2 / ZOOM

  hudText("x", `x=${pov.x.toFixed(2)}`)
  hudText("y", `y=${pov.y.toFixed(2)}`)
  hudText("centerX", `centerX=${CENTER_X.toFixed(2)}`)
  hudText("centerY", `centerY=${CENTER_Y.toFixed(2)}`)

  ctx.save()
  ctx.scale(ZOOM, ZOOM)
  ctx.translate(-CENTER_X, -CENTER_Y)

  universe.draw(ctx)

  ctx.restore()

  requestAnimationFrame(() => draw(pov, universe))
}

export const IMAGES = await loadImages(["ship", "quarry"])

const universe = new Universe()
universe.addChild(
  new Astre(
    10000,
    10000,
    10000,
    10,
    10000,
    0,
    0,
    rndChoose([
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
    ]),
    1,
    0,
    0,
  )
)

const ship = new Ship(universe)
universe.addChild(ship)

hudSlider("thrust", ship.maxSpeed, 0, 1000, 0, (value) => {
  ship.maxSpeed = value
})

CANVAS.addEventListener("click", (e: MouseEvent) => {
  const x = CENTER_X + e.clientX / ZOOM
  const y = CENTER_Y + e.clientY / ZOOM
  ship.moveTo(x, y)
})

CANVAS.addEventListener("contextmenu", (e: MouseEvent) => {
  e.preventDefault()
  ship.removeMovingMarker()
})

export const DT = 1000 / 60

setInterval(() => universe.update(), DT)

draw(ship, universe)

const astre = rndChoose(universe.getAstres().filter((astre) => astre.nbRings !== 0))
ship.x = astre.realX
ship.y = astre.realY