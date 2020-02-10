class Ship {
  constructor(param) {
    this.name = Ship.generateName();
    this.id = "";

    this.x = 0;
    this.y = 0;
    this.angle = 0;

    this.turnLeft = false;
    this.turnRight = false;
    this.speedUp = false;
    this.speedDown = false;

    this.spdX = 0;
    this.spdY = 0;
    this.maxSpeed = 20;
    this.rotationRate = 0;
    this.thrust = 0.5;

    for (var i in param) if (param[i] !== undefined) this[i] = param[i];

    Ship.list[this.id] = this;
    initPack.ship.push(this.getInitPack());
  }

  updateSpeed() {
    let thrustX = this.thrust * Math.cos(this.angle);
    let thrustY = this.thrust * Math.sin(this.angle);

    //let speed = Math.sqrt(this.spdX * this.spdX + this.spdY * this.spdY);
    //maxspeed

    if (this.speedUp) {
      this.spdX += thrustX;
      this.spdY += thrustY;
    } else if (this.speedDown) {
      this.spdX -= thrustX;
      this.spdY -= thrustY;
    }

    if (this.turnRight) this.rotationRate += 0.005;
    if (this.turnLeft) this.rotationRate -= 0.005;

    this.angle += this.rotationRate;

    this.x += this.spdX;
    this.y += this.spdY;
  }

  updateCollisions() {
    // if in system range
    for (var i in System.list) {
      let system = System.list[i];
      let systemDistance = getDistance({x: this.x, y: this.y},{x: system.x, y: system.y});
      if (systemDistance <= system.radius) {

        //planet collision
        for (var j in system.planetList) {
          let planet = system.planetList[j];
          let planetDistance = getDistance({x: this.x, y: this.y},{x: planet.x, y: planet.y});

          if (planetDistance < planet.radius) {
            this.spdX *= planet.friction;
            this.spdY *= planet.friction;
            this.rotationRate *= planet.friction;

            //ore collision
            for (var k in planet.ores) {
              let ore = planet.ores[k];
              let oreDistance = getDistance({x: this.x, y: this.y},{x: planet.x + ore.x, y: planet.y + ore.y});
              if (oreDistance < ore.quantity) {
                ore.quantity--; //mining
              }
            }

            //if in gravity range
          } else if (planetDistance <= planet.gravity + planet.radius && planetDistance >= planet.radius) {
            let angle = Math.atan2(planet.y - this.y, planet.x - this.x);
            let speed = planet.mass / (planetDistance * planetDistance);
            this.spdX += speed * Math.cos(angle);
            this.spdY += speed * Math.sin(angle);
          }
        }
      }
    }
  }

  update() {
    this.updateCollisions();
    this.updateSpeed();
  }

  getInitPack() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      angle: this.angle,
      name: this.name,
      turnLeft: this.turnLeft,
      turnRight: this.turnRight,
      speedUp: this.speedUp,
      speedDown: this.speedDown
    }
  }

  getUpdatePack() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      angle: this.angle,
      turnLeft: this.turnLeft,
      turnRight: this.turnRight,
      speedUp: this.speedUp,
      speedDown: this.speedDown
    }
  }

  static generateName() {
    return "Ship#" + Math.floor(Math.random() * 100);
  }

  static onConnect(socket) {
    var player = new Ship({
      id: socket.id,
      x: System.list[0].x + System.list[0].starRadius,
      y: System.list[0].y + System.list[0].starRadius
    });

    socket.on('keyPress',(data)=>{
      if(data.inputId === 'right')
        player.turnRight = data.state;
      else if(data.inputId === 'left')
        player.turnLeft = data.state;
      else if(data.inputId === 'up')
        player.speedUp = data.state;
      else if(data.inputId === 'down')
        player.speedDown = data.state;
    });

    socket.emit('init',{
      selfId: socket.id,
      ship: Ship.getAllInitPack(),
      system: System.getAllInitPack(),
    });
  }

  static getAllInitPack() {
    let ships = [];
    for (var i in Ship.list)
      ships.push(Ship.list[i].getInitPack());
    return ships;
  }

  static update() {
    let pack = [];
    for (var i in Ship.list) {
      Ship.list[i].update();
      pack.push(Ship.list[i].getUpdatePack());
    }
    return pack;
  }
}
Ship.list = {};


class Planet {
  constructor(param) {
    this.radius = rnd(500, 1000);
    this.x = 0;
    this.y = 0;
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

    this.ores = [];
    let nbOres = rnd(1, 10); //how much ore patches
    while (this.ores.length < nbOres) {
      for (var i in Ores) {
        let ore = Ores[i];
        let chance = Math.random();
        if (ore.rarity > chance) {
          this.ores.push({
            id: i,
            quantity: rnd(0, Math.min(ore.max, this.radius - 10))
          });
          if (this.ores.length >= nbOres) break;
        }
      }
    }

    for (var i in param) if (param[i] !== undefined) this[i] = param[i];

    this.generateOresPos();
  }

  generateOresPos() { //generate ores positions
    for (var i in this.ores) {
      let ore = this.ores[i];
      let angle = Math.random() * 2 * Math.PI;
      let rad = rnd(0, this.radius - ore.quantity); // distance from planet's center to ore's center
      //x & y relative to planet's center
      let x = Math.round(rad * Math.cos(angle));
      let y = Math.round(rad * Math.sin(angle));
      ore.x = x;
      ore.y = y;
    }
  }
}

class System {
  constructor(param) {
    this.id = Math.random();
    this.x = 0;
    this.y = 0;
    this.nbPlanet = rnd(10, 30);
    this.radius = rnd(10000, 20000);

    this.starColor = rndChoose(["#FFD27D", "#FFA371", "#A6A8FF", "#FFFA86", "#A87BFF", "#FFFFFF", "#FED7A4", "#F7AB57", "#F58021", "#F05D24", "#F26825"]);
    this.starRadius = rnd(2000, 5000);

    for (var i in param) if (param[i] !== undefined) this[i] = param[i];

    this.planetList = [];
    this.generatePlanets();

    System.list[this.id] = this;
    initPack.system.push(this.getInitPack());
  }

  generatePlanets() {
    for (var i = 0; i < this.nbPlanet; i++) {
      let angle = Math.random() * 2 * Math.PI;
      let rad = rnd(0, this.radius);
      let x = Math.round(rad * Math.cos(angle) + this.x);
      let y = Math.round(rad * Math.sin(angle) + this.y);

      let pla = new Planet({
        x: x,
        y: y
      });
      this.planetList[i] = pla;

      //no planet collisions
      for (var j in this.planetList) {
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
    for (var i in this.planetList) {
      let planet = this.planetList[i];
      planetList.push({
        x: planet.x,
        y: planet.y,
        radius: planet.radius,
        gravity: planet.gravity,
        color: planet.color,
        ores: planet.ores
      });
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

  getUpdatePack() {
    let planetList = [];
    for (var i in this.planetList) {
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

  static getAllInitPack() {
    let systems = [];
    for (var i in System.list)
      systems.push(System.list[i].getInitPack());
    return systems;
  }

  static update() {
    let pack = [];
    for(var i in System.list){
      pack.push(System.list[i].getUpdatePack());
    }
    return pack;
  }

}
System.list = {};


module.exports = {
  Ship: Ship,
  Planet: Planet,
  System: System
}
