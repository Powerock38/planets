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

var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/',(req,res)=>{
  res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
app.use(express.static(__dirname + '/client'));

serv.listen(2000);
console.log("Server started");

var io = require('socket.io')(serv,{});

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

io.sockets.on('connection', (socket)=>{
  socket.id = uuid("skt");
  SOCKET_LIST[socket.id] = socket;
  console.log('socket connection ' + socket.id);

  Ship.onConnect(socket);

  socket.on('disconnect',()=>{
    delete SOCKET_LIST[socket.id];
    Ship.onDisconnect(socket);
    console.log('socket deconnection ' + socket.id);
  });
});


setInterval(() => {
  let pack = {
    ship: Ship.update(),
    system: System.update(),
  }

  for(var i in SOCKET_LIST){
    let socket = SOCKET_LIST[i];
    if(initPack.ship.length > 0 || initPack.system.length > 0)
      socket.emit('init', initPack);
    socket.emit('update', pack);
    if(removePack.ship.length > 0)
      socket.emit('remove', removePack);
  }

  initPack.ship = [];
  initPack.system = [];
  removePack.ship = [];
}, 1000 / 30);

generateUniverse();
