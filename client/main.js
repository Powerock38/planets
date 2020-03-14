const connection = new WebSocket('ws://localhost:2000');

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

function serval(str) {
  connection.send(JSON.stringify({h: 'eval',data: str}));
}


var selfId = null;

//listener
connection.onmessage = (message)=>{
  let msg = JSON.parse(message.data);
  let data = msg.data;


  if(msg.h === 'init') {
    for(let i in data.ship)
      new Ship(data.ship[i]);

    for(let i in data.system)
      new System(data.system[i]);

    for(let i in data.laser)
      new Laser(data.laser[i]);

    for(let i in data.station)
      new Station(data.station[i]);

    for(let i in data.quarry)
      new Quarry(data.quarry[i]);

    for(let i in data.sentry)
      new Sentry(data.sentry[i]);

    // first init
    if(data.selfId !== undefined) {
      selfId = data.selfId;
      Item.refresh(data.items);
      hud.name.innerHTML = Ship.list[selfId].name;
    }

  } else if(msg.h === 'update') {
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

    for(let i in data.sentry) {
      let pack = data.sentry[i];
      let sentry = Sentry.list[pack.id];
      if(sentry) {
        for(let o in pack) {
          if(pack.hasOwnProperty(o) && pack[o] !== undefined && o !== "id") {
            sentry[o] = pack[o];
          }
        }
      }
    }

    for(let i in data.laser) {
      let pack = data.laser[i];
      let laser = Laser.list[pack.id];
      if(laser) {
        for(let o in pack) {
          if(pack.hasOwnProperty(o) && pack[o] !== undefined && o !== "id") {
            laser[o] = pack[o];
          }
        }
      }
    }
  } else if(msg.h === 'updateInventory') {
    Item.refresh(data.items);

    Craft.refresh(data.crafts);

  } else if(msg.h === 'remove') {
    for(let i in data.ship) {
      delete Ship.list[data.ship[i]];
    }

    for(let i in data.laser) {
      delete Laser.list[data.laser[i]];
    }
  }
}

//keyboard
var keys = [
  {key:"z", action:"up"},
  {key:"s", action:"down"},
  {key:"q", action:"left"},
  {key:"d", action:"right"},
  {key:"e", action:"mine"},
  {key:" ", action:"shoot"},
  {key:"m", action:"build", click:true},
  {key:"p", action:"sentry", click:true},
];

function keyboardInput(e, state) {
  for(let i in keys) {
    let key = keys[i];
    if(e.key === key.key)
      connection.send(JSON.stringify({h: 'keyPress', data: {input: key.action, state: state, click: key.click || false}}));
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
  if (e.deltaY > 0 && Zoom > 0.01) {
    Zoom -= 0.01;
  } else if (e.deltaY < 0 && Zoom < 2) {
    Zoom += 0.01;
  }
});

//sprites
var IMAGES = {
  ship: "ship",
  station: "station",
  quarry: "quarry",
  sentry: "sentry",
};

for (let i in IMAGES) {
  let path = "client/images/"+IMAGES[i]+".svg";
  IMAGES[i] = new Image();
  IMAGES[i].src = path;
}

var ctrX = 0;
var ctrY = 0;

function drawUniverse() {
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

            for (let i in Quarry.list) {
              let quarry = Quarry.list[i];
              if(isInSight(quarry.x, quarry.y, quarry.radius * 2))
                quarry.draw();
            }
          }
        }
      }
    }

    for (let i in Station.list) {
      let station = Station.list[i];
      if(isInSight(station.x, station.y, station.radius))
        station.draw();
    }

    for (let i in Sentry.list) {
      let sentry = Sentry.list[i];
      if(isInSight(sentry.x, sentry.y, sentry.radius))
        sentry.draw();
    }

    for (let i in Laser.list) {
      let laser = Laser.list[i];
      if(isInSight(laser.x, laser.y, 10))
        laser.draw();
    }

    for (let i in Ship.list) {
      let ship = Ship.list[i];
      if(isInSight(ship.x, ship.y, 30))
        ship.draw();
    }

    ctx.restore();
  }
  // requestAnimationFrame(drawUniverse);
}

setInterval(()=>{
  drawUniverse();
  drawHUD();
}, 1000 / 30);
