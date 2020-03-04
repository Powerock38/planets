class Sentry {
  constructor(initPack) {
    for(let i in initPack) {
      if(initPack[i] !== undefined)
        this[i] = initPack[i];
    }
    Sentry.list[this.id] = this;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x,this.y);
    ctx.rotate(this.angle);
    ctx.translate(-this.x,-this.y);

    let imgSize = this.radius * 2;
    ctx.drawImage(IMAGES.sentry, this.x - imgSize/2, this.y - imgSize/2, imgSize, imgSize);

    ctx.restore();
  }
}
Sentry.list = {};
