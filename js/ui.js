import { W, H, RARITY_COLORS } from './config.js';

export class UIManager {
  constructor() {
    this.buttons = [];
    this.bgLayers = [
      { stars: [], speed: 0.03, color: '#222244', baseSize: 2 },
      { stars: [], speed: 0.1, color: '#333366', baseSize: 3 },
      { stars: [], speed: 0.25, color: '#444488', baseSize: 4 },
    ];
    this.bgLayers.forEach(layer => {
      const count = layer.speed < 0.05 ? 50 : (layer.speed < 0.15 ? 25 : 12);
      for (let i = 0; i < count; i++) {
        layer.stars.push({
          x: Math.random() * W,
          yOffset: Math.random() * 2000,
          twinkleSpeed: 0.5 + Math.random() * 2.5,
          twinkleOffset: Math.random() * Math.PI * 2,
          maxGrow: 1 + Math.random() * 2,
          brightColor: this.brightenColor(layer.color, 40 + Math.random() * 40),
        });
      }
    });
  }

  brightenColor(hex, amount) {
    const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
    const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
    const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
    return '#' + [r, g, b].map(c => Math.round(c).toString(16).padStart(2, '0')).join('');
  }

  clearButtons() {
    this.buttons = [];
  }

  drawButton(ctx, id, text, x, y, opts = {}) {
    const selected = opts.selected || false;
    const disabled = opts.disabled || false;
    const size = opts.size || 18;
    ctx.font = (selected ? 'bold ' : '') + size + 'px monospace';
    ctx.fillStyle = disabled ? '#444455' : (selected ? '#ffcc44' : (opts.color || '#8888aa'));
    ctx.textAlign = opts.align || 'center';
    ctx.fillText(text, x, y);
    const metrics = ctx.measureText(text);
    const hitbox = { id, x: x - metrics.width / 2, y: y - size, w: metrics.width, h: size + 6 };
    if (opts.align === 'left') hitbox.x = x;
    if (opts.align === 'right') hitbox.x = x - metrics.width;
    this.buttons.push(hitbox);
    return hitbox;
  }

  getClicked(mx, my) {
    for (const b of this.buttons) {
      if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) return b.id;
    }
    return null;
  }

  getHovered(mx, my) {
    for (const b of this.buttons) {
      if (mx >= b.x && mx <= b.x + b.w && my >= b.y && my <= b.y + b.h) return b.id;
    }
    return null;
  }

  drawBackground(ctx, scrollSource) {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, W, H);
    const t = Date.now() / 1000;
    for (const layer of this.bgLayers) {
      for (const star of layer.stars) {
        const scroll = scrollSource * layer.speed;
        const sy = ((star.yOffset - scroll) % (H + 40)) + H + 20;
        const screenY = ((sy % (H + 40)) + (H + 40)) % (H + 40) - 20;

        const twinkle = Math.sin(t * star.twinkleSpeed + star.twinkleOffset);
        const grow = Math.max(0, twinkle) * star.maxGrow;
        const size = layer.baseSize + grow;
        const bright = twinkle > 0.5;

        ctx.fillStyle = bright ? star.brightColor : layer.color;
        // pixelated: snap to 2px grid
        const sx = Math.round(star.x / 2) * 2;
        const snappedY = Math.round(screenY / 2) * 2;
        const snappedSize = Math.max(2, Math.round(size / 2) * 2);
        ctx.fillRect(sx, snappedY, snappedSize, snappedSize);
      }
    }
  }

  drawScreenTitle(ctx, text) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(text, W / 2, 50);
  }

  drawBackButton(ctx, selected) {
    this.drawButton(ctx, 'back', '< Back', W / 2, H - 30, { selected, size: 16 });
  }

  drawRarityLabel(ctx, rarity, x, y) {
    ctx.fillStyle = RARITY_COLORS[rarity] || '#888888';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(rarity.toUpperCase(), x, y);
  }

  drawCoinCount(ctx, coins, x, y) {
    ctx.fillStyle = '#ddaa00';
    ctx.beginPath();
    ctx.arc(x, y - 4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffcc44';
    ctx.font = '14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(coins, x + 10, y);
  }
}
