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
    this.nbContinents = rnd(1,10);
    this.friction = rndFloat(0.93,0.99);
    this.mass = rnd(this.radius / 5,this.radius / 2);
    this.gravity = this.mass * 20; //gravity radius, from the planet surface

    for(var i in param) {
      if(param[i] !== undefined)
        this[i] = param[i];
    }

    this.colors = [];
    for(var i = 0; i < this.nbContinents + 1; i++) {
      this.colors[i] = rndChoose([
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
    }
    this.continents = Planet.generateAllContinents(this.x,this.y,this.radius,this.nbContinents);
  }

  draw() {
    // draw the circle (the planet)
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    // ctx.strokeStyle = "white";
    // ctx.stroke();
    ctx.fillStyle = this.colors[this.continents.length];
    ctx.fill();

    //gravity ring
    if(Zoom > 6) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + this.gravity, 0, 2 * Math.PI);
      ctx.strokeStyle = "white";
      ctx.stroke();
    }

    // draw all continents
    if(Zoom > 1) {
      for(var i in this.continents) {
        let points = this.continents[i];
        //draw a continent
        ctx.beginPath();
        for(var j in points) {
          ctx.lineTo(points[j].x,points[j].y);
        }
        ctx.closePath();
        // ctx.strokeStyle = "white";
        // ctx.stroke();
        ctx.fillStyle = this.colors[i];
        ctx.fill();
      }
    }
  }

  static generateContinent(ctrX,ctrY,radius) {
    // Generate a continent
    let nb = rnd(6,100);
    let irr = 2 * Math.PI / nb;

    // generate n angle steps
    let angleSteps = [];
    let lower = (2 * Math.PI / nb) - irr;
    let upper = (2 * Math.PI / nb) + irr;
    let sum = 0;

    for(var i = 0; i < nb; i++) {
      let tmp = rnd(lower,upper);
      angleSteps.push(tmp);
      sum += tmp;
    }

    // normalize the steps so that point 0 and point n+1 are the same
    let k = sum / (2 * Math.PI);
    for(var i = 0; i < nb; i++) {
      angleSteps[i] = angleSteps[i] / k;
    }

    // generate the points
    let points = [];
    let angle = Math.random() * 2 * Math.PI;
    for(var i = 0; i < nb; i++) {
      let x = Math.round(ctrX + radius * Math.cos(angle));
      let y = Math.round(ctrY + radius * Math.sin(angle));
      points.push({x: x, y: y});
      angle += angleSteps[i];
    }

    return points;
  }

  static generateAllContinents(ctrX,ctrY,radius,nb) {
    let allPoints = [];

    for(var i = 0; i < nb; i++) {
      let rad = radius * Math.sqrt(Math.random());
      let angle = Math.random() * 2 * Math.PI;
      let x = Math.round(ctrX + rad * Math.cos(angle));
      let y = Math.round(ctrY + rad * Math.sin(angle));
      allPoints.push(Planet.generateContinent(x,y,radius-rad));
    }

    return allPoints;
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

    document.addEventListener('keydown', (e) => {
      if(e.key === "z") this.speedUp = true;
      else if(e.key === "s") this.speedDown = true;
      else if(e.key === "q") this.turnLeft = true;
      else if(e.key === "d") this.turnRight = true;
    });

    document.addEventListener('keyup', (e) => {
      if(e.key === "z") this.speedUp = false;
      else if(e.key === "s") this.speedDown = false;
      else if(e.key === "q") this.turnLeft = false;
      else if(e.key === "d") this.turnRight = false;
    });
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
    ctx.fillStyle = this.color;
    ctx.beginPath();
    //ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    // ctx.fill();
    ctx.fillRect(this.x, this.y, this.radius, this.radius);
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
    if(  Planet.list[i].x + (Planet.list[i].radius + Planet.list[i].gravity) > ctrX
      && Planet.list[i].x - (Planet.list[i].radius + Planet.list[i].gravity) < ctrX + canvas.width / zoom
      && Planet.list[i].y + (Planet.list[i].radius + Planet.list[i].gravity) > ctrY
      && Planet.list[i].y - (Planet.list[i].radius + Planet.list[i].gravity) < ctrY + canvas.height / zoom
    ) {
      Planet.list[i].draw();

      let angle = Math.atan2(Player.y - Planet.list[i].y, Player.x - Planet.list[i].x);
      let a = Player.x - Planet.list[i].x;
      let b = Player.y - Planet.list[i].y;
      let distance = Math.sqrt(a*a + b*b);

      //collision
      if(distance < Planet.list[i].radius) {
        Player.spdX *= Planet.list[i].friction;
        Player.spdY *= Planet.list[i].friction;
        Player.rotationRate *= Planet.list[i].friction;
      }

       //gravity
      if(distance <= Planet.list[i].gravity + Planet.list[i].radius && distance >= Planet.list[i].radius) {
        let hud = document.getElementById("hud");
        if(hud.innerHTML != i) {
          hud.innerHTML = i;
        }

        // let speed = Planet.list[i].mass / (distance * distance);
        let speed = 700 * Planet.list[i].mass / (distance * distance);
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

setInterval(()=>{
  Planet.list[0] = new Planet({radius:1000});
},3000);

const update = setInterval(()=>{
  drawUniverse();
},1000/30);
