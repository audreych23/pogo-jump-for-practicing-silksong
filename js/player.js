import * as C from './config.js';

export class Player {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = C.W / 2;
    this.y = C.H - 60;
    this.vx = 0;
    this.vy = 0;
    this.onGround = true;
    this.pogoing = false;
    this.facing = 1;
    this.jumpLock = false;
    this.spinAngle = 0;
    this.spinSpeed = 0;
    this.bouncing = false;
    this.bounceType = 0;
    this.diveUsed = false;
    this.diveTimer = 0;
    this.impactTimer = 0;
  }

  update(input) {
    const wantLeft = input.wantLeft;
    const wantRight = input.wantRight;
    const wantJump = input.wantJump;
    const wantPogo = input.wantPogo;

    // impact freeze
    if (this.impactTimer > 0) {
      this.impactTimer--;
      this.pogoing = true;
      if (this.impactTimer <= 0) {
        this.pogoing = false;
        this.bouncing = true;
        this.spinAngle = 0;
        this.bounceType = Math.floor(Math.random() * 3);
        if (this.bounceType === 0) this.spinSpeed = 0.35;
        else if (this.bounceType === 1) this.spinSpeed = 0.15;
        else this.spinSpeed = 0;
      }
    }

    // bounce animation
    if (this.bouncing) {
      this.spinAngle += this.spinSpeed * this.facing;
      if (this.vy > 0) {
        this.bouncing = false;
        this.spinAngle = 0;
      }
    }

    // pogo state (one-shot dive)
    if (this.impactTimer <= 0) {
      if (!this.pogoing && !this.onGround && wantPogo && !this.bouncing && !this.diveUsed) {
        this.pogoing = true;
        this.diveTimer = C.DIVE_DURATION;
        if (this.vy < 0) this.vy = 0;
      }
      if (this.pogoing) {
        this.diveTimer--;
        if (this.diveTimer <= 0 || !wantPogo) {
          this.pogoing = false;
          this.diveUsed = true;
        }
      }
    }
    if (this.onGround) {
      this.bouncing = false;
      this.spinAngle = 0;
      this.diveUsed = false;
      this.pogoing = false;
      this.impactTimer = 0;
    }

    // horizontal movement
    if (this.onGround) {
      if (wantLeft) { this.vx = -C.GROUND_SPEED; this.facing = -1; }
      else if (wantRight) { this.vx = C.GROUND_SPEED; this.facing = 1; }
      else { this.vx *= 0.6; }
    } else if (this.pogoing) {
      if (wantLeft) this.facing = -1;
      else if (wantRight) this.facing = 1;
      this.vx += this.facing * C.DIVE_H_ACCEL;
      if (this.vx > C.DIVE_H_MAX) this.vx = C.DIVE_H_MAX;
      if (this.vx < -C.DIVE_H_MAX) this.vx = -C.DIVE_H_MAX;
    } else {
      if (wantLeft) this.vx -= C.AIR_DRIFT_ACCEL;
      else if (wantRight) this.vx += C.AIR_DRIFT_ACCEL;
      else this.vx *= C.AIR_FRICTION;
      if (this.vx > C.AIR_DRIFT_MAX) this.vx = C.AIR_DRIFT_MAX;
      if (this.vx < -C.AIR_DRIFT_MAX) this.vx = -C.AIR_DRIFT_MAX;
    }

    // jump
    if (this.onGround && wantJump && !this.jumpLock) {
      this.vy = C.JUMP_POWER;
      this.onGround = false;
      this.jumpLock = true;
    }
    if (this.jumpLock && !wantJump) {
      if (this.vy < C.JUMP_CUT_VEL) this.vy = C.JUMP_CUT_VEL;
      this.jumpLock = false;
    }
    if (this.onGround) this.jumpLock = false;

    // gravity
    if (this.pogoing && this.vy > 0) {
      this.vy += C.DIVE_GRAVITY;
      if (this.vy > C.MAX_DIVE_SPEED) this.vy = C.MAX_DIVE_SPEED;
    } else {
      this.vy += C.GRAVITY;
      if (this.vy > C.MAX_FALL_SPEED) this.vy = C.MAX_FALL_SPEED;
    }

    // apply velocity
    this.x += this.vx;
    this.y += this.vy;

    // wall wrap
    if (this.x < -C.PLAYER_W / 2) this.x = C.W + C.PLAYER_W / 2;
    if (this.x > C.W + C.PLAYER_W / 2) this.x = -C.PLAYER_W / 2;
  }

  onPogoBounce() {
    this.vy = C.POGO_BOUNCE_VY;
    this.onGround = false;
    this.diveUsed = false;
    this.diveTimer = 0;
    this.impactTimer = 8;
    this.pogoing = true;
    this.bouncing = false;
  }

  draw(ctx, sprites, cameraY) {
    const py = this.y - C.PLAYER_H / 2 - cameraY;

    let sprite = sprites.stand;
    if (this.pogoing) sprite = sprites.pogo;
    else if (!this.onGround) sprite = sprites.jump;

    ctx.save();
    ctx.translate(this.x, py + C.PLAYER_H / 2);

    if (this.bouncing && this.spinSpeed > 0) {
      ctx.rotate(this.spinAngle);
      ctx.drawImage(sprites.jump, -sprites.jump.width / 2, -sprites.jump.height / 2);
    } else if (this.bouncing && this.bounceType === 2) {
      ctx.scale(this.facing, 1);
      ctx.scale(1.2, 0.8);
      ctx.drawImage(sprites.jump, -sprites.jump.width / 2, -sprites.jump.height / 2);
    } else {
      ctx.scale(this.facing, 1);
      ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
    }
    ctx.restore();

    // facing indicator arrow
    if (!this.onGround) {
      ctx.save();
      ctx.globalAlpha = this.pogoing ? 0.9 : 0.2;
      ctx.strokeStyle = this.pogoing ? '#ffcc44' : '#555566';
      ctx.lineWidth = this.pogoing ? 3 : 2;
      const ax = this.x;
      const ay = this.y - cameraY;
      ctx.beginPath();
      ctx.moveTo(ax, ay + 4);
      ctx.lineTo(ax + this.facing * 14, ay + 18);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ax + this.facing * 14, ay + 18);
      ctx.lineTo(ax + this.facing * 10, ay + 13);
      ctx.moveTo(ax + this.facing * 14, ay + 18);
      ctx.lineTo(ax + this.facing * 14 - this.facing * 2, ay + 14);
      ctx.stroke();
      ctx.restore();
    }
  }
}
