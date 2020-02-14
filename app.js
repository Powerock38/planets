/* TODO:
  - Atmospheres ?
  - Multiple speeds
  - Max speed
  - Better looking ship
  - Science, Population
  - Structures
    - Stations (make Science points)
    - Quarries
    - Fast-transport systems
      - Hyperline : fast acceleration towards a specific direction
    - Death Stars
    - Dyson sphere
    - Planet harverster
    - Black hole harvester
  - Upgrades
    - Mining range
    - Mining speed
    - Cargo size
    - Thrusters
    - Turning thrusters
    - Engine > changes fuel type
    - Laser canons
    - HUD
      - Gravity & System rings
      - Distances
      - System info
      - Planet info
        - Ore analyzer
      - Crosshair
      - Compass
      - Minimap
        - Waypoints
*/

// var mongojs = require("mongojs");
// var db = mongojs("localhost:27017/planets",['account']);

const express = require('express');
const app = express();
const server = require('http').Server(app);
const WebSocket = require('ws');

app.get('/',(req,res)=>{
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
app.use(express.static(__dirname + '/client'));

const wss = new WebSocket.Server({ server });

uuid = (prefix)=>{
  return prefix + '-xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

SOCKET_LIST = {};
DEBUG = true;

initPack = {ship:[],system:[],laser:[]};
removePack = {ship:[],laser:[]};

require("./client/common.js");
const Craft = require("./Classes/Craft.js");
const Ship = require("./Classes/Ship.js").Ship;
const Laser = require("./Classes/Ship.js").Laser;
// const Laser = require("./Classes/Laser.js");
const System = require("./Classes/System.js");

function generateUniverse() {
  for (var i = 0; i < 10; i++) {
    let angle = Math.random() * 2 * Math.PI;
    let rad = 20000 * 2 * (i + 1);
    let x = Math.round(rad * Math.cos(angle));
    let y = Math.round(rad * Math.sin(angle));
    new System(x, y);
  }

  let spawnSys = rndChoose(System.list);
  SPAWNx = spawnSys.x + spawnSys.starRadius;
  SPAWNy = spawnSys.y + spawnSys.starRadius;
}

wss.on('connection', (ws)=>{
  ws.id = uuid("skt");
  SOCKET_LIST[ws.id] = ws;
  console.log('socket connection ' + ws.id);

  Ship.onConnect(ws);

  ws.on('close',(e)=>{
    delete SOCKET_LIST[ws.id];
    Ship.onDisconnect(ws);
    console.log("socket deconnection " + ws.id + "\n" + e);
  });

  ws.on('error',(e)=>{
    return console.log(e);
  });

  if(DEBUG) {
    ws.on('message',(msg)=>{
      msg = JSON.parse(msg);
      let data = msg.data;

      if(msg.h === 'eval')
        eval(data);
    });
  }
});


setInterval(() => {
  let updatePack = {
    ship: Ship.update(),
    system: System.update(),
    laser: Laser.update(),
  };

  for(var i in SOCKET_LIST) {
    let ws = SOCKET_LIST[i];

    if(initPack.ship.length > 0 || initPack.system.length > 0 || initPack.laser.length > 0)
      ws.send(JSON.stringify({h: 'init', data: initPack}));

    if(removePack.ship.length > 0 || removePack.laser.length > 0)
      ws.send(JSON.stringify({h: 'remove', data: removePack}));

    ws.send(JSON.stringify({h: 'update', data: updatePack}));
  }

  initPack.ship = [];
  initPack.system = [];
  initPack.laser = [];

  removePack.ship = [];
  removePack.laser = [];
}, 1000 / 30);

generateUniverse();

server.listen(2000);
console.log("Server started");
