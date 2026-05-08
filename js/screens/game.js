import { W, H, PLAYER_H } from '../config.js';

export class GameScreen {
  constructor() {
    this.startPlatform = null;
    this.flashTimer = 0;
  }

  reset() {
    this.startPlatform = { x: W / 2, y: H - 30, w: 120 };
    this.flashTimer = 0;
  }

  update(player, balls, particles, camera, input, storage, flowerColors) {
    player.update(input);
    let result = null;

    // platform collision
    if (this.startPlatform && player.vy >= 0) {
      const plat = this.startPlatform;
      if (player.x > plat.x - plat.w / 2 && player.x < plat.x + plat.w / 2 &&
          player.y + PLAYER_H / 2 >= plat.y - 4 && player.y + PLAYER_H / 2 <= plat.y + 10) {
        player.y = plat.y - PLAYER_H / 2 - 4;
        player.vy = 0;
        player.vx = 0;
        player.onGround = true;
      }
    }

    // ball collision
    const hitBall = balls.checkCollision(player, particles, storage, flowerColors);
    if (hitBall) {
      this.flashTimer = 8;
      result = { scored: true, isCoin: hitBall.type === 'coin' };
    }

    // camera
    camera.update(player.y);

    // spawn + cleanup
    balls.spawnMore(camera.y);
    balls.cleanup(camera.y);

    if (this.startPlatform && this.startPlatform.y > camera.y + H + 50) {
      this.startPlatform = null;
    }

    // death
    if (player.y > camera.y + H + 50) {
      return { died: true };
    }

    // particles
    particles.update();
    if (this.flashTimer > 0) this.flashTimer--;

    return result;
  }

  draw(ctx, player, balls, particles, sprites, camera, score, coins, flowerColors) {
    const cy = camera.y;

    if (this.flashTimer > 4) {
      ctx.fillStyle = 'rgba(150, 150, 255, 0.15)';
      ctx.fillRect(0, 0, W, H);
    }

    // platform
    if (this.startPlatform) {
      const plat = this.startPlatform;
      const sy = plat.y - cy;
      ctx.fillStyle = '#444466';
      ctx.fillRect(plat.x - plat.w / 2, sy - 4, plat.w, 8);
      ctx.fillStyle = '#555577';
      ctx.fillRect(plat.x - plat.w / 2 + 2, sy - 4, plat.w - 4, 3);
    }

    balls.draw(ctx, cy, flowerColors);
    particles.draw(ctx, cy);
    player.draw(ctx, sprites, cy);

    // HUD
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(score, W / 2, 40);

    // coin counter
    ctx.fillStyle = '#ddaa00';
    ctx.beginPath();
    ctx.arc(25, 36, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffcc44';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(coins, 35, 40);
  }
}
