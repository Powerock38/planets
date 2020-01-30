const canvas = document.getElementById("mainframe");
const ctx = canvas.getContext("2d");

//fullscreen canvas
canvas.width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
canvas.height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

//mousewheel zoom
var Zoom = 100;
document.addEventListener("wheel", e => {
    const delta = Math.sign(e.deltaY);
    if(e.deltaY > 0 && Zoom > 1) {
      Zoom--;
    } else if(e.deltaY < 0 && Zoom < 500) {
      Zoom++;
    }
});

//choose a random item from array
function rndChoose(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

//random int between min,max included
function rnd(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

//random float between min,max included
function rndFloat(min, max) {
  return Math.random() * (max - min) + min;
}

var Ores = {
  "cobalt":{
    name:"Cobalt ore",
    color:"rgba(61, 89, 171, 0.8)",
    rarity: 0.2,
    mass: 9,
    min: 100,
    max: 300
  },
  "nickel":{
    name:"Nickel ore",
    color:"rgba(158, 165, 172, 0.8)",
    rarity: 0.4,
    mass: 9,
    min: 200,
    max: 500
  },
  "gold":{
    name:"Gold ore",
    color:"rgba(255, 215, 0, 0.8)",
    rarity: 0.1,
    mass: 19,
    min: 50,
    max: 100
  },
  "platinum":{
    name:"Platinum ore",
    color:"rgba(85, 211, 223, 0.8)",
    rarity: 0.2,
    mass: 21,
    min: 50,
    max: 250
  },
  "iron":{
    name:"Iron ore",
    color:"rgba(117, 117, 117, 0.8)",
    rarity: 0.7,
    mass: 8,
    min: 300,
    max: 1000
  },
  "silicon":{
    name:"Silicon ore",
    color:"rgba(177, 182, 185, 0.8)",
    rarity: 0.5,
    mass: 3,
    min: 200,
    max: 600
  },
  "silver":{
    name:"Silver ore",
    color:"rgba(193, 193, 193, 0.8)",
    rarity: 0.2,
    mass: 10,
    min: 100,
    max: 200
  },
  "magnesium":{
    name:"Magnesium ore",
    color:"rgba(92, 138, 152, 0.8)",
    rarity: 0.2,
    mass: 2,
    min: 50,
    max: 150
  },
  "uranium":{
    name:"Uranium ore",
    color:"rgba(0, 254, 0, 0.8)",
    rarity: 0.1,
    mass: 19,
    min: 10,
    max: 50
  }
};

class Planet {
  constructor(param) {
    // IDEA:
    // telluric or gas ?
    // rotation : axis & period
    // atmosphere
    // minerals, composition
    this.name = Planet.generateName();
    this.radius = rnd(100,1000);
    this.x = 0;
    this.y = 0;
    this.friction = rndFloat(0.93,0.99);
    this.baseMass = rnd(this.radius / 10,this.radius / 5);

    this.color = rndChoose([
      "#FED7A4","#F7AB57","#F58021","#F05D24","#F26825",
      "#E3E6E8","#C1C0C0","#949494","#848686","#7E7F7F",
      "#A1ACB6","#6C7B48","#B18C73","#151340","#212D60",
      "#DFA964","#A07845","#AE946E","#52575D","#21384C",
      "#F6CDAA","#FAB176","#DB6B30","#6F2315","#4F1F11",
      "#CEECF9","#C3E6F0","#BCDEE7","#AACBD2","#739097",
      "#CBDEF2","#867AB9","#7563AC","#6751A2","#4B3D81",
      "#F9E4C4","#DCC592","#B99F7A","#8F6F40","#412F21",
      "#E1D399","#B3AE84","#C1B685","#E5D59D","#9D9366",
      "#CEDCEB","#969FA1","#798791","#4C5062","#424C5C",
    ]);

    this.mass = this.baseMass;
    this.ores = [];
    let nbOres = rnd(1,10); //how much ore patches
    while(this.ores.length < nbOres) {
      for (var i in Ores) {
        let ore = Ores[i];
        let chance = Math.random();
        if(ore.rarity > chance) {
          this.ores.push({
            id: i,
            quantity: rnd(0,Math.min(ore.max,this.radius-10))
          });

          if(this.ores.length >= nbOres)
            break;
        }
      }
    }

    this.refreshMass();

    for(var i in param) {
      if(param[i] !== undefined)
        this[i] = param[i];
    }

    this.generateOresPos();
  }

  draw() {
    // draw the circle (the planet)
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();

    //gravity ring
    if(Zoom > 6) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + this.gravity, 0, 2 * Math.PI);
      ctx.strokeStyle = "white";
      ctx.stroke();
    }

    // draw all ore patches
    if(Zoom > 1) {
      for(var i in this.ores) {
        //draw a patch
        ctx.beginPath();
        for(var j in this.ores[i]) {
          ctx.arc(this.x + this.ores[i].x, this.y + this.ores[i].y, this.ores[i].quantity, 0, 2 * Math.PI);
        }
        ctx.fillStyle = Ores[this.ores[i].id].color;
        ctx.fill();
      }
    }
  }

  refreshMass() {
    this.mass = this.baseMass;
    for (var i in this.ores) {
      this.mass += (Ores[this.ores[i].id].mass / 100) * this.ores[i].quantity;
    }
    this.mass = Math.round(this.mass);
    this.gravity = this.mass * 15; //gravity radius, from the planet surface
  }

  generateOresPos() { //generate ores positions
    for (var i in this.ores) {
      let ore = this.ores[i];
      //let rad = this.radius * Math.sqrt(Math.random());
      let angle = Math.random() * 2 * Math.PI;
      //let oreRadius = 100 * ore.quantity / this.radius;
      let rad = rnd(0, this.radius - ore.quantity); // distance from planet's center to ore's center
      let x = Math.round(rad * Math.cos(angle));
      let y = Math.round(rad * Math.sin(angle));
      ore.x = x; //{id: ore.id, x: x, y: y, radius: ore.quantity});
      ore.y = y;
    }
  }

  static generateName() {
    return "Planet#" + Math.floor(Math.random() * 100);
  }
}
Planet.list = [];

class Ship {
  constructor(param) {
    this.name = Ship.generateName();
    this.x = 0;
    this.y = 0;

    this.spdX = 0;
    this.spdY = 0;

    this.turnLeft = false;
    this.turnRight = false;
    this.speedUp = false;
    this.speedDown = false;

    this.maxSpeed = 20;
    this.angle = 0;
    this.rotationRate = 0;//4 * Math.PI / 180;
    this.thrust = 0.3;

    for(var i in param) {
      if(param[i] !== undefined)
        this[i] = param[i];
    }
  }

  update() {
    let thrustX = this.thrust * Math.cos(this.angle);
    let thrustY = this.thrust * Math.sin(this.angle);

    if(this.speedUp) {
      this.spdX += thrustX;
      this.spdY += thrustY;
    } else if(this.speedDown) {
      this.spdX -= thrustX;
      this.spdY -= thrustY;
    }

    let speed = Math.sqrt(this.spdX * this.spdX + this.spdY * this.spdY);
    if (speed > this.maxSpeed)
      this.spdX = this.spdX / (speed / this.maxSpeed);

    if(this.turnRight) this.rotationRate += 0.005;
    if(this.turnLeft) this.rotationRate -= 0.005;

    this.angle += this.rotationRate;

    this.x += this.spdX;
    this.y += this.spdY;
  }

  draw() {
    ctx.fillStyle = "white";

    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.translate(-this.x, -this.y);

    //swaggy flames
    let flameColors = ["#FED7A4","#F7AB57","#F58021","#F05D24","#F26825"]
    if(this.speedUp) {
      for (var i = 0; i < 20; i++) {
        let angle = rnd(-20, 20) * (Math.PI / 180);
        let length = rnd(10, 20);
        ctx.strokeStyle = rndChoose(flameColors);
        ctx.beginPath();
        let orig_x = this.x - 5;
        let orig_y = this.y;
        ctx.moveTo(orig_x, orig_y);
        ctx.lineTo(Math.round(orig_x - Math.cos(angle) * length), Math.round(orig_y + Math.sin(angle) * length));
        ctx.closePath();
        ctx.stroke();
      }
    } else if(this.speedDown) {
      for (var i = 0; i < 10; i++) {
        let angle = rnd(-10, 10) * (Math.PI / 180);
        let length = rnd(5, 10);
        ctx.strokeStyle = rndChoose(flameColors);
        ctx.beginPath();
        let orig_x = this.x + 4;
        let orig_y = this.y - 3;
        ctx.moveTo(orig_x, orig_y);
        ctx.lineTo(Math.round(orig_x + Math.cos(angle) * length), Math.round(orig_y + Math.sin(angle) * length));
        orig_y = this.y + 3;
        ctx.moveTo(orig_x, orig_y);
        ctx.lineTo(Math.round(orig_x + Math.cos(angle) * length), Math.round(orig_y + Math.sin(angle) * length));
        ctx.stroke();
      }
    }

    if(this.turnLeft) {
      for (var i = 0; i < 10; i++) {
        let angle = rnd(-10, 10) * (Math.PI / 180);
        angle += Math.PI/2;
        let length = rnd(3, 7);
        ctx.strokeStyle = rndChoose(flameColors);
        ctx.beginPath();
        let orig_x = this.x;
        let orig_y = this.y + 5;
        ctx.moveTo(orig_x, orig_y);
        ctx.lineTo(Math.round(orig_x + Math.cos(angle) * length), Math.round(orig_y + Math.sin(angle) * length));
        ctx.closePath();
        ctx.stroke();
      }
    } else if(this.turnRight) {
      for (var i = 0; i < 10; i++) {
        let angle = rnd(-10, 10) * (Math.PI / 180);
        angle -= Math.PI/2;
        let length = rnd(3, 7);
        ctx.strokeStyle = rndChoose(flameColors);
        ctx.beginPath();
        let orig_x = this.x;
        let orig_y = this.y - 5;
        ctx.moveTo(orig_x, orig_y);
        ctx.lineTo(Math.round(orig_x + Math.cos(angle) * length), Math.round(orig_y + Math.sin(angle) * length));
        ctx.closePath();
        ctx.stroke();
      }
    }

    //ship
    ctx.beginPath();
    ctx.moveTo(this.x+10,this.y);
    ctx.lineTo(this.x-10, this.y-10);
    ctx.lineTo(this.x-10, this.y+10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    //ship's red nose
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.moveTo(this.x+10,this.y);
    ctx.lineTo(this.x+5, this.y-2.5);
    ctx.lineTo(this.x+5, this.y+2.5);
    ctx.closePath();
    ctx.fill();

    ctx.setTransform(1,0,0,1,0,0);
  }

  static generateName() {
    return "Ship#" + Math.floor(Math.random() * 100);
  }
}

class Star {
  constructor(param) {
    this.x = 0;
    this.y = 0;
    this.color = rndChoose(["#FFD27D","#FFA371","#A6A8FF","#FFFA86","#A87BFF","#FFFFFF"]);
    this.radius = rnd(3,7);

    for(var i in param) {
      if(param[i] !== undefined)
        this[i] = param[i];
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}
Star.list = [];

function drawUniverse() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //zoom
  let zoom = Zoom / 100;
  ctx.scale(zoom,zoom);

  //center
  let ctrX = Player.x - canvas.width / (2 * zoom);
  let ctrY = Player.y - canvas.height / (2 * zoom);
  ctx.translate(-ctrX, -ctrY);

  //stars
  if(Zoom >= 10) {
    for (var i in Star.list) {
      if(  Star.list[i].x + Star.list[i].radius > ctrX
        && Star.list[i].x - Star.list[i].radius < ctrX + canvas.width / zoom
        && Star.list[i].y + Star.list[i].radius > ctrY
        && Star.list[i].y - Star.list[i].radius < ctrY + canvas.height / zoom
      ) {
        Star.list[i].draw();
      }
    }
  }

  //update & draw planets
  for(var i in Planet.list) {
    let planet = Planet.list[i];
    if(  planet.x + (planet.radius + planet.gravity) > ctrX
      && planet.x - (planet.radius + planet.gravity) < ctrX + canvas.width / zoom
      && planet.y + (planet.radius + planet.gravity) > ctrY
      && planet.y - (planet.radius + planet.gravity) < ctrY + canvas.height / zoom
    ) {
      planet.draw();

      let angle = Math.atan2(Player.y - planet.y, Player.x - planet.x);
      let a = Player.x - planet.x;
      let b = Player.y - planet.y;
      let distance = Math.sqrt(a*a + b*b);

      //collision
      if(distance < planet.radius) {
        Player.spdX *= planet.friction;
        Player.spdY *= planet.friction;
        Player.rotationRate *= planet.friction;

        for(var j in planet.ores) {
          let ore = planet.ores[j];
          let dist = Math.sqrt(Math.pow(Player.x - (planet.x + ore.x), 2) + Math.pow(Player.y - (planet.y + ore.y), 2));
          if(dist < ore.quantity) {
            console.log("Mining " + ore.id);
            ore.quantity--;
            planet.refreshMass();
          }
        }
      }

       //gravity
      if(distance <= planet.gravity + planet.radius && distance >= planet.radius) {
        let hud = document.getElementById("hud");
        if(hud.innerHTML != i) {
          hud.innerHTML = i;
          console.log(planet);
        }

        // let speed = planet.mass / (distance * distance);
        let speed = 700 * planet.mass / (distance * distance);
        Player.spdX -= speed * Math.cos(angle);
        Player.spdY -= speed * Math.sin(angle);
      }
    }
  }

  Player.update();
  Player.draw();

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function generateUniverse() {
  let max = 100000; //universe's x,y end

  //planets
  for (var i = 0; i < max/100; i++) {
    let pla = new Planet({x:rnd(-max,max),y:rnd(-max,max)});
    Planet.list[i] = pla;

    for (var j in Planet.list) {
      if(j != i) {
        let fpla = Planet.list[j];
        let distance = Math.sqrt(Math.pow(pla.x - fpla.x, 2) + Math.pow(pla.y - fpla.y, 2));
        if(distance < pla.radius + pla.gravity + fpla.gravity + fpla.radius) {
          i--;
          break;
        }
      }
    }
  }

  //planets
  for (var i = 0; i < max/5; i++) {
    Star.list[i] = new Star({x:rnd(-max,max),y:rnd(-max,max)});
  }
}

var Player = new Ship({name:"Player"});

document.addEventListener('keydown', (e) => {
  if(e.key === "z") Player.speedUp = true;
  else if(e.key === "s") Player.speedDown = true;
  else if(e.key === "q") Player.turnLeft = true;
  else if(e.key === "d") Player.turnRight = true;
});

document.addEventListener('keyup', (e) => {
  if(e.key === "z") Player.speedUp = false;
  else if(e.key === "s") Player.speedDown = false;
  else if(e.key === "q") Player.turnLeft = false;
  else if(e.key === "d") Player.turnRight = false;
});

generateUniverse();

// setInterval(()=>{
//   Planet.list[0] = new Planet({});
// },3000);

const update = setInterval(()=>{
  drawUniverse();
},1000/25);
