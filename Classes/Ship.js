const Inventory = require("./Inventory.js");
const System = require("./System.js");

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

    this.cargo = new Inventory([], this.id);

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
    for (let i in System.list) {
      let system = System.list[i];
      let systemDistance = getDistance({x: this.x, y: this.y},{x: system.x, y: system.y});
      if (systemDistance <= system.radius) {

        //planet collision
        for (let j in system.planetList) {
          let planet = system.planetList[j];
          let planetDistance = getDistance({x: this.x, y: this.y},{x: planet.x, y: planet.y});

          if (planetDistance < planet.radius) {
            this.spdX *= planet.friction;
            this.spdY *= planet.friction;
            this.rotationRate *= planet.friction;

            //ore collision
            for (let k in planet.ores) {
              let ore = planet.ores[k];
              let oreDistance = getDistance({x: this.x, y: this.y},{x: planet.x + ore.x, y: planet.y + ore.y});
              if (oreDistance < ore.amount) {
                ore.mine(this.cargo, 1);
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
    let player = new Ship({
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

    //send the current gamestate to the newly logged user
    socket.emit('init',{
      selfId: socket.id,
      inventory: player.cargo.items,
      ship: Ship.getAllInitPack(),
      system: System.getAllInitPack()
    });
  }

  static onDisconnect(socket) {
    delete Ship.list[socket.id];
    removePack.ship.push(socket.id);
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

module.exports = Ship;
