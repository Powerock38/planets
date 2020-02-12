class Inventory {
  constructor(items, ownerId) {
    this.items = items;
    this.ownerId = ownerId;
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

  update() {
    SOCKET_LIST[this.ownerId].emit('updateInventory', this.items);
  }
}

module.exports = Inventory;
