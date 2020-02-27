class Item {
  constructor(id,name,desc,param) {
    this.id = id;
    this.name = name;
    this.desc = desc;
    this.amount = 0;

    for (let i in param)
      if (param[i] !== undefined)
        this[i] = param[i];
    Item.list[this.id] = this;
  }

  static refresh(items) {
    for(let i in Item.list)
      Item.list[i].amount = 0;
    for(let i in items)
      Item.list[items[i].id].amount = items[i].amount;

    //display
    let str = "<ul>";
    for(let i in Item.list) {
      let item = Item.list[i];
      if(item.amount > 0)
        str += "<li>" + item.name + " (" + item.amount + ") </li>";
    }
    document.getElementById("inventory").innerHTML = str + "</ul>";
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

//ship parts
new Item(
  "mining_drill_1",
  "Basic Mining Drill",
  ""
);
new Item(
  "mining_arm_1",
  "Basic Mining Arm",
  ""
);
new Item(
  "armouring_1",
  "Basic Armouring",
  ""
);
new Item(
  "shield_1",
  "Basic Shield",
  ""
);
new Item(
  "thrusters_main_1",
  "Basic Main Thrusters",
  ""
);
new Item(
  "thrusters_side_1",
  "Basic Maneuvring Thrusters",
  ""
);
new Item(
  "engine_1",
  "Basic Engine",
  "Consumes Rocket fuel"
);
new Item(
  "tank_1",
  "Basic Fuel Tank",
  "Stores Rocket fuel"
);
new Item(
  "cannon_1",
  "Basic Cannons",
  ""
);
new Item(
  "cannon_2",
  "Advanced Cannons",
  ""
);
