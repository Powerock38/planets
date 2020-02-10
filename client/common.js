//choose a random item from array
rndChoose = (arr)=>{
  return arr[Math.floor(Math.random() * arr.length)];
}

//random int between min,max included
rnd = (min, max)=>{
  return Math.floor(Math.random() * (max - min + 1) + min);
}

//random float between min,max included
rndFloat = (min, max)=>{
  return Math.random() * (max - min) + min;
}

getDistance = (pt1,pt2)=>{
  return Math.sqrt(Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2));
}


Ores = {
  "cobalt": {
    name: "Cobalt ore",
    color: "rgba(61, 89, 171, 0.8)",
    rarity: 0.2,
    max: 300
  },
  "nickel": {
    name: "Nickel ore",
    color: "rgba(158, 165, 172, 0.8)",
    rarity: 0.4,
    max: 500
  },
  "gold": {
    name: "Gold ore",
    color: "rgba(255, 215, 0, 0.8)",
    rarity: 0.1,
    max: 100
  },
  "platinum": {
    name: "Platinum ore",
    color: "rgba(85, 211, 223, 0.8)",
    rarity: 0.2,
    max: 250
  },
  "iron": {
    name: "Iron ore",
    color: "rgba(117, 117, 117, 0.8)",
    rarity: 0.7,
    max: 1000
  },
  "silicon": {
    name: "Silicon ore",
    color: "rgba(177, 182, 185, 0.8)",
    rarity: 0.5,
    max: 600
  },
  "silver": {
    name: "Silver ore",
    color: "rgba(193, 193, 193, 0.8)",
    rarity: 0.2,
    max: 200
  },
  "magnesium": {
    name: "Magnesium ore",
    color: "rgba(92, 138, 152, 0.8)",
    rarity: 0.2,
    max: 150
  },
  "uranium": {
    name: "Uranium ore",
    color: "rgba(0, 254, 0, 0.8)",
    rarity: 0.1,
    max: 50
  }
};
