/* TODO:
  - Atmospheres ?
  - Different speeds
  - Better looking ship
  - Upgrades
    - Mining range
    - Mining speed
    - Cargo size
    - Thrusters
    - Turning thrusters
    - Gravity & System rings
    - Distances ?
    - System info
    - Planet info
      - Ore analyzer
    - Crosshair
    - Minimap
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

serv.listen(1111);
console.log("Server started");

var io = require('socket.io')(serv,{});

var SOCKET_LIST = {};

//universe's constants
systemMinRadius = 10000;
systemMaxRadius = 20000;
oresMassMultiplier = 0.01;
planetMinRadius = 100;
planetMaxRadius = 1000;
planetGravityMassMultiplier = 0.005;
starMinRadius = 2000;
starMaxRadius = 5000;

initPack = {ship:[],system:[]};
// removePack = {ship:[],system:[]};

require("./client/common.js");
const Item = require("./client/Inventory.js").Item;
const Inventory = require("./client/Inventory.js").Inventory;
const Ship = require("./Classes.js").Ship;
const Planet = require("./Classes.js").Planet;
const System = require("./Classes.js").System;

function generateUniverse() {
  for (var i = 0; i < 10; i++) {
    let angle = Math.random() * 2 * Math.PI;
    let rad = systemMaxRadius * 2 * (i + 1);
    let x = Math.round(rad * Math.cos(angle));
    let y = Math.round(rad * Math.sin(angle));
    System.list[i] = new System({
      x: x,
      y: y,
    });
  }
}

io.sockets.on('connection', (socket)=>{
  socket.id = Math.random();
  SOCKET_LIST[socket.id] = socket;
  console.log('socket connection ' + socket.id);

  Ship.onConnect(socket);
});


setInterval(() => {
  let pack = {
    ship: Ship.update(),
    system: System.update(),
  }

  for(var i in SOCKET_LIST){
    let socket = SOCKET_LIST[i];
    socket.emit('init', initPack);
    socket.emit('update', pack);
    //socket.emit('remove', removePack);
  }

  initPack.ship = [];
  initPack.system = [];
  // removePack.ship = [];
  // removePack.system = [];
}, 1000 / 30);

generateUniverse();
