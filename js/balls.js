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

  checkCollision(player, particles, storage, flowerColors) {
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
          const pc = (flowerColors && flowerColors.petal) || '#ff8899';
          particles.spawn(ball.x, ball.y, pc, 12);
          particles.spawn(ball.x, ball.y, '#ffffff', 6);
        }
        particles.spawnDirectional(hitX, hitY, player.facing);

        return ball;
      }
    }
    return null;
  }

  draw(ctx, cameraY, flowerColors) {
    const fc = flowerColors || { flower: '#6666cc', flowerGlow: 'rgba(120,120,255,0.3)' };
    const trunkX = Math.floor(C.W / 2);

    // draw vine branches from trunk to each flower (behind the flowers)
    for (const ball of this.balls) {
      if (ball.hit) continue;
      const bsy = ball.y - cameraY;
      if (bsy < -50 || bsy > C.H + 50) continue;
      if (ball.type === 'coin') continue;

      ctx.strokeStyle = '#2a4433';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(trunkX, bsy + 4);
      // wavy vine with a midpoint curve
      const midX = (trunkX + ball.x) / 2;
      const curve = (ball.x > trunkX ? -1 : 1) * 15;
      ctx.quadraticCurveTo(midX, bsy + curve, ball.x, bsy + 10);
      ctx.stroke();

      // pixelated leaf nodes along the vine
      ctx.fillStyle = '#335544';
      const leafX = (trunkX + ball.x * 2) / 3;
      const leafY = bsy + curve * 0.3 + 2;
      ctx.fillRect(Math.round(leafX / 2) * 2 - 3, Math.round(leafY / 2) * 2 - 2, 6, 4);
    }

    for (const ball of this.balls) {
      if (ball.hit) continue;
      const sx = ball.x;
      const sy = ball.y - cameraY;
      if (sy < -50 || sy > C.H + 50) continue;

      const isCoin = ball.type === 'coin';
      const bodyColor = isCoin ? '#ddaa00' : fc.flower;
      const glowColor = isCoin ? 'rgba(200,170,50,0.3)' : fc.flowerGlow;

      // glow
      const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, ball.r + 10);
      grad.addColorStop(0, glowColor);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sx, sy, ball.r + 10, 0, Math.PI * 2);
      ctx.fill();

      if (isCoin) {
        // coin: circle with $ sign
        ctx.fillStyle = '#ddaa00';
        ctx.beginPath();
        ctx.arc(sx, sy, ball.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffcc44';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(sx, sy, ball.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ffee88';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('$', sx, sy + 5);
      } else {
        // tulip bud — circular body like the coin, with petal tips on top
        const r = ball.r;
        const darker = this.brighten(bodyColor, -40);
        const lighter = this.brighten(bodyColor, 50);

        // stem
        ctx.fillStyle = '#337744';
        ctx.fillRect(Math.round(sx / 2) * 2 - 2, sy + r - 2, 4, 8);

        // round body (same arc as coin)
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();

        // petal tips at top — two bumps curving inward
        ctx.fillStyle = darker;
        ctx.beginPath();
        ctx.arc(sx - 5, sy - r - 2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(sx + 5, sy - r - 2, 5, 0, Math.PI * 2);
        ctx.fill();

        // dark slit between petals
        ctx.fillStyle = this.brighten(bodyColor, -70);
        ctx.fillRect(Math.round(sx / 2) * 2 - 1, sy - r - 4, 2, 6);

        // shading — darker left arc
        ctx.fillStyle = darker;
        ctx.beginPath();
        ctx.arc(sx, sy, r, Math.PI * 0.65, Math.PI * 1.35);
        ctx.lineTo(sx, sy);
        ctx.fill();

        // highlight — lighter right
        ctx.fillStyle = lighter;
        ctx.beginPath();
        ctx.arc(sx + 3, sy - 3, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  brighten(hex, amount) {
    const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
    const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
    const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
    return '#' + [r, g, b].map(c => Math.round(c).toString(16).padStart(2, '0')).join('');
  }
}
