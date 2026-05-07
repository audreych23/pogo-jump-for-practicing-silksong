import { W, H } from '../config.js';

export class TitleScreen {
  constructor(sprites) {
    this.sprites = sprites;
    this.menuIndex = 0;
    this.menuItems = ['Play', 'Leaderboard', 'Settings', 'Gacha'];
  }

  handleKey(e, onSelect) {
    if (e.code === 'ArrowUp' || e.code === 'KeyW') {
      this.menuIndex = (this.menuIndex - 1 + this.menuItems.length) % this.menuItems.length;
    } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
      this.menuIndex = (this.menuIndex + 1) % this.menuItems.length;
    } else if (e.code === 'Space' || e.code === 'Enter') {
      onSelect(this.menuItems[this.menuIndex].toLowerCase());
    }
  }

  handleClick(ui, mx, my, onSelect) {
    const clicked = ui.getClicked(mx, my);
    if (clicked && this.menuItems.map(m => m.toLowerCase()).includes(clicked)) {
      onSelect(clicked);
    }
  }

  draw(ctx, ui, highScore, coins, input) {
    ui.clearButtons();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('POGO JUMP', W / 2, 80);

    this.drawCharacterAnim(ctx);

    // menu items — draw first pass to register hitboxes
    const menuY = 280;
    this.menuItems.forEach((item, i) => {
      ui.drawButton(ctx, item.toLowerCase(), item, W / 2, menuY + i * 35, { size: 18 });
    });

    // check hover and redraw highlighted
    const hovered = input ? ui.getHovered(input.mouseX, input.mouseY) : null;
    if (hovered) {
      const idx = this.menuItems.findIndex(m => m.toLowerCase() === hovered);
      if (idx >= 0) this.menuIndex = idx;
    }

    // redraw all with correct highlight
    ctx.fillStyle = '#1a1a2e';
    const clearY = menuY - 20;
    ctx.fillRect(0, clearY, W, this.menuItems.length * 35 + 10);
    // re-draw background stars in that region
    ui.buttons = ui.buttons.filter(b => !this.menuItems.map(m => m.toLowerCase()).includes(b.id));
    this.menuItems.forEach((item, i) => {
      const selected = i === this.menuIndex;
      ui.drawButton(ctx, item.toLowerCase(), item, W / 2, menuY + i * 35, {
        selected,
        size: selected ? 22 : 18,
      });
    });

    // controls hint
    ctx.font = '11px monospace';
    ctx.fillStyle = '#555566';
    ctx.textAlign = 'center';
    ctx.fillText('WASD + SPACE + S+CLICK', W / 2, menuY + 160);

    // high score + coins
    if (highScore > 0) {
      ctx.fillStyle = '#6666cc';
      ctx.font = '14px monospace';
      ctx.fillText('Best: ' + highScore, W / 2, H - 60);
    }
    ui.drawCoinCount(ctx, coins, W / 2 - 30, H - 35);
  }

  drawCharacterAnim(ctx) {
    const t = Date.now() / 1000;
    const cycle = t % 1.8;
    const norm = cycle / 1.8;
    const bounceY = Math.sin(Math.min(norm / 0.97, 1) * Math.PI) * -55;
    const charX = W / 2;
    const charBaseY = 175;
    const charY = charBaseY + bounceY;
    const rising = norm < 0.4;
    const impact = norm >= 0.97;
    const falling = norm >= 0.4 && !impact;
    const orbX = charX + 8;
    const orbY = charBaseY + 16;

    if (falling) {
      ctx.save();
      const grad = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, 16);
      grad.addColorStop(0, 'rgba(120, 120, 255, 0.3)');
      grad.addColorStop(1, 'rgba(120, 120, 255, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#6666cc';
      ctx.beginPath();
      ctx.arc(orbX, orbY, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#8888ee';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    if (impact) {
      ctx.save();
      const popT = (norm - 0.97) / 0.03;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const dist = popT * 18;
        ctx.globalAlpha = 1 - popT;
        ctx.fillStyle = '#8888ee';
        ctx.fillRect(orbX + Math.cos(angle) * dist - 2, orbY + Math.sin(angle) * dist - 2, 4, 4);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    const s = this.sprites;
    ctx.save();
    ctx.translate(charX, charY);
    if (impact) {
      ctx.drawImage(s.pogo, -s.pogo.width / 2, -s.pogo.height / 2);
    } else if (rising) {
      const spin = (norm - 0.05) / 0.4;
      ctx.rotate(spin * Math.PI * 2);
      ctx.drawImage(s.jump, -s.jump.width / 2, -s.jump.height / 2);
    } else {
      ctx.rotate(0.5);
      ctx.drawImage(s.pogo, -s.pogo.width / 2, -s.pogo.height / 2);
    }
    ctx.restore();
  }
}
