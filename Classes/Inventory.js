const Craft = require("./Craft.js");
const Quarry = require("./Quarry.js");
const Sentry = require("./Sentry.js");

class Inventory {
  constructor(items, owner) {
    this.items = items;
    this.owner = owner;

    //listen for crafting requests
    SOCKET_LIST[this.owner.id].onmsg("craft", (data)=>{
      Craft.list[data.craftId].craft(this);
    });

    //listen for building requests
    SOCKET_LIST[this.owner.id].onmsg("build", (data)=>{
      BuildItem.list[data.buildItemId].build(this);
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

class BuildItem {
  constructor(id, buildFunction) {
    this.id = id;
    this.buildFunction = buildFunction;

    BuildItem.list[this.id] = this;
  }

  build(inv) {
    if(this.buildFunction(inv.owner) && inv.hasItem(this.id, 1)) {
      inv.removeItem(this.id, 1);
    }
  }
}
BuildItem.list = {};

new BuildItem("quarry",(ship)=>{
  if(!ship.on.ore)
    return false;

  let canBuildHere = true;
  for (let l in Quarry.list) {
    if(Quarry.list[l].ore === ship.on.ore)
      canBuildHere = false;
  }

  if(canBuildHere && ship.on.ore) {
    new Quarry(ship.on.planet.x + ship.on.ore.x, ship.on.planet.y + ship.on.ore.y, ship.on.ore, ship.cargo);
    return true;
  } else {
    return false;
  }
});
new BuildItem("sentry",(ship)=>{
  new Sentry(ship.x, ship.y, ship.id);
  return true;
});

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
  miningRate: 1,
});
new StatItem("mining_arm_1",{
  miningRange: 10,
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
new StatItem("tank_1",{
  fuelMax: 100000,
});
new StatItem("cannon_1",{
  fireRate: 5,
  laserSpeed: 40,
  laserDurability: 100,
  laserDamage: 10,
  laserWidth: 3,
  laserLength: 20
});
new StatItem("cannon_2",{
  fireRate: 10,
  laserSpeed: 60,
  laserDurability: 50,
  laserDamage: 5,
  laserWidth: 5,
  laserLength: 15
});

module.exports = {
  Inventory: Inventory,
  StatItem: StatItem
};
