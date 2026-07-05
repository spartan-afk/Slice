// ─── World ───────────────────────────────────────────────────────────────────
export const WORLD_WIDTH  = 3200;
export const WORLD_HEIGHT = 800;
export const GAME_WIDTH   = 960;
export const GAME_HEIGHT  = 540;

// ─── Physics ─────────────────────────────────────────────────────────────────
export const GRAVITY = 900;

// ─── Player ──────────────────────────────────────────────────────────────────
export const PLAYER_HP            = 5;
export const PLAYER_SPEED         = 220;
export const PLAYER_JUMP_VEL      = -600;
export const PLAYER_ATTACK_CD     = 600;   // ms
export const PLAYER_ATTACK_DUR    = 200;   // ms — hitbox lifetime
export const PLAYER_IFRAMES       = 800;   // ms — invincibility after hit
export const PLAYER_SCALE         = 0.9;
export const PLAYER_SPAWN_X       = 120;
export const PLAYER_SPAWN_Y       = 640;

// ─── Enemy ───────────────────────────────────────────────────────────────────
export const ENEMY_HP             = 3;
export const ENEMY_PATROL_SPEED   = 80;
export const ENEMY_AGGRO_SPEED    = 140;
export const ENEMY_DETECT_RADIUS  = 240;
export const ENEMY_DEAGGRO_MULT   = 1.6;  // de-aggro at radius × mult
export const ENEMY_ATTACK_RANGE   = 70;   // px
export const ENEMY_ATTACK_CD      = 1200; // ms
export const ENEMY_CONTACT_DMG    = 1;
export const ENEMY_PATROL_HALF    = 130;  // ±px from spawn X
export const ENEMY_SCALE          = 0.9;

// ─── Sprite sheet frame sizes ─────────────────────────────────────────────────
export const FRAME_W = 100;
export const FRAME_H = 100;

// ─── Enemy spawn points [x, y] ────────────────────────────────────────────────
export const ENEMY_SPAWNS: [number, number][] = [
  [860,  680],
  [1620, 400],
  [2450, 400],
];
