const Ore = require("./Ore.js");

class Planet {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = rnd(500, 1000);
    this.friction = rndFloat(0.95, 0.99);
    this.mass = rnd(this.radius * 200, this.radius * 500);
    this.gravity = this.mass * 0.005;
    this.color = rndChoose([
      "#FED7A4", "#F7AB57", "#F58021", "#F05D24", "#F26825",
      "#E3E6E8", "#C1C0C0", "#949494", "#848686", "#7E7F7F",
      "#A1ACB6", "#6C7B48", "#B18C73", "#151340", "#212D60",
      "#DFA964", "#A07845", "#AE946E", "#52575D", "#21384C",
      "#F6CDAA", "#FAB176", "#DB6B30", "#6F2315", "#4F1F11",
      "#CEECF9", "#C3E6F0", "#BCDEE7", "#AACBD2", "#739097",
      "#CBDEF2", "#867AB9", "#7563AC", "#6751A2", "#4B3D81",
      "#F9E4C4", "#DCC592", "#B99F7A", "#8F6F40", "#412F21",
      "#E1D399", "#B3AE84", "#C1B685", "#E5D59D", "#9D9366",
      "#CEDCEB", "#969FA1", "#798791", "#4C5062", "#424C5C",
    ]);
    this.generateOres();
  }

  generateOres() {
    let nbOres = rnd(1, 5); //how much ore patches

    this.ores = [];
    for(let i = 0; i < nbOres; i++) {
      this.ores[i] = new Ore(this.radius);
    }
  }

  getInitPack() {
    return {
      x: this.x,
      y: this.y,
      radius: this.radius,
      gravity: this.gravity,
      color: this.color,
      ores: this.ores
    }
  }
}

module.exports = Planet;
