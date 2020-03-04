class Quarry {
  constructor(initPack) {
    for(let i in initPack) {
      if(initPack[i] !== undefined)
        this[i] = initPack[i];
    }

    this.rotation = (1 / this.radius) * rndChoose([-1,1]);
    this.angle = 0;

    Quarry.list[this.id] = this;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x,this.y);
    ctx.rotate(this.angle);
    ctx.translate(-this.x,-this.y);

    let imgSize = this.radius * 1.5;
    ctx.drawImage(IMAGES.quarry, this.x - imgSize/2, this.y - imgSize/2, imgSize, imgSize);

    ctx.restore();
    this.angle = (this.angle + this.rotation) % (Math.PI * 2);
  }
}
Quarry.list = {};
