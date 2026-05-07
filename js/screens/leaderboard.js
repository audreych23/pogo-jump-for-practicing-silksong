import { W, H } from '../config.js';

export class LeaderboardScreen {
  constructor(storage) {
    this.storage = storage;
  }

  handleClick(ui, mx, my) {
    const clicked = ui.getClicked(mx, my);
    if (clicked === 'back') return 'title';
    return null;
  }

  draw(ctx, ui) {
    ui.clearButtons();
    ui.drawScreenTitle(ctx, 'LEADERBOARD');

    const board = this.storage.leaderboard.slice(0, 10);
    const currentName = this.storage.playerName;

    if (board.length === 0) {
      ctx.fillStyle = '#555566';
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('No scores yet!', W / 2, H / 2 - 20);
      ctx.fillText('Play a game first.', W / 2, H / 2 + 10);
    } else {
      const startY = 90;
      const rowH = 32;

      // header
      ctx.fillStyle = '#555566';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('#', 40, startY);
      ctx.fillText('NAME', 70, startY);
      ctx.textAlign = 'right';
      ctx.fillText('SCORE', W - 40, startY);

      ctx.strokeStyle = '#333355';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(30, startY + 8);
      ctx.lineTo(W - 30, startY + 8);
      ctx.stroke();

      board.forEach((entry, i) => {
        const y = startY + 28 + i * rowH;
        const isMe = entry.name === currentName;

        if (isMe) {
          ctx.fillStyle = 'rgba(100, 100, 200, 0.15)';
          ctx.fillRect(30, y - 16, W - 60, rowH - 2);
        }

        ctx.fillStyle = isMe ? '#ffcc44' : '#aaaacc';
        ctx.font = (i < 3 ? 'bold ' : '') + '15px monospace';

        ctx.textAlign = 'left';
        ctx.fillText((i + 1) + '.', 40, y);
        ctx.fillText(entry.name, 70, y);

        ctx.textAlign = 'right';
        ctx.fillText(entry.score, W - 40, y);
      });
    }

    ui.drawBackButton(ctx, false);
  }
}
