import { W, H } from './config.js';
import { StorageManager } from './storage.js';
import { InputManager } from './input.js';
import { SpriteManager } from './sprites.js';
import { ParticleSystem } from './particles.js';
import { Camera } from './camera.js';
import { UIManager } from './ui.js';
import { Player } from './player.js';
import { BallManager } from './balls.js';
import { TitleScreen } from './screens/title.js';
import { GameScreen } from './screens/game.js';
import { DeathScreen } from './screens/death.js';
import { SettingsScreen } from './screens/settings.js';
import { LeaderboardScreen } from './screens/leaderboard.js';
import { GachaScreen } from './screens/gacha.js';
import { Background } from './background.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const SCALE = Math.min(window.innerWidth / W, window.innerHeight / H, 2);
canvas.width = W;
canvas.height = H;
canvas.style.width = (W * SCALE) + 'px';
canvas.style.height = (H * SCALE) + 'px';

const storage = new StorageManager();
const input = new InputManager(canvas, SCALE);
const sprites = new SpriteManager(storage);
const particles = new ParticleSystem();
const camera = new Camera();
const ui = new UIManager();
const bg = new Background();
const player = new Player();
const balls = new BallManager();

const titleScreen = new TitleScreen(sprites);
const gameScreen = new GameScreen();
const deathScreen = new DeathScreen();
const settingsScreen = new SettingsScreen(storage);
const leaderboardScreen = new LeaderboardScreen(storage);
const gachaScreen = new GachaScreen(storage, sprites);

let state = 'title';
let score = 0;
let isNewBest = false;

function startGame() {
  state = 'play';
  score = 0;
  isNewBest = false;
  player.reset();
  balls.spawnInitial();
  particles.clear();
  camera.reset();
  gameScreen.reset();
}

function handleDeath() {
  state = 'dead';
  deathScreen.reset();
  const hs = storage.highScore;
  if (score > hs) {
    storage.highScore = score;
    isNewBest = true;
  }
  storage.addScore(storage.playerName, score);
}

function goToTitle() {
  state = 'title';
}

// input routing
input.onKey = (e) => {
  if (state === 'title') {
    titleScreen.handleKey(e, sel => {
      if (sel === 'play') startGame();
      else state = sel;
    });
  } else if (state === 'dead' && deathScreen.canContinue) {
    if (e.code === 'Space' || e.code === 'Enter') goToTitle();
  } else if (state === 'settings') {
    settingsScreen.handleKey(e);
    if (e.code === 'Escape' && !settingsScreen.editing) goToTitle();
  } else if (state === 'leaderboard') {
    if (e.code === 'Escape') goToTitle();
  } else if (state === 'gacha') {
    if (e.code === 'Escape') goToTitle();
    gachaScreen.handleKey(e);
  }
};

input.onClick = (mx, my) => {
  if (state === 'title') {
    titleScreen.handleClick(ui, mx, my, sel => {
      if (sel === 'play') startGame();
      else state = sel;
    });
  } else if (state === 'dead' && deathScreen.canContinue) {
    goToTitle();
  } else if (state === 'settings') {
    const nav = settingsScreen.handleClick(ui, mx, my);
    if (nav) state = nav;
  } else if (state === 'leaderboard') {
    const nav = leaderboardScreen.handleClick(ui, mx, my);
    if (nav) state = nav;
  } else if (state === 'gacha') {
    const nav = gachaScreen.handleClick(ui, mx, my);
    if (nav) state = nav;
  }
};

function update() {
  if (state === 'play') {
    const fc = bg.getFlowerColors(camera.y);
    const result = gameScreen.update(player, balls, particles, camera, input, storage, fc);
    if (result) {
      if (result.scored) score++;
      if (result.died) handleDeath();
    }
  } else if (state === 'dead') {
    deathScreen.update();
  } else if (state === 'gacha') {
    gachaScreen.update();
  }
}

function draw() {
  const isMenu = state !== 'play' && state !== 'dead';
  bg.draw(ctx, camera.y, isMenu);

  if (state === 'title') {
    titleScreen.draw(ctx, ui, storage.highScore, storage.coins, input);
  } else if (state === 'play' || state === 'dead') {
    const flowerColors = bg.getFlowerColors(camera.y);
    gameScreen.draw(ctx, player, balls, particles, sprites, camera, score, storage.coins, flowerColors);
    if (state === 'dead') {
      deathScreen.draw(ctx, score, storage.highScore, isNewBest);
    }
  } else if (state === 'settings') {
    settingsScreen.draw(ctx, ui);
  } else if (state === 'leaderboard') {
    leaderboardScreen.draw(ctx, ui);
  } else if (state === 'gacha') {
    gachaScreen.draw(ctx, ui);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
