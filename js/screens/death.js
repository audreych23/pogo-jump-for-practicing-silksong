import { W, H } from '../config.js';

export class DeathScreen {
  constructor() {
    this.timer = 0;
  }

  reset() {
    this.timer = 0;
  }

  update() {
    this.timer++;
  }

  get canContinue() {
    return this.timer > 40;
  }

  draw(ctx, score, highScore, isNewBest) {
    const alpha = Math.min(this.timer / 30, 0.7);
    ctx.fillStyle = `rgba(10, 0, 20, ${alpha})`;
    ctx.fillRect(0, 0, W, H);

    if (this.timer > 20) {
      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 32px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', W / 2, H / 3);

      ctx.fillStyle = '#ffffff';
      ctx.font = '22px monospace';
      ctx.fillText('Score: ' + score, W / 2, H / 2 - 10);

      if (isNewBest) {
        ctx.fillStyle = '#ffcc00';
        ctx.font = '16px monospace';
        ctx.fillText('NEW BEST!', W / 2, H / 2 + 20);
      } else {
        ctx.fillStyle = '#6666cc';
        ctx.font = '16px monospace';
        ctx.fillText('Best: ' + highScore, W / 2, H / 2 + 20);
      }

      if (this.canContinue) {
        const blink = Math.sin(Date.now() / 300) > 0;
        ctx.fillStyle = '#888888';
        ctx.font = '14px monospace';
        if (blink) ctx.fillText('SPACE or CLICK to continue', W / 2, H * 0.7);
      }
    }
  }
}
