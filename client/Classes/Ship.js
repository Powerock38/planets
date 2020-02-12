class Ship {
  constructor(initPack) {
    this.name = initPack.name;
    this.id = initPack.id;

    this.x = initPack.x;
    this.y = initPack.y;
    this.angle = initPack.angle;

    this.turnLeft = initPack.turnLeft;
    this.turnRight = initPack.turnRight;
    this.speedUp = initPack.speedUp;
    this.speedDown = initPack.speedDown;

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
      for (var i = 0; i < 20; i++) {
        let angle = rnd(-20, 20) * (Math.PI / 180);
        let length = rnd(10, 20);
        ctx.strokeStyle = rndChoose(flameColors);
        ctx.beginPath();
        let orig_x = this.x - 5;
        let orig_y = this.y;
        ctx.moveTo(orig_x, orig_y);
        ctx.lineTo(Math.round(orig_x - Math.cos(angle) * length), Math.round(orig_y + Math.sin(angle) * length));
        ctx.closePath();
        ctx.stroke();
      }
    }
    if (this.speedDown) {
      for (var i = 0; i < 10; i++) {
        let angle = rnd(-10, 10) * (Math.PI / 180);
        let length = rnd(5, 10);
        ctx.strokeStyle = rndChoose(flameColors);
        ctx.beginPath();
        let orig_x = this.x + 15;
        let orig_y = this.y - 4;
        ctx.moveTo(orig_x, orig_y);
        ctx.lineTo(Math.round(orig_x + Math.cos(angle) * length), Math.round(orig_y + Math.sin(angle) * length));
        orig_y = this.y + 4;
        ctx.moveTo(orig_x, orig_y);
        ctx.lineTo(Math.round(orig_x + Math.cos(angle) * length), Math.round(orig_y + Math.sin(angle) * length));
        ctx.stroke();
      }
    }

    if (this.turnLeft) {
      for (var i = 0; i < 10; i++) {
        let angle = rnd(-10, 10) * (Math.PI / 180);
        angle += Math.PI / 2;
        let length = rnd(3, 7);
        ctx.strokeStyle = rndChoose(flameColors);
        ctx.beginPath();
        let orig_x = this.x;
        let orig_y = this.y + 5;
        ctx.moveTo(orig_x, orig_y);
        ctx.lineTo(Math.round(orig_x + Math.cos(angle) * length), Math.round(orig_y + Math.sin(angle) * length));
        ctx.closePath();
        ctx.stroke();
      }
    }
    if (this.turnRight) {
      for (var i = 0; i < 10; i++) {
        let angle = rnd(-10, 10) * (Math.PI / 180);
        angle -= Math.PI / 2;
        let length = rnd(3, 7);
        ctx.strokeStyle = rndChoose(flameColors);
        ctx.beginPath();
        let orig_x = this.x;
        let orig_y = this.y - 5;
        ctx.moveTo(orig_x, orig_y);
        ctx.lineTo(Math.round(orig_x + Math.cos(angle) * length), Math.round(orig_y + Math.sin(angle) * length));
        ctx.closePath();
        ctx.stroke();
      }
    }

    //ship
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.moveTo(this.x + 30, this.y);
    ctx.lineTo(this.x - 10, this.y - 10);
    ctx.lineTo(this.x - 10, this.y + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    //ship's red nose
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + 5, this.y - 2.5);
    ctx.lineTo(this.x + 5, this.y + 2.5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
Ship.list = {};
