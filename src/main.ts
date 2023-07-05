import { BuildEntity } from "./buildentity"
import { Cargo } from "./cargo"
import {
  HUD_VALUES,
  hudButton,
  hudSlider,
  hudText,
  toggleHudValue,
} from "./hud"
import { Quarry } from "./quarry"
import { Ship } from "./ship"
import { Vec2 } from "./types"
import { Universe } from "./universe"
import { loadImages, rndChoose, wait } from "./utils"

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

let MOUSE_X = 0
let MOUSE_Y = 0

document.addEventListener("mousemove", (e) => {
  MOUSE_X = e.clientX
  MOUSE_Y = e.clientY
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

  const X_RELATIVE_TO_CENTER = CENTER_X + MOUSE_X / ZOOM
  const Y_RELATIVE_TO_CENTER = CENTER_Y + MOUSE_Y / ZOOM

  const BuildClass = HUD_VALUES.get("tryBuild") as
    | typeof BuildEntity
    | undefined
  if (BuildClass) {
    ctx.fillStyle = "rgba(255,255,255,0.8)"
    BuildClass.drawPreview(ctx, X_RELATIVE_TO_CENTER, Y_RELATIVE_TO_CENTER)
  }

  ctx.restore()

  requestAnimationFrame(() => draw(pov, universe))
}

export const IMAGES = await loadImages(["ship", "quarry"])

const ship = new Ship(universe)
universe.addChild(ship)
universe.goToSolarSystem(ship, universe.solarSystems[0])

let hyperspace = false

hudButton(
  "explore",
  "explore",
  async () => {
    if (hyperspace) return

    hyperspace = true
    ship.removeMovingMarker()

    ZOOM = MIN_ZOOM

    const newSolarSystem = rndChoose(universe.solarSystems)

    const angle = Math.atan2(
      newSolarSystem.y - universe.currentSolarSystem.y,
      newSolarSystem.x - universe.currentSolarSystem.x
    )

    const distance = Math.sqrt(
      (newSolarSystem.x - universe.currentSolarSystem.x) ** 2 +
        (newSolarSystem.y - universe.currentSolarSystem.y) ** 2
    )

    const hyperspaceDuration = Math.min(Math.max(distance, 10), 1000)

    bgCtx.save()
    ctx.save()

    for (let i = 0; i < hyperspaceDuration; i++) {
      bgCtx.translate(
        (i / hyperspaceDuration) * Math.cos(angle) * 3,
        (i / hyperspaceDuration) * Math.sin(angle) * 3
      )
      ctx.translate((i / 10) * Math.cos(angle), (i / 10) * Math.sin(angle))
      universe.drawStars(bgCtx, false)
      await wait(100 / (i * i))
    }

    bgCtx.restore()
    ctx.restore()
    universe.goToSolarSystem(ship, newSolarSystem)

    const arrivalDistance = newSolarSystem.star!.radius * 10

    ship.angle = (angle + Math.PI) % (Math.PI * 2)
    ship.x = arrivalDistance * Math.cos(angle)
    ship.y = arrivalDistance * Math.sin(angle)

    ship.moveTo(
      newSolarSystem.star!.radius * 1.5 * Math.cos(angle),
      newSolarSystem.star!.radius * 1.5 * Math.sin(angle)
    )

    hyperspace = false
  },
  "x"
)

hudButton(
  "toggleOrbits",
  "toggle orbits",
  () => {
    toggleHudValue("showOrbits")
  },
  "u"
)

hudButton(
  "toggleGravityRanges",
  "toggle gravity ranges",
  () => {
    toggleHudValue("showGravityRanges")
  },
  "y"
)

hudButton(
  "toggleOreText",
  "toggle ore text",
  () => {
    toggleHudValue("showOreText")
  },
  "t"
)

hudButton(
  "buildQuarry",
  "build quarry",
  () => {
    HUD_VALUES.set("tryBuild", Quarry)
  },
  "a"
)

hudButton(
  "buildCargo",
  "build cargo",
  () => {
    HUD_VALUES.set("tryBuild", Cargo)
  },
  "e"
)

hudSlider("thrust", ship.maxSpeed, 0, 1000, 0, (value) => {
  ship.maxSpeed = value
})

CANVAS.addEventListener("click", (e: MouseEvent) => {
  e.preventDefault()
  const x = CENTER_X + e.clientX / ZOOM
  const y = CENTER_Y + e.clientY / ZOOM

  const BuildClass = HUD_VALUES.get("tryBuild") as
    | typeof BuildEntity
    | undefined
  if (BuildClass) {
    const built = BuildClass.tryBuild(ship, x, y)
    if (built) {
      HUD_VALUES.delete("tryBuild")
    }
  } else {
    ship.moveTo(x, y)
  }
})

CANVAS.addEventListener("contextmenu", (e: MouseEvent) => {
  e.preventDefault()
  const x = CENTER_X + e.clientX / ZOOM
  const y = CENTER_Y + e.clientY / ZOOM

  if (HUD_VALUES.has("tryBuild")) {
    HUD_VALUES.delete("tryBuild")
  } else {
    HUD_VALUES.delete("selectedEntity")

    for (const build of universe
      .getChildrenFlat()
      .filter((build) => "isBuildEntity" in build) as BuildEntity[]) {
      if (build.collides(x, y)) {
        HUD_VALUES.set("selectedEntity", build)
        console.log("selected", build)
        // build.removeFromParent()
        break
      }
    }

    if (!HUD_VALUES.has("selectedEntity")) {
      ship.removeMovingMarker()
    }
  }
})

export const DT = 1000 / 60

setInterval(() => universe.update(), DT)

draw(ship, universe)
