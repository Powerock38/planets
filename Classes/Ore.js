class Ore {
  constructor(radius) {
    //pick a random ore from the weighted list
    let ore = rndChoose(Ore.list);
    this.id = ore.id;
    //random amount
    this.amount = rnd(0, Math.min(ore.max, radius - 10));

    //generate position
    let angle = Math.random() * 2 * Math.PI;
    let rad = rnd(0, radius - this.amount);
    this.x = Math.round(rad * Math.cos(angle));
    this.y = Math.round(rad * Math.sin(angle));
  }

  mine(inv, amount) {
    if(this.amount < amount)
      return;

    this.amount -= amount;
    inv.addItem(this.id, amount);
  }
}
Ore.list = [
  {id:"cobalt", rarity: 0.2, max: 300},
  {id:"nickel", rarity: 0.4, max: 500},
  {id:"gold", rarity: 0.1, max: 100},
  {id:"platinum", rarity: 0.2, max: 250},
  {id:"iron", rarity: 0.7, max: 1000},
  {id:"silver", rarity: 0.2, max: 200},
  {id:"uranium", rarity: 0.1, max: 50},
  {id:"aluminium", rarity: 0.5, max: 800},
  {id:"copper", rarity: 0.7, max: 1000},
];
//make the list weighted by rarity
let weightedOreList = [];
for(let i in Ore.list) {
  for(let j = 0; j < Ore.list[i].rarity * 10; j++) {
    weightedOreList.push(Ore.list[i]);
  }
}
Ore.list = weightedOreList;

module.exports = Ore;
