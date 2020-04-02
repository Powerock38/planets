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

initPack = {ship:[], system:[], laser:[], station:[], quarry:[], sentry:[]};
removePack = {ship:[], laser:[], sentry:[]};

require("./client/common.js");
const Craft = require("./Classes/Craft.js");
const Ship = require("./Classes/Ship.js");
const Laser = require("./Classes/Laser.js");
const System = require("./Classes/System.js");
const Station = require("./Classes/Station.js");
const Quarry = require("./Classes/Quarry.js");
const Sentry = require("./Classes/Sentry.js");

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

  new Station(SPAWNx, SPAWNy, "station", 500);
}

wss.on('connection', (ws)=>{
  ws.id = uuid("skt");
  SOCKET_LIST[ws.id] = ws;
  console.log('socket connection ' + ws.id);

  //custom functions
  ws.ssend = (header, data) => {
    let pack = {h: header, data: data};
    try {
      let jsonPack = JSON.stringify(pack);
      ws.send(jsonPack);
    }
    catch(err) {
      console.error(err);
    }
  }
  ws.onmsg = (header, callback) => {
    ws.on('message', (jsonPack)=>{
      try {
        let pack = JSON.parse(jsonPack);
        if(pack.h === header) {
          callback(pack.data);
        }
      }
      catch(err) {
        console.error(err);
      }
    });
  }

  Ship.onConnect(ws);

  ws.on('close',(e)=>{
    Ship.onDisconnect(ws);
    delete SOCKET_LIST[ws.id];
    console.log("socket deconnection " + ws.id + " (" + e + ")");
  });

  ws.on('error',(e)=>{
    return console.error(e);
  });

  //serval()
  if(DEBUG) {
    ws.onmsg("eval",(data)=>{
      try {
        eval(data);
      }
      catch(error) {
        console.log("==== SERVAL ERROR ====");
        console.error(error);
        console.log("======================");
      }
    });
  }
});

function packIsNotEmpty(pack) {
  let empty = true;
  for(let i in pack) {
    if(pack[i].length > 0) {
      empty = false;
    }
  }
  return !empty;
}

setInterval(() => {
  let updatePack = {
    ship: Ship.update(),
    system: System.update(),
    laser: Laser.update(),
    sentry: Sentry.update(),
  };

  for(var i in SOCKET_LIST) {
    let ws = SOCKET_LIST[i];

    if(packIsNotEmpty(initPack))
      ws.ssend("init", initPack);

    if(packIsNotEmpty(removePack))
      ws.ssend("remove", removePack);

    ws.ssend("update", updatePack);
  }

  for(let i in initPack)
    initPack[i] = [];

  for(let i in removePack)
    removePack[i] = [];
}, 1000 / 30);

generateUniverse();

server.listen(2000);
console.log("Server started");
