class Quarry {
  constructor(x, y, ore, inventory) {
    this.id = uuid("qua");
    this.x = x;
    this.y = y;
    this.radius = ore.amount;
    this.ore = ore;
    this.inventory = inventory;
    this.miningRate = 0.8;

    Quarry.list[this.id] = this;
    initPack.quarry.push(this.getInitPack());
    this.mineUpdateLoop();
  }

  mineUpdateLoop() {
    if(SOCKET_LIST[this.inventory.owner.id] !== undefined && this.ore.amount > 0) {
      this.ore.mine(this.inventory, 1);
      setTimeout(()=>{
          this.mineUpdateLoop();
      }, 1000 / this.miningRate);
    }
  }

  getInitPack() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      radius: this.radius
    }
  }

  static getAllInitPack() {
    let quarries = [];
    for (let i in Quarry.list)
      quarries.push(Quarry.list[i].getInitPack());
    return quarries;
  }
}
Quarry.list = {};

module.exports = Quarry;
