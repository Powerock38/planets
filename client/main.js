var socket = io();

const canvas = document.getElementById("mainframe");
const ctx = canvas.getContext("2d");

function isInSight(x,y,radius) {
  return (x + radius > ctrX &&
    x - radius < ctrX + canvas.width / Zoom &&
    y + radius > ctrY &&
    y - radius < ctrY + canvas.height / Zoom);
}

function hexToRgb(hex) {
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

class Ship {
  constructor(initPack) {
    this.name = initPack.name;
    this.id = initPack.id;

    this.x = initPack.x;
    this.y = initPack.y;
    this.angle = initPack.angle;

    this.turnLeft = initPack.turnLeft;
    this.turnRight = initPack.turnRight;
    this.speedUp = initPack.speedUp;
    this.speedDown = initPack.speedDown;

    Ship.list[this.id] = this;
  }

  draw() {
    ctx.save();
    ctx.translate(this.x,this.y);
    ctx.rotate(this.angle);
    ctx.translate(-this.x,-this.y);

    //swaggy flames
    let flameColors = ["#FED7A4", "#F7AB57", "#F58021", "#F05D24", "#F26825"]
    if (this.speedUp) {
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
    } else if (this.speedDown) {
      for (var i = 0; i < 10; i++) {
        let angle = rnd(-10, 10) * (Math.PI / 180);
        let length = rnd(5, 10);
        ctx.strokeStyle = rndChoose(flameColors);
        ctx.beginPath();
        let orig_x = this.x + 15;
        let orig_y = this.y - 4;
        ctx.moveTo(orig_x, orig_y);
        ctx.lineTo(Math.round(orig_x + Math.cos(angle) * length), Math.round(orig_y + Math.sin(angle) * length));
        orig_y = this.y + 4;
        ctx.moveTo(orig_x, orig_y);
        ctx.lineTo(Math.round(orig_x + Math.cos(angle) * length), Math.round(orig_y + Math.sin(angle) * length));
        ctx.stroke();
      }
    }

    if (this.turnLeft) {
      for (var i = 0; i < 10; i++) {
        let angle = rnd(-10, 10) * (Math.PI / 180);
        angle += Math.PI / 2;
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
    } else if (this.turnRight) {
      for (var i = 0; i < 10; i++) {
        let angle = rnd(-10, 10) * (Math.PI / 180);
        angle -= Math.PI / 2;
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
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.moveTo(this.x + 30, this.y);
    ctx.lineTo(this.x - 10, this.y - 10);
    ctx.lineTo(this.x - 10, this.y + 10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    //ship's red nose
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + 5, this.y - 2.5);
    ctx.lineTo(this.x + 5, this.y + 2.5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
Ship.list = {};

class Planet {
  constructor(initPack) {
    this.x = initPack.x;
    this.y = initPack.y;
    this.radius = initPack.radius;
    this.gravity = initPack.gravity;
    this.color = initPack.color;
    this.ores = initPack.ores;
  }

  draw() {
    // draw the circle (the planet)
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();

    //gravity ring
    if (Zoom > 0.06) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + this.gravity, 0, 2 * Math.PI);
      ctx.strokeStyle = "white";
      ctx.stroke();
    }

    // draw all ore patches
    if (Zoom > 0.01) {
      for (var i in this.ores) {
        //draw a patch
        ctx.beginPath();
        for (var j in this.ores[i]) {
          ctx.arc(this.x + this.ores[i].x, this.y + this.ores[i].y, this.ores[i].quantity, 0, 2 * Math.PI);
        }
        ctx.fillStyle = Ores[this.ores[i].id].color;
        ctx.fill();
      }
    }
  }
}

class System {
  constructor(initPack) {
    this.id = initPack.id;
    this.x = initPack.x;
    this.y = initPack.y;
    this.radius = initPack.radius;
    this.starColor = initPack.starColor;
    this.starRadius = initPack.starRadius;

    //this.planetList = initPack.planetList;
    this.planetList = [];
    for (var i in initPack.planetList) {
      this.planetList.push(new Planet(initPack.planetList[i]));
    }

    System.list[this.id] = this;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 20;
    ctx.stroke();
    ctx.lineWidth = 1;
  }

  drawStar() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.starRadius, 0, 2 * Math.PI);
    let rgb = hexToRgb(this.starColor);
    ctx.fillStyle = "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", 0.8)";
    ctx.fill();
  }
}
System.list = {};

//init
var selfId = null;
socket.on('init',(data)=>{
  for(var i in data.ship) {
    new Ship(data.ship[i]);
  }

  for(var i in data.system) {
    new System(data.system[i]);
  }

  if(data.selfId)
    selfId = data.selfId;
});

//update
socket.on('update',(data)=>{
  for(var i in data.ship) {
    let pack = data.ship[i];
    let ship = Ship.list[pack.id];

    if(ship) {
      for(var o in pack) {
        if(pack.hasOwnProperty(o) && pack[o] !== undefined && o !== "id") {
          ship[o] = pack[o];
        }
      }
    }
  }

  for(var i in data.system) {
    let pack = data.system[i];
    let system = System.list[pack.id];

    if(system) {
      for(var o in pack.planetList) {
        system.planetList[o].ores = pack.planetList[o].ores;
      }
    }
  }
});

//keyboard
document.addEventListener('keydown', (e) => {
  // e.preventDefault();
  if (e.key === "z") socket.emit('keyPress',{inputId:'up',state:true});
  else if (e.key === "s") socket.emit('keyPress',{inputId:'down',state:true});
  else if (e.key === "q") socket.emit('keyPress',{inputId:'left',state:true});
  else if (e.key === "d") socket.emit('keyPress',{inputId:'right',state:true});
});

document.addEventListener('keyup', (e) => {
  // e.preventDefault();
  if (e.key === "z") socket.emit('keyPress',{inputId:'up',state:false});
  else if (e.key === "s") socket.emit('keyPress',{inputId:'down',state:false});
  else if (e.key === "q") socket.emit('keyPress',{inputId:'left',state:false});
  else if (e.key === "d") socket.emit('keyPress',{inputId:'right',state:false});
});

//mousewheel zoom
var Zoom = 1.001;
document.addEventListener("wheel", e => {
  let delta = Math.sign(e.deltaY);
  if (e.deltaY > 0 && Zoom > 0.01) {
    Zoom -= 0.01;
  } else if (e.deltaY < 0 && Zoom < 2) {
    Zoom += 0.01;
  }
});


var ctrX = 0;
var ctrY = 0;

function drawUniverseLoop() {
  if(selfId) {
    var Player = Ship.list[selfId];

    //fullscreen canvas
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //center & zoom
    ctrX = Player.x - canvas.width / (2 * Zoom);
    ctrY = Player.y - canvas.height / (2 * Zoom);
    ctx.save();
    ctx.scale(Zoom, Zoom);
    ctx.translate(-ctrX, -ctrY);

    for (var i in System.list) {
      let system = System.list[i];

      if (isInSight(system.x,system.y,system.radius)) {
        system.draw();

        if (isInSight(system.x,system.y,system.starRadius)) {
          system.drawStar();
        }

        //update & draw planets
        for (var j in system.planetList) {
          let planet = system.planetList[j];

          if (isInSight(planet.x,planet.y,planet.radius + planet.gravity)) {
            planet.draw();
          }
        }
      }
    }

    for (var i in Ship.list) {
      Ship.list[i].draw();
    }

    ctx.restore();
  }
  requestAnimationFrame(drawUniverseLoop);
}

drawUniverseLoop();
