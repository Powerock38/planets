class Station {
  constructor(x, y) {
    this.id = uuid("sta");
    this.x = x;
    this.y = y;
    this.radius = 500;
    this.rotation = 0.005;

    Station.list[this.id] = this;
    initPack.station.push(this.getInitPack());
  }

  getInitPack() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      rotation: this.rotation,
      radius: this.radius
    }
  }

  static getAllInitPack() {
    let stations = [];
    for (let i in Station.list)
      stations.push(Station.list[i].getInitPack());
    return stations;
  }
}
Station.list = {};

module.exports = Station;
