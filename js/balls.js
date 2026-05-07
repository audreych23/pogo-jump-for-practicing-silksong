import * as C from './config.js';

export class BallManager {
  constructor() {
    this.balls = [];
  }

  spawn(baseY, prevX) {
    const y = baseY + (Math.random() * 30 - 15);
    const maxOffset = C.W / 3;
    const refX = prevX || C.W / 2;
    const minX = Math.max(40, refX - maxOffset);
    const maxX = Math.min(C.W - 40, refX + maxOffset);
    const x = minX + Math.random() * (maxX - minX);
    const isCoin = Math.random() < C.COIN_CHANCE;
    this.balls.push({ x, y, r: C.BALL_RADIUS, hit: false, type: isCoin ? 'coin' : 'orb' });
    return x;
  }

  spawnInitial() {
    this.balls = [];
    let prevX = C.W / 2;
    for (let i = 0; i < 12; i++) {
      prevX = this.spawn(C.H - 85 - i * C.BALL_SPACING, prevX);
    }
  }

  spawnMore(cameraY) {
    if (this.balls.length > 0) {
      const highest = this.balls.reduce((a, b) => a.y < b.y ? a : b);
      if (highest.y > cameraY - 300) {
        this.spawn(highest.y - C.BALL_SPACING - Math.random() * 20, highest.x);
      }
    }
  }

  cleanup(cameraY) {
    this.balls = this.balls.filter(b => b.y < cameraY + C.H + 100);
  }

  checkCollision(player, particles, storage) {
    if (!player.pogoing || player.vy <= 0) return null;

    const hitX = player.x + player.facing * C.POGO_HITBOX_OFFSET_X;
    const hitY = player.y + C.POGO_HITBOX_OFFSET_Y;

    for (const ball of this.balls) {
      if (ball.hit) continue;
      const dx = hitX - ball.x;
      const dy = hitY - ball.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < ball.r + C.POGO_HITBOX_R) {
        ball.hit = true;
        player.onPogoBounce();

        if (ball.type === 'coin') {
          storage.coins = storage.coins + 1;
          particles.spawn(ball.x, ball.y, '#ffdd44', 10);
          particles.spawn(ball.x, ball.y, '#ffaa00', 6);
        } else {
          particles.spawn(ball.x, ball.y, '#ffffff', 12);
          particles.spawn(ball.x, ball.y, '#aaaaff', 6);
        }
        particles.spawnDirectional(hitX, hitY, player.facing);

        return ball;
      }
    }
    return null;
  }

  draw(ctx, cameraY) {
    for (const ball of this.balls) {
      if (ball.hit) continue;
      const sx = ball.x;
      const sy = ball.y - cameraY;
      if (sy < -50 || sy > C.H + 50) continue;

      const isCoin = ball.type === 'coin';
      const glowR = isCoin ? 'rgba(200, 170, 50, 0.3)' : 'rgba(120, 120, 255, 0.3)';
      const glowT = isCoin ? 'rgba(200, 170, 50, 0)' : 'rgba(120, 120, 255, 0)';
      const bodyColor = isCoin ? '#ddaa00' : '#6666cc';
      const strokeColor = isCoin ? '#ffcc44' : '#8888ee';
      const shineColor = isCoin ? 'rgba(255, 230, 150, 0.5)' : 'rgba(180, 180, 255, 0.4)';

      const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, ball.r + 8);
      grad.addColorStop(0, glowR);
      grad.addColorStop(1, glowT);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sx, sy, ball.r + 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = bodyColor;
      ctx.beginPath();
      ctx.arc(sx, sy, ball.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, sy, ball.r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = shineColor;
      ctx.beginPath();
      ctx.arc(sx - 5, sy - 5, 4, 0, Math.PI * 2);
      ctx.fill();

      if (isCoin) {
        ctx.fillStyle = '#ffee88';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('$', sx, sy + 5);
      }
    }
  }
}
