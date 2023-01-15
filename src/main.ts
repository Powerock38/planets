import { Entity } from "./entity";
import { Ship } from "./ship";

export const CANVAS = document.getElementById("canvas") as HTMLCanvasElement;
export const ctx = CANVAS.getContext("2d") as CanvasRenderingContext2D;

function resizeCanvas() {
  CANVAS.width = window.innerWidth;
  CANVAS.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function draw() {
  ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);
  Entity.all.forEach((entity) => entity.draw());

  requestAnimationFrame(draw);
}

function update() {
  Entity.all.forEach((entity) => entity.update());
}

function loadImages(
  imageNames: string[]
): Promise<Record<string, HTMLImageElement>> {
  const loadedImages: Record<string, HTMLImageElement> = {};
  return new Promise((resolve) => {
    imageNames.forEach((imageName) => {
      let img = new Image();
      img.src = `./assets/${imageName}.svg`;
      img.onload = () => {
        loadedImages[imageName] = img;
        if (Object.values(loadedImages).length === imageNames.length) {
          resolve(loadedImages);
        }
      };
    });
  });
}

export const IMAGES = await loadImages(["ship"]);
setInterval(update, 1000 / 20);
draw();

new Ship();
