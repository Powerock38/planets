/* TODO:
  - Atmospheres ?
  - Fuel
  - Multiple speeds
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

initPack = {ship:[],system:[]};
removePack = {ship:[]};

require("./client/common.js");
const Craft = require("./Classes/Craft.js");
const Ship = require("./Classes/Ship.js");
const System = require("./Classes/System.js");

function generateUniverse() {
  for (var i = 0; i < 10; i++) {
    let angle = Math.random() * 2 * Math.PI;
    let rad = 20000 * 2 * (i + 1);
    let x = Math.round(rad * Math.cos(angle));
    let y = Math.round(rad * Math.sin(angle));
    System.list[i] = new System(x, y);
  }
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
});


setInterval(() => {
  let updatePack = {
    ship: Ship.update(),
    system: System.update(),
  }

  for(var i in SOCKET_LIST) {
    let ws = SOCKET_LIST[i];

    if(initPack.ship.length > 0 || initPack.system.length > 0)
      ws.send(JSON.stringify({h: 'init', data: initPack}));

    if(removePack.ship.length > 0)
      ws.send(JSON.stringify({h: 'remove', data: removePack}));

    ws.send(JSON.stringify({h: 'update', data: updatePack}));
  }

  initPack.ship = [];
  initPack.system = [];
  removePack.ship = [];
}, 1000 / 30);

generateUniverse();

server.listen(2000);
console.log("Server started");
