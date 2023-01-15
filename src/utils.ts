export function rndChoose(arr: any[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function rnd(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
