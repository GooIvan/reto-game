import { TILE_SIZE } from './config.js';
import { state } from './state.js';

export async function loadMap() {
  const res = await fetch('assets/map.json');
  state.mapData = await res.json();
  state.walls = state.mapData.layers.find(l => l.name === 'walls').data;
}

// Objeto de la capa 'entities' (pacman_start, ghost_red, ...)
export function getEntity(name) {
  const layer = state.mapData.layers.find(l => l.name === 'entities');
  return layer?.objects.find(o => o.name === name);
}

// Genera los dots desde la capa de paredes: 2 = dot, 3 = power pellet
export function buildDots() {
  const { width, height } = state.mapData;
  const dots = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const tileValue = state.walls[y * width + x];
      if (tileValue !== 2 && tileValue !== 3) continue;

      dots.push({
        x: x * TILE_SIZE + TILE_SIZE / 2,
        y: y * TILE_SIZE + TILE_SIZE / 2,
        collected: false,
        isPower: tileValue === 3
      });
    }
  }

  return dots;
}

// Puede moverse si es 0 (vacío), 2 (dot) o 3 (power pellet)
export function canMoveTile(tileX, tileY) {
  const { width, height } = state.mapData;

  // Permitir salir de los límites (para túneles)
  if (tileX < 0 || tileX >= width) return true;
  if (tileY < 0 || tileY >= height) return false;

  return state.walls[tileY * width + tileX] !== 1;
}
