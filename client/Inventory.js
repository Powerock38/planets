class Inventory {
  constructor(items) {
    this.items = [];
    if(items !== undefined)
      this.items = items;
  }

  addItem(id, amount) {
    for (let i in this.items) {
      if (this.items[i].id === id) {
        this.items[i].amount += amount;
        return;
      }
    }

    this.items.push({
      id: id,
      amount: amount
    });
  }

  removeItem(id, amount) { // return false = removed too much than necessary / true = all good
    for (let i in this.items) {
      if (this.items[i].id === id) {
        if(this.items[i].amount < amount)
          return false;

        this.items[i].amount -= amount;

        if(this.items[i].amount <= 0)
          this.items.splice(i,1);

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

}

class Item {
  constructor(id,name,desc) {
    this.id = id;
    this.name = name;
    this.desc = desc;
    Item.list[this.id] = this;
  }
}
Item.list = {};

if(typeof module !== "undefined") {
  module.exports = {
    Inventory: Inventory,
    Item: Item
  };
}
