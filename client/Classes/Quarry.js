class Quarry {
  constructor(initPack) {
    this.id = initPack.id;
    this.x = initPack.x;
    this.y = initPack.y;
    this.radius = initPack.radius;

    Quarry.list[this.id] = this;
  }

  draw() {
    ctx.strokeRect(this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
  }
}
Quarry.list = {};
