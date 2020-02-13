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

//init
var selfId = null;
var inventory;
socket.on('init',(data)=>{
  for(let i in data.ship)
    new Ship(data.ship[i]);

  for(let i in data.system)
    new System(data.system[i]);

  // first init
  if(data.selfId !== undefined) {
    selfId = data.selfId;
    inventory = new Inventory(data.inventory);
  }
});

//update
socket.on('update',(data)=>{
  for(let i in data.ship) {
    let pack = data.ship[i];
    let ship = Ship.list[pack.id];

    if(ship) {
      for(let o in pack) {
        if(pack.hasOwnProperty(o) && pack[o] !== undefined && o !== "id") {
          ship[o] = pack[o];
        }
      }
    }
  }

  for(let i in data.system) {
    let pack = data.system[i];
    let system = System.list[pack.id];

    if(system) {
      for(let o in pack.planetList) {
        system.planetList[o].ores = pack.planetList[o].ores;
      }
    }
  }
});

socket.on('updateInventory',(items)=>{
  if(!selfId) return;

  inventory.items = items;
  inventory.refresh();
});

//remove
socket.on('remove',(data)=>{
  for(let i in data.ship) {
    delete Ship.list[data.ship[i]];
  }
});


//keyboard
var keys = [
  {key:"z",action:"up"},
  {key:"s",action:"down"},
  {key:"q",action:"left"},
  {key:"d",action:"right"},
  {key:"e",action:"mine"},
];

function keyboardInput(e, state) {
  for(let i in keys) {
    let key = keys[i];
    if(e.key === key.key) socket.emit('keyPress',{inputId:key.action, state:state});
  }
}

document.addEventListener('keydown', (e) => {
  keyboardInput(e, true);
});

document.addEventListener('keyup', (e) => {
  keyboardInput(e, false);
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
    let Player = Ship.list[selfId];

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

    for (let i in System.list) {
      let system = System.list[i];

      if (isInSight(system.x,system.y,system.radius)) {
        system.draw();

        if (isInSight(system.x,system.y,system.starRadius)) {
          system.drawStar();
        }

        //update & draw planets
        for (let j in system.planetList) {
          let planet = system.planetList[j];

          if (isInSight(planet.x,planet.y,planet.radius + planet.gravity)) {
            planet.draw();
          }
        }
      }
    }

    for (let i in Ship.list) {
      let ship = Ship.list[i];
      if(isInSight(ship.x, ship.y, 30))
        ship.draw();
    }

    ctx.restore();
  }
  requestAnimationFrame(drawUniverseLoop);
}

drawUniverseLoop();
