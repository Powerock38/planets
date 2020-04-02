const Laser = require("./Laser.js");

class Sentry {
  constructor(x, y, ownerId) {
    this.id = uuid("sen");
    this.x = x;
    this.y = y;
    this.ownerId = ownerId;

    this.hp = 200;
    this.angle = 0;
    this.radius = 100;
    this.range = 4000;
    this.fireRate = 2;
    this.fireReady = true;
    this.rotationRate = 0.001;

    Sentry.list[this.id] = this;
    initPack.sentry.push(this.getInitPack());
  }

  update() {
    this.updateAttack();
  }

  updateAttack() {
    let shiplist = require('./Ship.js').list;
    let targetDistance = this.range;
    let target;
    for(let i in shiplist) {
      let ship = shiplist[i];
      let distance = getDistance(ship, this);
      if(distance < this.range && distance > this.radius && ship.id !== this.ownerId) {
        if(distance < targetDistance) {
          targetDistance = distance;
          target = ship;
        }
      }
    }
    if(target) {
      this.angle = Math.atan2(target.y - this.y, target.x - this.x);
      this.shoot();
    }
  }

  shoot() {
    if(this.fireReady) {
      new Laser(
        this.x + Math.cos(this.angle) * this.radius,
        this.y + Math.sin(this.angle) * this.radius,
        this.angle, this.ownerId,
        50,  //speed
        500, //durability
        50,  //damage
        8,   //width
        40   //length
      );
      this.fireReady = false;
      setTimeout(()=>{
        this.fireReady = true;
      }, 1000 / this.fireRate);
    }
  }

  takeDamage(damage) {
    this.hp -= damage;
    if(this.hp <= 0) {
      delete Sentry.list[this.id];
      removePack.sentry.push(this.id);
    }
  }

  getInitPack() {
    return Object.assign({
      radius: this.radius,
    }, this.getUpdatePack());
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
    let sentries = [];
    for (let i in Sentry.list)
      sentries.push(Sentry.list[i].getInitPack());
    return sentries;
  }

  static update() {
    let pack = [];
    for (let i in Sentry.list) {
      Sentry.list[i].update();
      pack.push(Sentry.list[i].getUpdatePack());
    }
    return pack;
  }
}
Sentry.list = {};

module.exports = Sentry;
