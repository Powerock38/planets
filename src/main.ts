import { hudButton, hudSlider, hudText, toggleHudValue } from "./hud"
import { Ship } from "./ship"
import { Vec2 } from "./types"
import { Universe } from "./universe"
import { loadImages, rndChoose } from "./utils"

export const CANVAS = document.getElementById("canvas") as HTMLCanvasElement
const ctx = CANVAS.getContext("2d") as CanvasRenderingContext2D

export const BGCANVAS = document.getElementById(
  "bg-canvas"
) as HTMLCanvasElement
export const bgCtx = BGCANVAS.getContext("2d") as CanvasRenderingContext2D

const universe = new Universe(1000)

function resizeCanvas() {
  CANVAS.width = document.body.clientWidth
  CANVAS.height = document.body.clientHeight
  BGCANVAS.width = document.body.clientWidth
  BGCANVAS.height = document.body.clientHeight
  universe?.drawStars(bgCtx)
}

window.addEventListener("resize", resizeCanvas)
resizeCanvas()

//mousewheel zoom
const MAX_ZOOM = 1
const MIN_ZOOM = 0.004
export let ZOOM = MIN_ZOOM
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

  //center & zoom
  CENTER_X = pov.x - CANVAS.width / 2 / ZOOM
  CENTER_Y = pov.y - CANVAS.height / 2 / ZOOM

  hudText("x", `x=${pov.x.toFixed(2)}`)
  hudText("y", `y=${pov.y.toFixed(2)}`)
  // hudText("centerX", `centerX=${CENTER_X.toFixed(2)}`)
  // hudText("centerY", `centerY=${CENTER_Y.toFixed(2)}`)

  ctx.save()
  ctx.scale(ZOOM, ZOOM)
  ctx.translate(-CENTER_X, -CENTER_Y)

  universe.draw(ctx)

  ctx.restore()

  requestAnimationFrame(() => draw(pov, universe))
}

export const IMAGES = await loadImages(["ship", "quarry"])

const ship = new Ship(universe)
universe.addChild(ship)
universe.goToSolarSystem(ship, universe.solarSystems[0])

hudButton("explore", "explore", () => {
  universe.goToSolarSystem(ship, rndChoose(universe.solarSystems))
})

hudButton("toggleOrbits", "toggle orbits", () => {
  toggleHudValue("showOrbits")
})

hudButton("toggleGravityRanges", "toggle gravity ranges", () => {
  toggleHudValue("showGravityRanges")
})

hudButton("toggleOreText", "toggle ore text", () => {
  toggleHudValue("showOreText")
})

hudButton("buildQuarry", "build quarry", () => {
  ship.buildQuarry()
})

hudSlider("thrust", ship.maxSpeed, 0, 1000, 0, (value) => {
  ship.maxSpeed = value
})

CANVAS.addEventListener("click", (e: MouseEvent) => {
  e.preventDefault()
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
