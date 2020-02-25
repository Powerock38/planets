class Structure {
  constructor(initPack) {
    this.id = initPack.id;
    this.x = initPack.x;
    this.y = initPack.y;
    this.rotation = initPack.rotation;
    this.type = initPack.type;
    this.radius = initPack.radius;

    Structure.list[this.id] = this;
  }

  draw() {
    if(this.type === "station") {
      let imgSize = this.radius * 2;
      ctx.drawImage(IMAGES.station, this.x - imgSize/2, this.y - imgSize/2, imgSize, imgSize);
    }
  }
}
Structure.list = {};
