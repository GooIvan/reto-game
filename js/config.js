export const TILE_SIZE = 32;

// Pantalla táctil como puntero principal (móviles y tablets)
export const IS_TOUCH = window.matchMedia('(pointer: coarse)').matches;

export const PACMAN_SPEED = 2;
export const GHOST_SPEED = 1.5;
export const POWER_MODE_DURATION = 480; // 8 segundos a 60fps (8 * 60)
export const INITIAL_LIVES = 3;
export const HIGHSCORE_KEY = 'pacman-highscore';
export const AUDIO_SETTINGS_KEY = 'pacman-audio';

export const POINTS = {
  dot: 10,
  power: 50,
  ghost: 200
};

export const DIRECTIONS = Object.freeze([
  Object.freeze({ x: 0, y: -1 }),
  Object.freeze({ x: 0, y: 1 }),
  Object.freeze({ x: -1, y: 0 }),
  Object.freeze({ x: 1, y: 0 })
]);

export const GHOST_CONFIGS = [
  { name: 'ghost_red', color: '#ff0000', behavior: 'chase' },
  { name: 'ghost_pink', color: '#ffb8ff', behavior: 'ambush' },
  { name: 'ghost_blue', color: '#00ffff', behavior: 'patrol' },
  { name: 'ghost_orange', color: '#ffb851', behavior: 'random' }
];
