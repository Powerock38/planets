class Station {
  constructor(initPack) {
    this.id = initPack.id;
    this.x = initPack.x;
    this.y = initPack.y;
    this.rotation = initPack.rotation;
    this.radius = initPack.radius;

    this.angle = 0;

    Station.list[this.id] = this;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x,this.y);
    ctx.rotate(this.angle);
    ctx.translate(-this.x,-this.y);

    let imgSize = this.radius * 2;
    ctx.drawImage(IMAGES.station, this.x - imgSize/2, this.y - imgSize/2, imgSize, imgSize);

    ctx.restore();
    this.angle = (this.angle + this.rotation) % (Math.PI / 2);
  }
}
Station.list = {};
