class Inventory {
  constructor(items) {
    this.items = items;
    this.refresh();
  }

  refresh() {
    let str = "<ul>";
    for(let i in this.items) {
      let item = Item.list[this.items[i].id];
      str += "<li>" + item.name + " (" + this.items[i].amount + ") </li>";
    }
    document.getElementById("inventory").innerHTML = str + "</ul>";
  }
}

class Item {
  constructor(id,name,desc,param) {
    this.id = id;
    this.name = name;
    this.desc = desc;

    for (var i in param) if (param[i] !== undefined) this[i] = param[i];
    Item.list[this.id] = this;
  }
}
Item.list = {};

new Item(
  "cobalt",
  "Cobalt",
  "A blue mineral",
  {color: "#3d59ab"}
);
new Item(
  "nickel",
  "Nickel",
  "",
  {color: "#9ea5ac"}
);
new Item(
  "gold",
  "Gold",
  "",
  {color: "#ffd700"}
);
new Item(
  "platinum",
  "Platinum",
  "",
  {color: "#55d3df"}
);
new Item(
  "iron",
  "Iron",
  "",
  {color: "#757575"}
);
new Item(
  "silver",
  "Silver",
  "",
  {color: "#c1c1c1"}
);
new Item(
  "uranium",
  "Uranium",
  "",
  {color: "#00fe00"}
);
new Item(
  "aluminium",
  "Aluminium",
  "",
  {color: "#adb2bd"}
);
new Item(
  "copper",
  "Copper",
  "",
  {color: "#b87333"}
);
new Item(
  "fuel",
  "Rocket fuel",
  "A good chemical cocktail that makes your spaceship go forward"
);
