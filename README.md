# Pogo Jump

A browser-based 8-bit game inspired by the pogo jumping mechanic from Hollow Knight: Silksong.

## How to Play

Jump off the starting platform, then dive diagonally onto orbs to bounce upward. Chain pogo bounces to climb higher — miss one and you fall to your death.

### Controls

| Key | Action |
|-----|--------|
| **A / D** | Move left / right |
| **Space** | Jump (hold for higher) |
| **S + Left Click** | Pogo dive (while airborne) |
| **A / D during pogo** | Change facing direction |

The pogo dive is a one-shot — you get one diagonal dive per bounce. Facing direction only changes during the dive, so commit to your direction wisely.

## Features

- **Pogo mechanics** — diagonal dive attack, bounce animations (random somersault/pirouette/splay), impact freeze
- **Coins** — gold coins spawn randomly (5% chance), collect them for the gacha
- **Gacha system** — spend coins to pull cosmetic items across 5 rarities (Common, Rare, Epic, Legendary, Mythical)
- **Cosmetics** — sword colors, cape/hood colors, full character reskins that change your in-game sprite
- **Leaderboard** — local top 10 scores with player name
- **Settings** — customizable player name
- **Parallax starfield** — twinkling pixel art background

## Running

ES modules require a local server. Any of these work:

```bash
# Python (built into most systems)
python3 -m http.server 8080

# Node.js
npx serve

# Then open http://localhost:8080
```

Or use the **Live Server** extension in VS Code — right-click `index.html` → "Open with Live Server".

## Project Structure

```
index.html                 Entry point (canvas + module loader)
js/
  main.js                  Game loop, state machine
  config.js                Physics constants, gacha item pool
  input.js                 Keyboard + mouse input
  storage.js               localStorage (scores, coins, inventory)
  sprites.js               Pixel art sprites, dynamic recoloring
  ui.js                    Shared UI (buttons, background, hover)
  player.js                Player physics + animation
  balls.js                 Orb/coin spawning + collision
  particles.js             Particle effects
  camera.js                Camera follow
  screens/
    title.js               Title menu
    game.js                Gameplay HUD
    death.js               Game over screen
    settings.js            Player name input
    leaderboard.js         Score display
    gacha.js               Gacha pulls + collection
```

## Tech

Vanilla JavaScript, HTML Canvas, ES Modules. No dependencies, no build step.
