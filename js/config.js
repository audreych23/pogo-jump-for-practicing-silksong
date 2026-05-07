export const W = 400;
export const H = 600;

export const GRAVITY = 0.15;
export const DIVE_GRAVITY = 0.30;
export const JUMP_POWER = -5.5;
export const JUMP_CUT_VEL = -2.0;
export const POGO_BOUNCE_VY = -5.5;
export const GROUND_SPEED = 3.0;
export const AIR_DRIFT_ACCEL = 0.15;
export const AIR_DRIFT_MAX = 1.8;
export const POGO_DRIFT_ACCEL = 0.45;
export const POGO_DRIFT_MAX = 2.5;
export const DIVE_H_ACCEL = 0.35;
export const DIVE_H_MAX = 4.0;
export const AIR_FRICTION = 0.93;
export const DIVE_DURATION = 22;
export const PLAYER_W = 20;
export const PLAYER_H = 26;
export const BALL_RADIUS = 18;
export const MAX_FALL_SPEED = 4;
export const MAX_DIVE_SPEED = 6;
export const POGO_HITBOX_OFFSET_X = 12;
export const POGO_HITBOX_OFFSET_Y = 16;
export const POGO_HITBOX_R = 15;
export const BALL_SPACING = 70;
export const COIN_CHANCE = 0.05;
export const SPRITE_SCALE = 3;

export const GACHA_COST = 10;
export const GACHA_DUPE_REFUND = 3;

export const GACHA_POOL = [
  // Common (60%) — sword/trail colors
  { id: 'common_sword_red', rarity: 'common', slot: 'sword', label: 'Red Blade', colors: { S: '#ff4444', T: '#ff8888', L: '#ffaaaa' } },
  { id: 'common_sword_blue', rarity: 'common', slot: 'sword', label: 'Blue Blade', colors: { S: '#4488ff', T: '#88aaff', L: '#aaccff' } },
  { id: 'common_sword_green', rarity: 'common', slot: 'sword', label: 'Green Blade', colors: { S: '#44cc44', T: '#88ee88', L: '#aaffaa' } },
  { id: 'common_sword_purple', rarity: 'common', slot: 'sword', label: 'Purple Blade', colors: { S: '#aa44ff', T: '#cc88ff', L: '#ddaaff' } },
  { id: 'common_sword_orange', rarity: 'common', slot: 'sword', label: 'Orange Blade', colors: { S: '#ff8800', T: '#ffaa44', L: '#ffcc88' } },
  { id: 'common_sword_pink', rarity: 'common', slot: 'sword', label: 'Pink Blade', colors: { S: '#ff66aa', T: '#ff99cc', L: '#ffbbdd' } },
  { id: 'common_sword_cyan', rarity: 'common', slot: 'sword', label: 'Cyan Blade', colors: { S: '#44dddd', T: '#88eeff', L: '#aaffff' } },
  { id: 'common_sword_gold', rarity: 'common', slot: 'sword', label: 'Gold Blade', colors: { S: '#ddaa00', T: '#ffcc44', L: '#ffdd88' } },

  // Rare (25%) — cape + hood colors
  { id: 'rare_cape_red', rarity: 'rare', slot: 'cape', label: 'Crimson Cape', colors: { G: '#cc4444', H: '#cc4444' } },
  { id: 'rare_cape_blue', rarity: 'rare', slot: 'cape', label: 'Ocean Cape', colors: { G: '#4466cc', H: '#4466cc' } },
  { id: 'rare_cape_green', rarity: 'rare', slot: 'cape', label: 'Forest Cape', colors: { G: '#44aa44', H: '#44aa44' } },
  { id: 'rare_cape_purple', rarity: 'rare', slot: 'cape', label: 'Royal Cape', colors: { G: '#8844cc', H: '#8844cc' } },
  { id: 'rare_cape_white', rarity: 'rare', slot: 'cape', label: 'Snow Cape', colors: { G: '#ddddee', H: '#ddddee' } },
  { id: 'rare_cape_dark', rarity: 'rare', slot: 'cape', label: 'Shadow Cape', colors: { G: '#334455', H: '#334455' } },

  // Epic (10%) — cape + hood + sword combos
  { id: 'epic_inferno', rarity: 'epic', slot: 'set', label: 'Inferno Set', colors: { G: '#cc3300', H: '#cc3300', S: '#ff6600', T: '#ff9944', L: '#ffbb77' } },
  { id: 'epic_ocean', rarity: 'epic', slot: 'set', label: 'Ocean Set', colors: { G: '#2255aa', H: '#2255aa', S: '#44aadd', T: '#77ccee', L: '#aaddff' } },
  { id: 'epic_forest', rarity: 'epic', slot: 'set', label: 'Forest Set', colors: { G: '#226622', H: '#226622', S: '#44bb44', T: '#77dd77', L: '#aaffaa' } },
  { id: 'epic_shadow', rarity: 'epic', slot: 'set', label: 'Shadow Set', colors: { G: '#222233', H: '#222233', S: '#6644aa', T: '#8866cc', L: '#aa88ee' } },

  // Legendary (3%) — full reskins including body
  { id: 'legend_golden', rarity: 'legendary', slot: 'full', label: 'Golden Knight', colors: { W: '#ffdd44', G: '#ddaa00', H: '#ddaa00', S: '#ffcc00', T: '#ffee66', L: '#ffffaa' } },
  { id: 'legend_ghost', rarity: 'legendary', slot: 'full', label: 'Ghost Knight', colors: { W: '#aaccff', G: '#ddeeff', H: '#ddeeff', S: '#ffffff', T: '#eeeeff', L: '#ffffff' } },
  { id: 'legend_void', rarity: 'legendary', slot: 'full', label: 'Void Knight', colors: { W: '#6633aa', G: '#221133', H: '#221133', S: '#aa44ff', T: '#cc66ff', L: '#ee88ff' } },

  // Mythical (2%) — two-tone mixed colors, full reskin
  { id: 'myth_eclipse', rarity: 'mythical', slot: 'full', label: 'Eclipse', colors: { W: '#1a1a2e', G: '#ffaa00', H: '#ffaa00', S: '#000000', T: '#ffcc44', L: '#ffee88', D: '#ffaa00', B: '#ffcc44' } },
  { id: 'myth_frostfire', rarity: 'mythical', slot: 'full', label: 'Frostfire', colors: { W: '#aaddff', G: '#ff4422', H: '#ff4422', S: '#44ccff', T: '#ff8844', L: '#aaeeff', D: '#cc2200' } },
  { id: 'myth_prismatic', rarity: 'mythical', slot: 'full', label: 'Prismatic', colors: { W: '#ff88cc', G: '#44ddaa', H: '#44ddaa', S: '#ffaa44', T: '#88aaff', L: '#ddff88', D: '#aa66ff' } },
];

export const RARITY_COLORS = {
  common: '#aaaaaa',
  rare: '#4488ff',
  epic: '#aa44ff',
  legendary: '#ffaa00',
  mythical: '#ff4488',
};
