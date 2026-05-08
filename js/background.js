import { W, H } from './config.js';

const ZONES = [
  { at: 0,     sky: '#1a1a2e', tree: '#2a2244', petal: '#ff8899', flower: '#ff6688', flowerGlow: 'rgba(255,120,150,0.3)' },
  { at: -800,  sky: '#1a2a1e', tree: '#1a3318', petal: '#ffaa77', flower: '#ffaa44', flowerGlow: 'rgba(255,180,80,0.3)' },
  { at: -2000, sky: '#0d2a2a', tree: '#154433', petal: '#66ddaa', flower: '#44cc88', flowerGlow: 'rgba(80,200,140,0.3)' },
  { at: -4000, sky: '#0d1a2e', tree: '#152244', petal: '#8888ff', flower: '#6666cc', flowerGlow: 'rgba(120,120,255,0.3)' },
  { at: -7000, sky: '#1a0d2e', tree: '#2a1544', petal: '#cc88ff', flower: '#aa66dd', flowerGlow: 'rgba(180,120,255,0.3)' },
  { at: -11000, sky: '#2a1a0d', tree: '#3a2210', petal: '#ffdd44', flower: '#ddaa00', flowerGlow: 'rgba(220,170,0,0.3)' },
];

function lerpColor(a, b, t) {
  const ar = parseInt(a.slice(1, 3), 16), ag = parseInt(a.slice(3, 5), 16), ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16), bg = parseInt(b.slice(3, 5), 16), bb = parseInt(b.slice(5, 7), 16);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const blue = Math.round(ab + (bb - ab) * t);
  return '#' + [r, g, blue].map(c => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('');
}

function getZoneColors(cameraY) {
  const y = cameraY;
  for (let i = ZONES.length - 1; i >= 0; i--) {
    if (y <= ZONES[i].at) {
      if (i === ZONES.length - 1) return ZONES[i];
      const next = ZONES[i + 1];
      const curr = ZONES[i];
      const t = (y - curr.at) / (next.at - curr.at);
      return {
        sky: lerpColor(curr.sky, next.sky, t),
        tree: lerpColor(curr.tree, next.tree, t),
        petal: lerpColor(curr.petal, next.petal, t),
        flower: lerpColor(curr.flower, next.flower, t),
        flowerGlow: curr.flowerGlow,
      };
    }
  }
  return ZONES[0];
}

export class Background {
  constructor() {
    this.stars = [];
    this.petals = [];
    this.treeBranches = [];

    // stars
    for (let i = 0; i < 70; i++) {
      this.stars.push({
        x: Math.random() * W,
        yOff: Math.random() * 3000,
        baseSize: 2 + Math.floor(Math.random() * 3),
        twinkleSpeed: 0.5 + Math.random() * 2,
        twinkleOffset: Math.random() * Math.PI * 2,
        maxGrow: 1 + Math.random() * 2,
      });
    }

    // petals
    for (let i = 0; i < 25; i++) {
      this.petals.push(this.makePetal());
    }

    // tree branch pattern (repeating every 400px)
    this.generateTree();
  }

  makePetal() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: -0.3 - Math.random() * 0.5,
      vy: 0.4 + Math.random() * 0.6,
      sineAmp: 10 + Math.random() * 20,
      sineSpeed: 1 + Math.random() * 2,
      sineOffset: Math.random() * Math.PI * 2,
      size: 3 + Math.floor(Math.random() * 3),
      rotation: Math.random() * Math.PI,
      rotSpeed: 0.02 + Math.random() * 0.04,
    };
  }

  generateTree() {
    // trunk segments + branches in a repeating 600px pattern
    this.treeBranches = [];
    const trunkX = Math.floor(W / 2) - 15;
    const trunkW = 30;
    // main trunk
    this.treeBranches.push({ x: trunkX, w: trunkW, type: 'trunk' });
    // branches at various heights within the pattern
    const branchDefs = [
      { y: 50, dir: -1, len: 70, thick: 10 },
      { y: 120, dir: 1, len: 60, thick: 8 },
      { y: 200, dir: -1, len: 90, thick: 8 },
      { y: 280, dir: 1, len: 80, thick: 10 },
      { y: 350, dir: -1, len: 50, thick: 12 },
      { y: 400, dir: 1, len: 100, thick: 8 },
      { y: 480, dir: -1, len: 110, thick: 10 },
      { y: 540, dir: 1, len: 55, thick: 6 },
    ];
    for (const b of branchDefs) {
      this.treeBranches.push({
        y: b.y,
        x: b.dir === -1 ? trunkX - b.len : trunkX + trunkW,
        w: b.len,
        h: b.thick,
        type: 'branch',
      });
      // leaf cluster at branch end
      if (b.len > 40) {
        const leafX = b.dir === -1 ? trunkX - b.len - 15 : trunkX + trunkW + b.len - 5;
        this.treeBranches.push({
          x: leafX, y: b.y - 12, w: 30, h: 20, type: 'leaves',
        });
      }
    }
  }

  getFlowerColors(cameraY) {
    return getZoneColors(cameraY);
  }

  draw(ctx, cameraY, isMenu) {
    const scroll = isMenu ? Date.now() * 0.02 : cameraY;
    const zone = getZoneColors(scroll);

    // sky
    ctx.fillStyle = zone.sky;
    ctx.fillRect(0, 0, W, H);

    // stars (far back, slow scroll)
    const t = Date.now() / 1000;
    for (const star of this.stars) {
      const starScroll = scroll * 0.03;
      const sy = ((star.yOff - starScroll) % (H + 40)) + H + 20;
      const screenY = ((sy % (H + 40)) + (H + 40)) % (H + 40) - 20;

      const twinkle = Math.sin(t * star.twinkleSpeed + star.twinkleOffset);
      const grow = Math.max(0, twinkle) * star.maxGrow;
      const size = star.baseSize + grow;
      const bright = twinkle > 0.3;

      ctx.fillStyle = bright ? this.brightenHex(zone.sky, 60) : this.brightenHex(zone.sky, 25);
      const sx = Math.round(star.x / 2) * 2;
      const snY = Math.round(screenY / 2) * 2;
      const snS = Math.max(2, Math.round(size / 2) * 2);
      ctx.fillRect(sx, snY, snS, snS);
    }

    // tree silhouette (mid scroll)
    this.drawTree(ctx, scroll, zone.tree);

    // petals
    this.updateAndDrawPetals(ctx, zone.petal);
  }

  drawTree(ctx, scroll, treeColor) {
    const treeScroll = scroll * 0.15;
    const patternH = 600;
    const trunkX = this.treeBranches[0].x;
    const trunkW = this.treeBranches[0].w;
    const lighterBark = this.brightenHex(treeColor, 25);
    const darkerBark = this.brightenHex(treeColor, -20);

    // trunk — full height
    ctx.fillStyle = treeColor;
    ctx.fillRect(trunkX, 0, trunkW, H);

    // bark texture — horizontal grain lines
    for (let ty = 0; ty < H; ty += 8) {
      const offset = ((ty + treeScroll * 0.5) % 16);
      if (offset < 4) {
        ctx.fillStyle = lighterBark;
        ctx.fillRect(trunkX + 4, ty, 8, 2);
        ctx.fillRect(trunkX + 18, ty + 3, 6, 2);
      } else if (offset < 8) {
        ctx.fillStyle = darkerBark;
        ctx.fillRect(trunkX + 10, ty, 10, 2);
        ctx.fillRect(trunkX + 2, ty + 4, 6, 2);
      }
    }

    // branches
    for (const b of this.treeBranches) {
      if (b.type === 'trunk') continue;
      const baseY = ((b.y - treeScroll) % patternH + patternH) % patternH;

      if (b.type === 'branch') {
        ctx.fillStyle = treeColor;
        // snap to pixel grid
        const bx = Math.round(b.x / 2) * 2;
        const by = Math.round(baseY / 2) * 2;
        const bw = Math.round(b.w / 2) * 2;
        const bh = Math.max(2, Math.round(b.h / 2) * 2);
        ctx.fillRect(bx, by, bw, bh);
      } else if (b.type === 'leaves') {
        ctx.fillStyle = this.brightenHex(treeColor, 35);
        const lx = Math.round(b.x / 2) * 2;
        const ly = Math.round(baseY / 2) * 2;
        // pixelated leaf cluster (stacked rects)
        ctx.fillRect(lx + 4, ly, b.w - 8, 4);
        ctx.fillRect(lx, ly + 4, b.w, b.h - 8);
        ctx.fillRect(lx + 4, ly + b.h - 4, b.w - 8, 4);
      }
    }
  }

  updateAndDrawPetals(ctx, petalColor) {
    const t = Date.now() / 1000;
    for (const p of this.petals) {
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotSpeed;

      // sine wave drift
      const drift = Math.sin(t * p.sineSpeed + p.sineOffset) * 0.5;
      p.x += drift;

      // wrap
      if (p.y > H + 10) { p.y = -10; p.x = Math.random() * W; }
      if (p.x < -20) p.x = W + 10;

      // draw pixelated petal
      ctx.fillStyle = petalColor;
      const px = Math.round(p.x / 2) * 2;
      const py = Math.round(p.y / 2) * 2;
      ctx.fillRect(px, py, p.size * 2, p.size);
      ctx.fillRect(px + 1, py - 1, p.size, p.size);
    }
  }

  brightenHex(hex, amount) {
    if (hex.length < 7) return hex;
    const r = Math.min(255, Math.max(0, parseInt(hex.slice(1, 3), 16) + amount));
    const g = Math.min(255, Math.max(0, parseInt(hex.slice(3, 5), 16) + amount));
    const b = Math.min(255, Math.max(0, parseInt(hex.slice(5, 7), 16) + amount));
    return '#' + [r, g, b].map(c => Math.round(c).toString(16).padStart(2, '0')).join('');
  }
}
