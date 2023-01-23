export function rndChoose(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function rndInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function rndFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function hexToRgb(hex: string) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

export function loadImages(
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
