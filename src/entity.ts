export abstract class Entity {
  static all: Entity[] = [];

  static generateId() {
    return Math.floor(Math.random() * 1000000);
  }

  id = Entity.generateId();

  speed = 0;
  speedAngle = 0;
  maxSpeed = 10;
  maxSpeedAngle = 0.2;

  constructor(protected x = 0, protected y = 0, protected angle = 0) {
    Entity.all.push(this);
  }

  abstract update(): void;
  abstract draw(): void;
}
