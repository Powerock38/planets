class Planet {
  constructor(initPack) {
    this.x = initPack.x;
    this.y = initPack.y;
    this.radius = initPack.radius;
    this.gravity = initPack.gravity;
    this.color = initPack.color;
    this.ores = initPack.ores;
  }

  draw() {
    // draw the circle (the planet)
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();

    //gravity ring
    if (Zoom > 0.06) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + this.gravity, 0, 2 * Math.PI);
      ctx.strokeStyle = "white";
      ctx.stroke();
    }

    // draw all ore patches
    if (Zoom > 0.01) {
      for (var i in this.ores) {
        let ore = this.ores[i];
        ctx.beginPath();
        ctx.arc(this.x + ore.x, this.y + ore.y, ore.amount, 0, 2 * Math.PI);
        let rgb = hexToRgb(Item.list[ore.id].color);
        ctx.fillStyle = "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 0.8)";
        ctx.fill();
      }
    }
  }
}
