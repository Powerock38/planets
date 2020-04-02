class Laser {
  constructor(x, y, angle, ownerId, speed, durability, damage, width, length) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.ownerId = ownerId;
    this.speed = speed;
    this.hp = durability;
    this.damage = damage;

    this.width = width;
    this.length = length;

    this.id = uuid("lsr");
    this.spdX = Math.cos(this.angle) * this.speed;
    this.spdY = Math.sin(this.angle) * this.speed;
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
    let sentrylist = require('./Sentry.js').list;
    let targetlist = {...shiplist, ...sentrylist};
    for(let i in targetlist) {
      let target = targetlist[i];
      if(getDistance(target, this) < 30 && (target.id !== this.ownerId || target.ownerId !== this.ownerId)) {
        target.takeDamage(this.damage);
        this.toRemove = true;
        return;
      }
    }
  }

  getInitPack() {
    return Object.assign({
      angle: this.angle,
      width: this.width,
      length: this.length,
    }, this.getUpdatePack());
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
