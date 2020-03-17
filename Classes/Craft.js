class Craft {
  constructor(id, itemsIn, itemsOut) {
    this.id = id;
    this.itemsIn = itemsIn;
    this.itemsOut = itemsOut;

    Craft.list[this.id] = this;
  }

  canCraft(inv) {
    for(let i in this.itemsIn) {
      if(!inv.hasItem(this.itemsIn[i].id, this.itemsIn[i].amount)) {
        return false;
      }
    }
    return true;
  }

  craft(inv) {
    if(!this.canCraft(inv) || !inv.owner.canCraft)
      return;

    for(let i in this.itemsIn) {
      inv.removeItem(this.itemsIn[i].id, this.itemsIn[i].amount);
    }

    for(let i in this.itemsOut) {
      inv.addItem(this.itemsOut[i].id, this.itemsOut[i].amount);
    }
  }
}
Craft.list = {};

new Craft("cannon_2",
  [   // itemsIn
    {id:"cannon_1",amount:1},
    {id:"copper",amount:20},
  ],[ // itemsOut
    {id:"cannon_2",amount:1},
  ]
);
new Craft("sentry",
  [
    {id:"iron",amount:10},
    {id:"copper",amount:20},
  ],[
    {id:"sentry",amount:1},
  ]
);
new Craft("quarry",
  [
    {id:"iron",amount:10},
  ],[
    {id:"quarry",amount:1},
  ]
);

module.exports = Craft;
