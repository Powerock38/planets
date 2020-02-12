class System {
  constructor(initPack) {
    this.id = initPack.id;
    this.x = initPack.x;
    this.y = initPack.y;
    this.radius = initPack.radius;
    this.starColor = initPack.starColor;
    this.starRadius = initPack.starRadius;

    //this.planetList = initPack.planetList;
    this.planetList = [];
    for (var i in initPack.planetList) {
      this.planetList.push(new Planet(initPack.planetList[i]));
    }

    System.list[this.id] = this;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 20;
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  drawStar() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.starRadius, 0, 2 * Math.PI);
    let rgb = hexToRgb(this.starColor);
    ctx.fillStyle = "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 0.8)";
    ctx.fill();
  }
}
System.list = {};
