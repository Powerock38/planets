const Craft = require("./Craft.js");

class Inventory {
  constructor(items, owner) {
    this.items = items;
    this.owner = owner;

    //listen for crafting requests
    SOCKET_LIST[this.owner.id].onmsg("craft", (data)=>{
      Craft.list[data.craftId].craft(this);
    });
  }

  addItem(id, amount) {
    for (let i in this.items) {
      if (this.items[i].id === id) {
        this.items[i].amount += amount;
        this.update();
        return;
      }
    }

    this.items.push({
      id: id,
      amount: amount
    });
    this.update();
  }

  removeItem(id, amount) { // return false = cant remove too much than necessary / true = all good
    for (let i in this.items) {
      if (this.items[i].id === id) {
        if(this.items[i].amount < amount)
          return false;

        this.items[i].amount -= amount;

        if(this.items[i].amount <= 0)
          this.items.splice(i,1);

        this.update();
        return true;
      }
    }
  }

  hasItem(id, amount) {
    for (let i in this.items) {
      if (this.items[i].id === id) {
        return this.items[i].amount >= amount;
      }
    }
  }

  update() { // send items and possible crafts to Inventory owner
    this.owner.updateStats();

    let crafts = [];
    for(let i in Craft.list) {
      let craft = Craft.list[i];
      if(craft.canCraft(this))
        crafts.push(craft);
    }

    SOCKET_LIST[this.owner.id].ssend("updateInventory", {
      items: this.items,
      crafts: crafts
    });
  }
}

class StatItem {
  constructor(id,stats) {
    this.id = id;
    this.stats = {};

    for (let i in stats)
      if (stats[i] !== undefined)
        this.stats[i] = stats[i];

    StatItem.list[this.id] = this;
  }
}
StatItem.list = {};

new StatItem("mining_drill_1",{
  miningRate: 100,
});
new StatItem("mining_arm_1",{
  miningRange: 100,
});
new StatItem("armouring_1",{
  hpMax: 100,
});
new StatItem("shield_1",{
  shieldMaxHP: 50,
  shieldPower: 0.2,
});
new StatItem("thrusters_main_1",{
  thrust: 0.5,
});
new StatItem("thrusters_side_1",{
  turningThrust: 0.005,
});
new StatItem("engine_1",{
  fuel: "fuel",
});
new StatItem("cannon_1",{
  fireRate: 5,
  laserSpeed: 40,
  laserDurability: 100,
  laserDamage: 10,
});
new StatItem("cannon_2",{
  fireRate: 10,
  laserSpeed: 70,
  laserDurability: 300,
  laserDamage: 20,
});

module.exports = {
  Inventory: Inventory,
  StatItem: StatItem
};
