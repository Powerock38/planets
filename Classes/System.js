const Planet = require("./Planet.js");

class System {
  constructor(x, y) {
    this.id = uuid("sys");
    this.x = x;
    this.y = y;
    this.nbPlanet = rnd(10, 25);
    this.radius = rnd(10000, 20000);

    this.starColor = rndChoose(["#FFD27D", "#FFA371", "#A6A8FF", "#FFFA86", "#A87BFF", "#FFFFFF", "#FED7A4", "#F7AB57", "#F58021", "#F05D24", "#F26825"]);
    this.starRadius = rnd(2000, 5000);

    this.planetList = [];
    this.generatePlanets();

    System.list[this.id] = this;
    initPack.system.push(this.getInitPack());
  }

  generatePlanets() {
    for (let i = 0; i < this.nbPlanet; i++) {
      let angle = Math.random() * 2 * Math.PI;
      let rad = rnd(0, this.radius - 1000);
      let x = Math.round(rad * Math.cos(angle) + this.x);
      let y = Math.round(rad * Math.sin(angle) + this.y);

      let pla = new Planet(x, y);
      this.planetList[i] = pla;

      //no planet collisions
      for (let j in this.planetList) {
        if (j != i) {
          let fpla = this.planetList[j];
          let distance = Math.sqrt(Math.pow(pla.x - fpla.x, 2) + Math.pow(pla.y - fpla.y, 2));
          if (distance < pla.radius + Math.max(pla.gravity, fpla.gravity) + fpla.radius) {
            i--;
            break;
          }
        }
      }
    }
  }

  getInitPack() {
    let planetList = [];
    for (let i in this.planetList) {
      planetList.push(this.planetList[i].getInitPack());
    }

    return {
      id: this.id,
      x: this.x,
      y: this.y,
      radius: this.radius,
      starColor: this.starColor,
      starRadius: this.starRadius,
      planetList: planetList,
    }
  }

  static getAllInitPack() {
    let systems = [];
    for (let i in System.list)
      systems.push(System.list[i].getInitPack());
    return systems;
  }

  getUpdatePack() {
    let planetList = [];
    for (let i in this.planetList) {
      let planet = this.planetList[i];
      planetList.push({
        ores: planet.ores
      });
    }

    return {
      id: this.id,
      planetList: planetList
    }
  }

  static update() {
    let pack = [];
    for(let i in System.list){
      pack.push(System.list[i].getUpdatePack());
    }
    return pack;
  }

}
System.list = {};


module.exports = System;
