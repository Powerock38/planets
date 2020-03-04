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
    ctx.lineTo(this.x - 20, this.y);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "red";
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.closePath();

    ctx.restore();
  }
}
Laser.list = {};
