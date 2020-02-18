class Craft {
  constructor(craft) {
    this.id = craft.id;
    this.itemsIn = craft.itemsIn;
    this.itemsOut = craft.itemsOut;
    Craft.list[this.id] = this;
  }

  reqCraft() {
    connection.send(JSON.stringify({h: 'craft', data: {craftId: this.id}}));
  }

  refresh() {
    let li = document.createElement("button");
    li.onclick = ()=>{ this.reqCraft() };
    li.innerHTML = Craft.getItemListString(this.itemsIn) + " = " + Craft.getItemListString(this.itemsOut);

    return li;
  }

  static getItemListString(items) {
    let str = "";
    for(let i in items) {
      let item = Item.list[items[i].id];
      str += item.name + " (" + items[i].amount + ")" + " + ";
    }
    return str.substring(0, str.length - 3);
  }

  static refresh(crafts) {
    Craft.list = {};
    for(let i in crafts)
      new Craft(crafts[i]);

    let ul = document.createElement("ul");
    for(let i in Craft.list)
      ul.appendChild(Craft.list[i].refresh());

    document.getElementById("craftlist").innerHTML = "";
    document.getElementById("craftlist").appendChild(ul);
  }
}
Craft.list = {};
