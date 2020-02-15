const Inventory = require("./Inventory.js");
const System = require("./System.js");
const Laser = require("./Laser.js");

class Ship {
  constructor(id, x, y) {
    this.name = Ship.generateName();
    this.id = id;

    this.x = x;
    this.y = y;
    this.angle = 0;

    this.hpMax = 10;
    this.hp = this.hpMax;

    this.turnLeft = false;
    this.turnRight = false;
    this.speedUp = false;
    this.speedDown = false;

    this.mining = false;
    this.canMine = true;
    this.miningRate = 1;
    this.miningRange = 10;

    this.attack = false;
    this.fireReady = true;
    this.fireRate = 5;

    this.spdX = 0;
    this.spdY = 0;
    this.maxSpeed = 20;
    this.rotationRate = 0;
    this.maxRotationRate = 0.5;
    this.thrust = 0.5;

    this.cargo = new Inventory([
      {id:"fuel", amount: 999999999},
    ], this.id);

    Ship.list[this.id] = this;
    initPack.ship.push(this.getInitPack());
  }

  updateSpeed() {
    let thrustX = this.thrust * Math.cos(this.angle);
    let thrustY = this.thrust * Math.sin(this.angle);

    if (this.speedUp && this.cargo.hasItem("fuel",1)) {
      this.cargo.removeItem("fuel",1);
      this.spdX += thrustX;
      this.spdY += thrustY;
    }
    if (this.speedDown && this.cargo.hasItem("fuel",1)) {
      this.cargo.removeItem("fuel",1);
      this.spdX -= thrustX;
      this.spdY -= thrustY;
    }

    if (this.turnRight && this.rotationRate < this.maxRotationRate) {
      this.rotationRate += 0.005;
    }
    if (this.turnLeft && this.rotationRate > -this.maxRotationRate) {
      this.rotationRate -= 0.005;
    }

    this.angle += this.rotationRate;

    this.x += this.spdX;
    this.y += this.spdY;
  }

  updateCollisions() {
    for (let i in System.list) {
      let system = System.list[i];
      let systemDistance = getDistance({x: this.x, y: this.y},{x: system.x, y: system.y});

      // if in system range
      if (systemDistance <= system.radius) {
        //planet collision
        for (let j in system.planetList) {
          let planet = system.planetList[j];
          let planetDistance = getDistance({x: this.x, y: this.y},{x: planet.x, y: planet.y});

          if (planetDistance < planet.radius) {
            this.spdX *= planet.friction;
            this.spdY *= planet.friction;
            this.rotationRate *= planet.friction;

            //mining
            if(this.mining && this.canMine) {
              for (let k in planet.ores) {
                let ore = planet.ores[k];
                let oreDistance = getDistance({x: this.x, y: this.y},{x: planet.x + ore.x, y: planet.y + ore.y});

                if(oreDistance < ore.amount + this.miningRange) {
                  ore.mine(this.cargo, 1);
                  this.canMine = false;
                  setTimeout(()=>{
                    this.canMine = true;
                  }, 1000 / this.miningRate);
                }
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

  updateAttack() {
    if(this.attack && this.fireReady){
      this.shoot();
      this.fireReady = false;
      setTimeout(()=>{
        this.fireReady = true;
      }, 1000 / this.fireRate);
    }
  }

  update() {
    this.updateCollisions();
    this.updateSpeed();
    this.updateAttack();
  }

  shoot() {
    new Laser(
      this.x,
      this.y,
      this.angle,
      this.id,
      this.spdX,
      this.spdY
    );
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

  static onConnect(ws) {
    let player = new Ship(
      ws.id,
      SPAWNx,
      SPAWNy
    );

    ws.on('message', (msg)=>{
      msg = JSON.parse(msg);
      let data = msg.data;

      if(msg.h === 'keyPress') {
        if(data.inputId === 'right')
          player.turnRight = data.state;
        else if(data.inputId === 'left')
          player.turnLeft = data.state;
        else if(data.inputId === 'up')
          player.speedUp = data.state;
        else if(data.inputId === 'down')
          player.speedDown = data.state;
        else if(data.inputId === 'mine')
          player.mining = data.state;
        else if(data.inputId === 'shoot')
          player.attack = data.state;
      }
    });

    //send the current gamestate to the newly logged user
    ws.send(JSON.stringify({h: 'init',
      data: {
        selfId: ws.id,
        inventory: player.cargo.items,
        ship: Ship.getAllInitPack(),
        system: System.getAllInitPack()
      }
    }));
  }

  static onDisconnect(socket) {
    delete Ship.list[socket.id];
    removePack.ship.push(socket.id);
  }

  static getAllInitPack() {
    let ships = [];
    for (let i in Ship.list)
      ships.push(Ship.list[i].getInitPack());
    return ships;
  }

  static update() {
    let pack = [];
    for (let i in Ship.list) {
      Ship.list[i].update();
      pack.push(Ship.list[i].getUpdatePack());
    }
    return pack;
  }
}
Ship.list = {};

module.exports = Ship;
