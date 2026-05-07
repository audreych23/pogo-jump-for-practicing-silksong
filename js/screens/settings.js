import { W, H } from '../config.js';

export class SettingsScreen {
  constructor(storage) {
    this.storage = storage;
    this.editing = false;
    this.name = storage.playerName;
    this.cursorBlink = 0;
  }

  handleKey(e) {
    if (!this.editing) return;
    if (e.code === 'Enter' || e.code === 'Escape') {
      this.editing = false;
      this.storage.playerName = this.name;
      return;
    }
    if (e.code === 'Backspace') {
      this.name = this.name.slice(0, -1);
      e.preventDefault();
      return;
    }
    if (e.key.length === 1 && this.name.length < 12) {
      this.name += e.key;
      e.preventDefault();
    }
  }

  handleClick(ui, mx, my) {
    const clicked = ui.getClicked(mx, my);
    if (clicked === 'name_field') {
      this.editing = true;
      this.cursorBlink = 0;
    } else if (clicked === 'back') {
      if (this.editing) {
        this.editing = false;
        this.storage.playerName = this.name;
      }
      return 'title';
    } else {
      if (this.editing) {
        this.editing = false;
        this.storage.playerName = this.name;
      }
    }
    return null;
  }

  draw(ctx, ui) {
    ui.clearButtons();
    ui.drawScreenTitle(ctx, 'SETTINGS');
    this.cursorBlink++;

    // name field
    ctx.fillStyle = '#8888aa';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Player Name', W / 2, 120);

    // text field box
    const fieldW = 200;
    const fieldH = 36;
    const fieldX = W / 2 - fieldW / 2;
    const fieldY = 135;
    ctx.strokeStyle = this.editing ? '#ffcc44' : '#555577';
    ctx.lineWidth = 2;
    ctx.strokeRect(fieldX, fieldY, fieldW, fieldH);
    ctx.fillStyle = '#111122';
    ctx.fillRect(fieldX + 1, fieldY + 1, fieldW - 2, fieldH - 2);

    // name text
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px monospace';
    ctx.textAlign = 'left';
    let displayName = this.name;
    if (this.editing && Math.floor(this.cursorBlink / 20) % 2 === 0) {
      displayName += '_';
    }
    ctx.fillText(displayName, fieldX + 10, fieldY + 24);

    // clickable area for the field
    ui.buttons.push({ id: 'name_field', x: fieldX, y: fieldY, w: fieldW, h: fieldH });

    // hint
    ctx.fillStyle = '#555566';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Click to edit, Enter to save', W / 2, fieldY + fieldH + 20);

    ui.drawBackButton(ctx, false);
  }
}
