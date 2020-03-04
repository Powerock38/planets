class Station {
  constructor(initPack) {
    for(let i in initPack) {
      if(initPack[i] !== undefined)
        this[i] = initPack[i];
    }

    this.rotation = 0.005;
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
