import { H } from './config.js';

export class Camera {
  constructor() {
    this.y = 0;
    this.targetY = 0;
  }

  update(playerY) {
    this.targetY = Math.min(this.targetY, playerY - H * 0.4);
    this.y += (this.targetY - this.y) * 0.08;
  }

  reset() {
    this.y = 0;
    this.targetY = 0;
  }
}
