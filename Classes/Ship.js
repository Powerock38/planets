const Inventory = require("./Inventory.js").Inventory;
const System = require("./System.js");
const Laser = require("./Laser.js");
const StatItem = require("./Inventory.js").StatItem;
const Station = require("./Station.js");
const Quarry = require("./Quarry.js");
const Sentry = require("./Sentry.js");

class Ship {
  constructor(id, x, y) {
    this.name = Ship.generateName();
    this.id = id;

    this.x = x;
    this.y = y;
    this.angle = 0;

    this.turnLeft = false;
    this.turnRight = false;
    this.speedUp = false;
    this.speedDown = false;

    this.pressing = {
      up: false,
      down: false,
      right: false,
      left: false,
      shoot: false,
    };

    this.on = {
      system: null,
      planetGravity: null,
      planet: null,
      ore: null
    };

    this.canMine = true;
    this.fireReady = true;

    this.spdX = 0;
    this.spdY = 0;
    this.rotationRate = 0;
    this.maxSpeed = 20;
    this.maxRotationRate = 0.5;

    this.cargo = new Inventory([
      {id:"mining_drill_1", amount: 1},
      {id:"mining_arm_1", amount: 1},
      {id:"armouring_1", amount: 1},
      {id:"shield_1", amount: 1},
      {id:"thrusters_main_1", amount: 1},
      {id:"thrusters_side_1", amount: 1},
      {id:"engine_1", amount: 1},
      {id:"tank_1", amount: 1},
      {id:"cannon_1", amount: 1},
      {id:"sentry", amount: 1},
      {id:"quarry", amount: 1},
    ], this);

    this.updateStats();

    this.cargo.items.push({
      id: this.fuel,
      amount: this.fuelMax
    });

    this.hp = this.hpMax;
    this.shieldHP = this.shieldMaxHP;

    Ship.list[this.id] = this;
    initPack.ship.push(this.getInitPack());
  }

  get canCraft() {
    let canCraft = false;
    for (let i in Station.list) {
      let station = Station.list[i];
      let stationDistance = getDistance(this, station);
      if (stationDistance <= station.radius) {
        canCraft = true;
      }
    }
    return canCraft;
  }

  updateStats() {
    for(let i in StatItem.list) {
      if(this.cargo.hasItem(i, 1)) {
        for(let stat in StatItem.list[i].stats) {
          this[stat] = StatItem.list[i].stats[stat];
        }
      }
    }
  }

  updateSpeed() {
    let thrustX = this.thrust * Math.cos(this.angle);
    let thrustY = this.thrust * Math.sin(this.angle);

    if(this.cargo.hasItem(this.fuel,1)) {
      if(this.pressing.up) {
        this.cargo.removeItem(this.fuel,1);
        this.spdX += thrustX;
        this.spdY += thrustY;
      }
      if(this.pressing.down) {
        this.cargo.removeItem(this.fuel,1);
        this.spdX -= thrustX;
        this.spdY -= thrustY;
      }

      if(this.pressing.right && this.rotationRate < this.maxRotationRate) {
        this.cargo.removeItem(this.fuel,1);
        this.rotationRate += this.turningThrust;
      }
      if(this.pressing.left && this.rotationRate > -this.maxRotationRate) {
        this.cargo.removeItem(this.fuel,1);
        this.rotationRate -= this.turningThrust;
      }

      this.speedUp = this.pressing.up;
      this.speedDown = this.pressing.down;
      this.turnRight = this.pressing.right;
      this.turnLeft = this.pressing.left;
    } else {
      this.speedUp = false;
      this.speedDown = false;
      this.turnRight = false;
      this.turnLeft = false;
    }

    this.angle += this.rotationRate;

    this.x += this.spdX;
    this.y += this.spdY;
  }

  updateCollisions() {
    let onSystem = null;
    let onPlanet = null;
    let onPlanetGravity = null;
    let onOre = null;

    // systems
    for (let i in System.list) {
      let system = System.list[i];
      let systemDistance = getDistance(this, system);

      if (systemDistance <= system.radius) {
        onSystem = system;

        //planets
        for (let j in system.planetList) {
          let planet = system.planetList[j];
          let planetDistance = getDistance(this, planet);

          //if in gravity range
          if (planetDistance <= planet.gravity + planet.radius && planetDistance >= planet.radius) {
            onPlanetGravity = planet;

            let angle = Math.atan2(planet.y - this.y, planet.x - this.x);
            let speed = planet.mass / (planetDistance * planetDistance);

            this.spdX += speed * Math.cos(angle);
            this.spdY += speed * Math.sin(angle);
          } else if (planetDistance < planet.radius) { // if on planet
            onPlanet = planet;

            this.spdX *= planet.friction;
            this.spdY *= planet.friction;
            this.rotationRate *= planet.friction;

            //ores
            for (let k in planet.ores) {
              let ore = planet.ores[k];
              let oreDistance = getDistance(this, {x: planet.x + ore.x, y: planet.y + ore.y});

              if(oreDistance < ore.amount + this.miningRange) {
                onOre = ore;
                //mining
                if(this.pressing.mine && this.canMine) {
                  ore.mine(this.cargo, 1);
                  this.canMine = false;
                  setTimeout(()=>{
                    this.canMine = true;
                  }, 1000 / this.miningRate);
                }
              }
            }
          }
        }
      }
    }

    this.on.system = onSystem;
    this.on.planetGravity = onPlanetGravity;
    this.on.planet = onPlanet;
    this.on.ore = onOre;
  }

  updateAttack() {
    if(this.pressing.shoot && this.fireReady){
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
    if(this.cargo.hasItem(this.fuel, 1)) {
      this.cargo.removeItem(this.fuel, 1);
      new Laser(
        this.x + Math.cos(this.angle + Math.PI/2) * 25,
        this.y + Math.sin(this.angle + Math.PI/2) * 25,
        this.angle,
        this.id,
        this.laserSpeed,
        this.laserDurability,
        this.laserDamage,
        this.laserWidth,
        this.laserLength
      );
      new Laser(
        this.x + Math.cos(this.angle - Math.PI/2) * 25,
        this.y + Math.sin(this.angle - Math.PI/2) * 25,
        this.angle,
        this.id,
        this.laserSpeed,
        this.laserDurability,
        this.laserDamage,
        this.laserWidth,
        this.laserLength
      );
    }
  }

  takeDamage(damage) {
    if(this.shieldHP > 0) {
      this.shieldHP -= Math.round(damage * (1 - this.shieldPower));
    } else {
      this.hp -= damage;
      if(this.hp <= 0) {
        this.hp = this.hpMax;
        this.shieldHP = this.shieldMaxHP;
        this.spdX = 0;
        this.spdY = 0;
        this.angle = 0;
        this.rotationRate = 0;
        this.x = SPAWNx;
        this.y = SPAWNy;
      }
    }
  }

  getInitPack() {
    return Object.assign({
      name: this.name,
    }, this.getUpdatePack());
  }

  getUpdatePack() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,

      hp: this.hp,
      hpMax: this.hpMax,
      shieldHP: this.shieldHP,
      shieldMaxHP: this.shieldMaxHP,
      fuel: this.fuel,
      fuelMax: this.fuelMax,

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

    //get keyboard input
    ws.onmsg("keyPress", (data)=>{
        player.pressing[data.input] = data.state;
    });

    //send the current gamestate to the newly logged user
    ws.ssend("init", {
      selfId: ws.id,
      items: player.cargo.items,
      ship: Ship.getAllInitPack(),
      system: System.getAllInitPack(),
      laser: Laser.getAllInitPack(),
      station: Station.getAllInitPack(),
      quarry: Quarry.getAllInitPack(),
      sentry: Sentry.getAllInitPack(),
    });
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
