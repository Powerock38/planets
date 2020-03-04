class Laser {
  constructor(initPack) {
    for(let i in initPack) {
      if(initPack[i] !== undefined)
        this[i] = initPack[i];
    }

    Laser.list[this.id] = this;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x,this.y);
    ctx.rotate(this.angle);
    ctx.translate(-this.x,-this.y);

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.length, this.y);
    ctx.lineWidth = this.width;
    ctx.strokeStyle = "red";
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.closePath();

    ctx.restore();
  }
}
Laser.list = {};
