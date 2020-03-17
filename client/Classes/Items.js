class Item {
  constructor(id, name, desc, param) {
    this.id = id;
    this.name = name;
    this.desc = desc;
    this.amount = 0;

    for (let i in param)
      if (param[i] !== undefined)
        this[i] = param[i];
    Item.list[this.id] = this;
  }

  reqBuild() {
    if(this.build !== undefined)
      connection.send(JSON.stringify({h: 'build', data: {buildItemId: this.id}}));
  }

  static refresh(items) {
    for(let i in Item.list)
      Item.list[i].amount = 0;
    for(let i in items)
      Item.list[items[i].id].amount = items[i].amount;

    //display
    let ul = document.createElement("ul");
    for(let i in Item.list) {
      let item = Item.list[i];
      if(item.amount > 0) {
        let li = document.createElement("li");
        li.innerHTML = item.name + " (" + item.amount + ")";
        if(item.build) {
          let btn = document.createElement("button");
          btn.innerHTML = "Build";
          btn.onclick = ()=>{ item.reqBuild() };
          li.appendChild(btn);
        }
        ul.appendChild(li);
      }
    }
    hud.inventory.textContent = "";
    hud.inventory.appendChild(ul);

    // for(let i in Item.list) {
    //   let item = Item.list[i];
    //   if(item.amount > 0) {
    //     if(item.color !== undefined) {
    //       let obj = document.createElement("object");
    //       obj.type = "image/svg+xml";
    //       obj.data = "images/ore.svg";
    //
    //       obj.width = "64px";
    //       obj.height = "64px";
    //
    //       document.getElementById("inventory").innerHTML = "";
    //       obj = document.getElementById("inventory").appendChild(obj);
    //       console.log(obj);
    //       obj.style.fill = item.color;
    //
    //       // for(let path of obj.document.getElementsByTagName("path")) {
    //       //   path.setAttribute("fill", item.color);
    //       // }
    //     }
    //   }
    // }
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

//Structures
new Item(
  "sentry",
  "Sentry",
  "Low accuracy",
  {build: "sentry"}
);
new Item(
  "quarry",
  "Quarry",
  "Autonomous mining system",
  {build: "quarry"}
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
