class Ship {
  constructor(initPack) {
    for(let i in initPack) {
      if(initPack[i] !== undefined)
        this[i] = initPack[i];
    }

    Ship.list[this.id] = this;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x,this.y);
    ctx.rotate(this.angle);
    ctx.translate(-this.x,-this.y);

    //swaggy flames
    let flameColors = ["#FED7A4", "#F7AB57", "#F58021", "#F05D24", "#F26825"]
    if (this.speedUp) {
      for (let i = 0; i < 20; i++) {
        let angle = rnd(-20, 20) * (Math.PI / 180);
        let length = rnd(10, 20);
        ctx.strokeStyle = rndChoose(flameColors);
        ctx.beginPath();
        let orig_x = this.x - 20;
        let orig_y = this.y;
        ctx.moveTo(orig_x, orig_y);
        ctx.lineTo(Math.round(orig_x - Math.cos(angle) * length), Math.round(orig_y + Math.sin(angle) * length));
        ctx.closePath();
        ctx.stroke();
      }
    }
    if (this.speedDown) {
      for (let i = 0; i < 10; i++) {
        let angle = rnd(-10, 10) * (Math.PI / 180);
        let length = rnd(5, 10);
        ctx.strokeStyle = rndChoose(flameColors);
        ctx.beginPath();
        let orig_x = this.x + 6;
        let orig_y = this.y - 8;
        ctx.moveTo(orig_x, orig_y);
        ctx.lineTo(Math.round(orig_x + Math.cos(angle) * length), Math.round(orig_y + Math.sin(angle) * length));
        orig_y = this.y + 8;
        ctx.moveTo(orig_x, orig_y);
        ctx.lineTo(Math.round(orig_x + Math.cos(angle) * length), Math.round(orig_y + Math.sin(angle) * length));
        ctx.stroke();
      }
    }

    if (this.turnLeft) {
      for (let i = 0; i < 10; i++) {
        let angle = rnd(-10, 10) * (Math.PI / 180);
        angle += Math.PI / 2;
        let length = rnd(3, 7);
        ctx.strokeStyle = rndChoose(flameColors);
        ctx.beginPath();
        let orig_x = this.x + 2;
        let orig_y = this.y + 10;
        ctx.moveTo(orig_x, orig_y);
        ctx.lineTo(Math.round(orig_x + Math.cos(angle) * length), Math.round(orig_y + Math.sin(angle) * length));
        ctx.closePath();
        ctx.stroke();
      }
    }
    if (this.turnRight) {
      for (let i = 0; i < 10; i++) {
        let angle = rnd(-10, 10) * (Math.PI / 180);
        angle -= Math.PI / 2;
        let length = rnd(3, 7);
        ctx.strokeStyle = rndChoose(flameColors);
        ctx.beginPath();
        let orig_x = this.x + 2;
        let orig_y = this.y - 10;
        ctx.moveTo(orig_x, orig_y);
        ctx.lineTo(Math.round(orig_x + Math.cos(angle) * length), Math.round(orig_y + Math.sin(angle) * length));
        ctx.closePath();
        ctx.stroke();
      }
    }

    //ship
    let imgWidth = 80;
    let imgHeight = 60;
    ctx.drawImage(IMAGES.ship, this.x - imgWidth/2, this.y - imgHeight/2, imgWidth, imgHeight);

    ctx.restore();
  }
}
Ship.list = {};
