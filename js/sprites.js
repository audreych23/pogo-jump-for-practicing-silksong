import { SPRITE_SCALE, GACHA_POOL } from './config.js';

export const DEFAULT_COLORS = {
  'W': '#ffffff',
  'G': '#aaaaaa',
  'D': '#555555',
  'B': '#000000',
  'H': '#aaaaaa',
  'S': '#ccccdd',
  'L': '#ffffff',
  'T': '#eeeeff',
};

export const PIXELS_STAND = [
  '...HH..HH...',
  '...HHHHHH...',
  '..HHHHHHH...',
  '..HWWWWWH...',
  '..WWBWBWW...',
  '..WWWWWWW...',
  '...GGGGG....',
  '..GGGGGGG...',
  '..GGGGGGG...',
  '.GGGGGGGGG..',
  '.GGGGGGGGG..',
  '..GGG.GGG...',
  '..DDD.DDD...',
];

export const PIXELS_JUMP = [
  '...HH..HH...',
  '...HHHHHH...',
  '..HHHHHHH...',
  '..HWWWWWH...',
  '..WWBWBWW...',
  '..WWWWWWW...',
  '...GGGGG....',
  '..GGGGGGG...',
  '.GGGGGGGGG..',
  '.GGG...GGG..',
  '.GG.....GG..',
  '..D.....D...',
];

export const PIXELS_POGO = [
  '...HH..HH..........',
  '...HHHHHH...........',
  '..HHHHHHH...........',
  '..HWWWWWH...........',
  '..WWBWBWW...........',
  '..WWWWWWW...........',
  '...GGGGG............',
  '..GGGGGGGT..........',
  '..GGGGGGG.TT........',
  '...GGGGGG..SS.......',
  '....GGG.....SS......',
  '..........T..SS.....',
  '...........T..SS....',
  '.............T.SLS..',
  '..............T.TT..',
  '................T...',
];

export const PIXELS_SWORD = [
  '......L......',
  '.....SLS.....',
  '....SSSSS....',
  '....SSLSS....',
  '.....SSS.....',
  '.....SSS.....',
  '.....SSS.....',
  '.....SSS.....',
  '.....TST.....',
  '.....TST.....',
  '....TTTTT....',
  '....T.T.T....',
  '......T......',
];

function renderSprite(pixels, colors, size) {
  const c = document.createElement('canvas');
  c.width = pixels[0].length * size;
  c.height = pixels.length * size;
  const x = c.getContext('2d');
  for (let r = 0; r < pixels.length; r++) {
    for (let col = 0; col < pixels[r].length; col++) {
      const ch = pixels[r][col];
      if (ch !== '.' && colors[ch]) {
        x.fillStyle = colors[ch];
        x.fillRect(col * size, r * size, size, size);
      }
    }
  }
  return c;
}

export class SpriteManager {
  constructor(storage) {
    this.storage = storage;
    this.stand = null;
    this.jump = null;
    this.pogo = null;
    this.activeColors = { ...DEFAULT_COLORS };
    this.rebuild();
  }

  getActiveColors() {
    const colors = { ...DEFAULT_COLORS };
    const equipped = this.storage.equipped;
    for (const slotId of Object.values(equipped)) {
      if (!slotId) continue;
      const item = GACHA_POOL.find(g => g.id === slotId);
      if (item) Object.assign(colors, item.colors);
    }
    return colors;
  }

  rebuild() {
    this.activeColors = this.getActiveColors();
    this.stand = renderSprite(PIXELS_STAND, this.activeColors, SPRITE_SCALE);
    this.jump = renderSprite(PIXELS_JUMP, this.activeColors, SPRITE_SCALE);
    this.pogo = renderSprite(PIXELS_POGO, this.activeColors, SPRITE_SCALE);
  }

  renderPreview(pixels, colors) {
    return renderSprite(pixels, { ...DEFAULT_COLORS, ...colors }, SPRITE_SCALE);
  }
}
