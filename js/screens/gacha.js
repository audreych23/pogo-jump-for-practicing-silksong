import { W, H, GACHA_POOL, GACHA_COST, GACHA_DUPE_REFUND, RARITY_COLORS } from '../config.js';
import { PIXELS_STAND, PIXELS_SWORD } from '../sprites.js';

export class GachaScreen {
  constructor(storage, sprites) {
    this.storage = storage;
    this.sprites = sprites;
    this.result = null;
    this.animTimer = 0;
    this.history = [];
    this.tab = 'pull';
    this.scroll = 0;
    this.previewCache = {};
  }

  handleClick(ui, mx, my) {
    const clicked = ui.getClicked(mx, my);
    if (clicked === 'back') return 'title';
    if (clicked === 'pull') this.doPull();
    if (clicked === 'tab_pull') { this.tab = 'pull'; this.scroll = 0; }
    if (clicked === 'tab_collection') { this.tab = 'collection'; this.scroll = 0; }
    if (clicked && clicked.startsWith('equip_')) {
      this.toggleEquip(clicked.replace('equip_', ''));
    }
    return null;
  }

  handleKey(e) {
    if (e.code === 'ArrowUp') this.scroll = Math.max(0, this.scroll - 1);
    if (e.code === 'ArrowDown') this.scroll++;
  }

  doPull() {
    const coins = this.storage.coins;
    if (coins < GACHA_COST) return;
    this.storage.coins = coins - GACHA_COST;

    const roll = Math.random();
    let rarity;
    if (roll < 0.02) rarity = 'mythical';
    else if (roll < 0.05) rarity = 'legendary';
    else if (roll < 0.15) rarity = 'epic';
    else if (roll < 0.40) rarity = 'rare';
    else rarity = 'common';

    const pool = GACHA_POOL.filter(i => i.rarity === rarity);
    const item = pool[Math.floor(Math.random() * pool.length)];

    const inv = this.storage.inventory;
    const duplicate = inv.includes(item.id);

    if (duplicate) {
      this.storage.coins = this.storage.coins + GACHA_DUPE_REFUND;
    } else {
      this.storage.addItem(item.id);
    }

    this.result = { item, duplicate };
    this.animTimer = 40;
    this.history.unshift({ item, duplicate });
    if (this.history.length > 20) this.history.length = 20;
  }

  toggleEquip(itemId) {
    const item = GACHA_POOL.find(g => g.id === itemId);
    if (!item) return;

    const equipped = this.storage.equipped;
    const slot = item.slot === 'full' ? 'skin' : (item.slot === 'set' ? 'cape' : item.slot);

    if (equipped[slot] === itemId) {
      equipped[slot] = null;
      if (item.slot === 'full' || item.slot === 'set') {
        equipped.sword = null;
        equipped.cape = null;
        if (item.slot === 'full') equipped.skin = null;
      }
    } else {
      if (item.slot === 'full') {
        equipped.sword = itemId;
        equipped.cape = itemId;
        equipped.skin = itemId;
      } else if (item.slot === 'set') {
        equipped.sword = itemId;
        equipped.cape = itemId;
      } else {
        equipped[slot] = itemId;
      }
    }

    this.storage.equipped = equipped;
    this.sprites.rebuild();
    this.previewCache = {};
  }

  getPreview(item) {
    const key = item.id;
    if (!this.previewCache[key]) {
      const pixels = item.slot === 'sword' ? PIXELS_SWORD : PIXELS_STAND;
      this.previewCache[key] = this.sprites.renderPreview(pixels, item.colors);
    }
    return this.previewCache[key];
  }

  update() {
    if (this.animTimer > 0) this.animTimer--;
  }

  draw(ctx, ui) {
    ui.clearButtons();
    ui.drawScreenTitle(ctx, 'GACHA');

    const coins = this.storage.coins;
    ui.drawCoinCount(ctx, coins, W / 2 - 30, 75);

    // pull button
    const canPull = coins >= GACHA_COST;
    ui.drawButton(ctx, 'pull', 'Pull! (' + GACHA_COST + ' coins)', W / 2, 100, {
      size: 18,
      color: canPull ? '#ffcc44' : '#444455',
      disabled: !canPull,
    });

    // tabs
    const tabY = 120;
    const isPull = this.tab === 'pull';
    ui.drawButton(ctx, 'tab_pull', 'History', W / 4, tabY, {
      size: 14, color: isPull ? '#ffcc44' : '#555566',
    });
    ui.drawButton(ctx, 'tab_collection', 'Collection', W * 3 / 4, tabY, {
      size: 14, color: !isPull ? '#ffcc44' : '#555566',
    });

    ctx.strokeStyle = '#333355';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, tabY + 10);
    ctx.lineTo(W - 20, tabY + 10);
    ctx.stroke();

    // result display (below tabs)
    const contentY = tabY + 20;
    if (this.result) {
      this.drawResult(ctx, ui, contentY);
      const afterResult = contentY + 95;
      if (this.tab === 'pull') {
        this.drawHistory(ctx, ui, afterResult);
      } else {
        this.drawCollection(ctx, ui, afterResult);
      }
    } else {
      if (this.tab === 'pull') {
        this.drawHistory(ctx, ui, contentY);
      } else {
        this.drawCollection(ctx, ui, contentY);
      }
    }

    // back button — always visible
    ui.drawBackButton(ctx, false);
  }

  drawResult(ctx, ui, startY) {
    if (!this.result) return;
    const item = this.result.item;
    const rColor = RARITY_COLORS[item.rarity];

    const boxY = startY;
    const boxH = 85;
    ctx.strokeStyle = rColor;
    ctx.lineWidth = item.rarity === 'mythical' ? 3 : 2;
    ctx.strokeRect(30, boxY, W - 60, boxH);
    ctx.fillStyle = 'rgba(20, 15, 40, 0.85)';
    ctx.fillRect(31, boxY + 1, W - 62, boxH - 2);

    if (this.animTimer > 30) {
      const flash = (this.animTimer - 30) / 10;
      ctx.fillStyle = `rgba(255, 255, 255, ${flash * 0.3})`;
      ctx.fillRect(31, boxY + 1, W - 62, boxH - 2);
    }

    const preview = this.getPreview(item);
    const previewScale = item.slot === 'sword' ? 1.0 : 0.7;
    const pw = preview.width * previewScale;
    const ph = preview.height * previewScale;
    ctx.drawImage(preview, 50, boxY + (boxH - ph) / 2, pw, ph);

    const textX = 50 + pw + 15;
    ctx.fillStyle = rColor;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(item.rarity.toUpperCase(), textX, boxY + 25);

    ctx.fillStyle = '#ffffff';
    ctx.font = '15px monospace';
    ctx.fillText(item.label, textX, boxY + 45);

    if (item.slot === 'sword') {
      ctx.fillStyle = '#666677';
      ctx.font = '11px monospace';
      ctx.fillText('Sword color', textX, boxY + 62);
    } else if (item.slot === 'cape') {
      ctx.fillStyle = '#666677';
      ctx.font = '11px monospace';
      ctx.fillText('Cape + Hood', textX, boxY + 62);
    } else if (item.slot === 'set') {
      ctx.fillStyle = '#666677';
      ctx.font = '11px monospace';
      ctx.fillText('Full outfit set', textX, boxY + 62);
    } else {
      ctx.fillStyle = '#666677';
      ctx.font = '11px monospace';
      ctx.fillText('Full reskin', textX, boxY + 62);
    }

    if (this.result.duplicate) {
      ctx.fillStyle = '#888888';
      ctx.font = '11px monospace';
      ctx.fillText('Already owned! +' + GACHA_DUPE_REFUND + ' coins', textX, boxY + 80);
    } else {
      ctx.fillStyle = '#44cc44';
      ctx.font = '11px monospace';
      ctx.fillText('NEW!', textX, boxY + 80);
    }

    // equip button on result card
    const isEquipped = Object.values(this.storage.equipped).includes(item.id);
    const eqLabel = isEquipped ? 'Remove' : 'Equip';
    const eqColor = isEquipped ? '#ff6644' : '#44cc44';
    ui.drawButton(ctx, 'equip_' + item.id, eqLabel, W - 75, boxY + boxH - 15, {
      size: 13, color: eqColor,
    });
  }

  drawHistory(ctx, ui, startY) {
    if (this.history.length === 0) {
      ctx.fillStyle = '#555566';
      ctx.font = '13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('No pulls yet!', W / 2, startY + 30);
      return;
    }

    const rowH = 28;
    const maxVisible = 9;
    const inventory = this.storage.inventory;
    const equipped = this.storage.equipped;
    const visible = this.history.slice(this.scroll, this.scroll + maxVisible);

    visible.forEach((entry, i) => {
      const y = startY + i * rowH;
      const item = entry.item;
      const rColor = RARITY_COLORS[item.rarity];
      const isEquipped = Object.values(equipped).includes(item.id);

      ctx.fillStyle = rColor;
      ctx.beginPath();
      ctx.arc(40, y + 4, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = entry.duplicate ? '#666666' : '#ccccdd';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(item.label, 52, y + 8);

      if (entry.duplicate) {
        ctx.fillStyle = '#555555';
        ctx.font = '10px monospace';
        ctx.fillText('(dupe)', 200, y + 8);
      }

      if (inventory.includes(item.id)) {
        const btnText = isEquipped ? 'Rem' : 'Eq';
        ui.drawButton(ctx, 'equip_' + item.id, btnText, W - 45, y + 8, {
          size: 11,
          color: isEquipped ? '#ff6644' : '#44cc44',
        });
      }
    });
  }

  drawCollection(ctx, ui, startY) {
    const inventory = this.storage.inventory;
    const equipped = this.storage.equipped;

    const cols = 5;
    const cellW = 60;
    const cellH = 70;
    const gridX = (W - cols * cellW) / 2;
    const maxRows = 4;
    const startIdx = this.scroll * cols;
    const visible = GACHA_POOL.slice(startIdx, startIdx + cols * maxRows);

    visible.forEach((item, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = gridX + col * cellW + cellW / 2;
      const cy = startY + row * cellH;
      const owned = inventory.includes(item.id);
      const isEquipped = Object.values(equipped).includes(item.id);
      const rColor = RARITY_COLORS[item.rarity];

      // cell background
      ctx.fillStyle = isEquipped ? 'rgba(255, 200, 50, 0.1)' : 'rgba(30, 25, 50, 0.5)';
      ctx.fillRect(cx - cellW / 2 + 3, cy, cellW - 6, cellH - 6);
      ctx.strokeStyle = isEquipped ? '#ffcc44' : (owned ? rColor : '#222233');
      ctx.lineWidth = isEquipped ? 2 : 1;
      ctx.strokeRect(cx - cellW / 2 + 3, cy, cellW - 6, cellH - 6);

      // preview
      const preview = this.getPreview(item);
      const scale = item.slot === 'sword' ? 0.6 : 0.4;
      const pw = preview.width * scale;
      const ph = preview.height * scale;

      if (owned) {
        ctx.drawImage(preview, cx - pw / 2, cy + 5, pw, ph);
      } else {
        // dark shadow silhouette
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.drawImage(preview, cx - pw / 2, cy + 5, pw, ph);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#333344';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('?', cx, cy + 25);
        ctx.restore();
      }

      // rarity dot
      ctx.fillStyle = rColor;
      ctx.beginPath();
      ctx.arc(cx, cy + cellH - 14, 3, 0, Math.PI * 2);
      ctx.fill();

      // equip button / indicator
      if (owned) {
        const btnLabel = isEquipped ? 'REM' : 'EQ';
        const btnColor = isEquipped ? '#ff6644' : '#44cc44';
        ui.drawButton(ctx, 'equip_' + item.id, btnLabel, cx, cy + cellH - 10, {
          size: 9,
          color: btnColor,
        });
      }
    });

    // collection count
    const ownedCount = GACHA_POOL.filter(i => inventory.includes(i.id)).length;
    ctx.fillStyle = '#555566';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(ownedCount + ' / ' + GACHA_POOL.length + ' collected', W / 2, startY + maxRows * cellH + 8);
  }
}
