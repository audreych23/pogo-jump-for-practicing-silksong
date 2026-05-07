export class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  spawn(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5 - 2,
        life: 20 + Math.random() * 20,
        maxLife: 40,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  }

  spawnDirectional(x, y, facing) {
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x, y,
        vx: facing * (1 + Math.random() * 2),
        vy: 1 + Math.random() * 2,
        life: 10 + Math.random() * 10,
        maxLife: 20,
        color: '#ffffff',
        size: 2,
      });
    }
  }

  update() {
    for (const pt of this.particles) {
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.15;
      pt.life--;
    }
    this.particles = this.particles.filter(pt => pt.life > 0);
  }

  draw(ctx, cameraY) {
    for (const pt of this.particles) {
      const alpha = pt.life / pt.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x - pt.size / 2, pt.y - cameraY - pt.size / 2, pt.size, pt.size);
    }
    ctx.globalAlpha = 1;
  }

  clear() {
    this.particles = [];
  }
}
