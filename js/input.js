export class InputManager {
  constructor(canvas, scale) {
    this.keys = {};
    this.mouseDown = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.scale = scale;
    this.canvas = canvas;
    this.onClick = null;
    this.onKey = null;

    window.addEventListener('keydown', e => {
      if (!this.keys[e.code]) this.keys[e.code] = true;
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      if (this.onKey) this.onKey(e);
    });

    window.addEventListener('keyup', e => {
      this.keys[e.code] = false;
    });

    canvas.addEventListener('mousedown', e => {
      e.preventDefault();
      this.mouseDown = true;
      const rect = canvas.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left) / this.scale;
      this.mouseY = (e.clientY - rect.top) / this.scale;
      if (this.onClick) this.onClick(this.mouseX, this.mouseY);
    });

    canvas.addEventListener('mouseup', () => {
      this.mouseDown = false;
    });

    canvas.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      this.mouseX = (e.clientX - rect.left) / this.scale;
      this.mouseY = (e.clientY - rect.top) / this.scale;
    });

    canvas.addEventListener('contextmenu', e => e.preventDefault());
  }

  get wantLeft() { return this.keys['KeyA'] || this.keys['ArrowLeft']; }
  get wantRight() { return this.keys['KeyD'] || this.keys['ArrowRight']; }
  get wantJump() { return this.keys['Space']; }
  get wantPogo() { return (this.keys['KeyS'] || this.keys['ArrowDown']) && this.mouseDown; }
}
