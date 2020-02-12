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
