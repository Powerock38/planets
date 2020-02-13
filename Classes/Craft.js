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
    if(!canCraft(inv))
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


new Craft("name",
  [   // itemsIn
    {id:"item1",amount:13},
    {id:"item2",amount:21},
  ],[ // itemsOut
    {id:"item3",amount:3},
  ]
);

module.exports = Craft;
