class Laser {
  constructor(x, y, angle, ownerId, spdX, spdY, speed, durability, damage) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.ownerId = ownerId;
    this.speed = speed;
    this.hp = durability;
    this.damage = damage;

    this.id = uuid("lsr");
    this.spdX = Math.cos(this.angle) * this.speed + spdX;
    this.spdY = Math.sin(this.angle) * this.speed + spdY;
    this.toRemove = false;

    Laser.list[this.id] = this;
    initPack.laser.push(this.getInitPack());
  }

  update() {
    if(this.hp-- <= 0)
      this.toRemove = true;
    this.x += this.spdX;
    this.y += this.spdY;

    let shiplist = require('./Ship.js').list;
    for(let i in shiplist) {
      let target = shiplist[i];

      if(getDistance(target, this) < 30 && target.id !== this.ownerId) {
        this.hit(target);
        this.toRemove = true;
      }
    }
  }

  hit(target) {
    if(target.shieldHP <= 0) {
      target.hp -= this.damage;

      if(target.hp <= 0) {
        target.hp = target.hpMax;
        target.spdX = 0;
        target.spdY = 0;
        target.angle = 0;
        target.rotationRate = 0;
        target.x = SPAWNx;
        target.y = SPAWNy;
        target.shieldHP = target.shieldMaxHP;
      }
    } else {
      target.shieldHP -= Math.round(this.damage * (1 - target.shieldPower));
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
