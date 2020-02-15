class Laser {
  constructor(x, y, angle, ownerId, spdX, spdY) {
    this.id = uuid("lsr");
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.ownerId = ownerId;
    this.spdX = Math.cos(this.angle) * 50 + spdX;
    this.spdY = Math.sin(this.angle) * 50 + spdY;
    this.toRemove = false;
    this.timer = 100;

    Laser.list[this.id] = this;
    initPack.laser.push(this.getInitPack());
  }

  update() {
    if(this.timer-- <= 0)
      this.toRemove = true;
    this.x += this.spdX;
    this.y += this.spdY;

    let shiplist = require('./Ship.js').list;
    for(let i in shiplist) {
      let target = shiplist[i];

      if(getDistance(target, this) < 30 && this.ownerId !== target.id) {
        target.hp--;

        if(target.hp <= 0) {
          target.hp = target.hpMax;
          target.spdX = 0;
          target.spdY = 0;
          target.angle = 0;
          target.rotationRate = 0;
          target.x = SPAWNx;
          target.y = SPAWNy;
        }

        this.toRemove = true;
      }
    }
  }

  getInitPack() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      angle: this.angle,
    }
  }

  getUpdatePack() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      angle: this.angle,
    }
  }

  static getAllInitPack() {
    let lasers = [];
    for(let i in Laser.list)
      lasers.push(Laser.list[i].getInitPack());
    return lasers;
  }

  static update() {
    let pack = [];
    for(let i in Laser.list){
      let laser = Laser.list[i];
      laser.update();
      if(laser.toRemove) {
        delete Laser.list[i];
        removePack.laser.push(laser.id);
      } else
        pack.push(laser.getUpdatePack());
    }
    return pack;
  }
}
Laser.list = {};

module.exports = Laser;
