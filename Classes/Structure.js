class Structure {
  constructor(x, y, type) {
    this.id = uuid("str");
    this.x = x;
    this.y = y;
    this.type = type;
    this.rotation = 0.005;
    this.radius = 200;

    Structure.list[this.id] = this;
  }

  getInitPack() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      type: this.type,
      rotation: this.rotation,
      radius: this.radius
    }
  }

  static getAllInitPack() {
    let structures = [];
    for (let i in Structure.list)
      structures.push(Structure.list[i].getInitPack());
    return structures;
  }
}
Structure.list = {};

module.exports = Structure;
