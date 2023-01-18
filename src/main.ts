import { hudSlider, hudText } from "./hud";
import { Planet } from "./planet";
import { Ship } from "./ship";
import { Universe } from "./universe";
import { loadImages } from "./utils";

export const CANVAS = document.getElementById("canvas") as HTMLCanvasElement;
export const ctx = CANVAS.getContext("2d") as CanvasRenderingContext2D;

function resizeCanvas() {
  CANVAS.width = document.body.clientWidth;
  CANVAS.height = document.body.clientHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

//mousewheel zoom
export let ZOOM = 0.1;
document.addEventListener("wheel", (e) => {
  if (e.deltaY > 0 && ZOOM > 0.01) {
    ZOOM -= 0.01;
  } else if (e.deltaY < 0 && ZOOM < 2) {
    ZOOM += 0.01;
  }
  if (ZOOM < 0.01) ZOOM = 0.01;
  hudText("zoom", `zoom=${ZOOM.toFixed(2)}`);
});

export let CENTER_X = -CANVAS.width / (2 * ZOOM);
export let CENTER_Y = -CANVAS.height / (2 * ZOOM);

function draw(pov: { x: number; y: number }, universe: Universe) {
  ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);
  // ctx.setLineDash([10, 10]);

  //center & zoom
  CENTER_X = pov.x - CANVAS.width / 2 / ZOOM;
  CENTER_Y = pov.y - CANVAS.height / 2 / ZOOM;

  hudText("x", `x=${pov.x.toFixed(2)}`);
  hudText("y", `y=${pov.y.toFixed(2)}`);
  hudText("centerX", `centerX=${CENTER_X.toFixed(2)}`);
  hudText("centerY", `centerY=${CENTER_Y.toFixed(2)}`);

  ctx.save();
  ctx.scale(ZOOM, ZOOM);
  ctx.translate(-CENTER_X, -CENTER_Y);

  universe.draw(ctx);

  ctx.restore();

  requestAnimationFrame(() => draw(pov, universe));
}

export const IMAGES = await loadImages(["ship"]);

const universe = new Universe();
universe.addChild(new Planet(10000, 10000, 500, 20, 1000, 0));

const ship = new Ship();
universe.addChild(ship);

hudSlider("thrust", ship.maxSpeed, 0, 100, 0, (value) => {
  ship.maxSpeed = value;
});

CANVAS.addEventListener("click", (e: MouseEvent) => {
  const x = CENTER_X + e.clientX / ZOOM;
  const y = CENTER_Y + e.clientY / ZOOM;

  const target = universe.findPlanet((entity) => entity.isInside(x, y));
  console.log(target);

  ship.moveTo(x, y, target);
});

setInterval(() => universe.update(), 1000 / 20);
draw(ship, universe);
