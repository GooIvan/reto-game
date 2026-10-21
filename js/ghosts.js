import { TILE_SIZE, GHOST_SPEED, GHOST_CONFIGS, DIRECTIONS, POINTS } from './config.js';
import { state } from './state.js';
import { pacman } from './pacman.js';
import { canMoveTile, getEntity } from './map.js';
import { playSound } from './audio.js';
import { updateScoreboard } from './ui.js';
import { distance } from './utils.js';

const CATCH_DISTANCE = TILE_SIZE - 5;

const tileCenter = tile => tile * TILE_SIZE + TILE_SIZE / 2;

// Coloca al fantasma, quieto, en el centro de su tile de inicio
function placeAtStart(ghost) {
  ghost.tileX = ghost.startTileX;
  ghost.tileY = ghost.startTileY;
  ghost.x = tileCenter(ghost.tileX);
  ghost.y = tileCenter(ghost.tileY);
  ghost.isMoving = false;
}

export function createGhosts() {
  return GHOST_CONFIGS.flatMap(config => {
    const obj = getEntity(config.name);
    if (!obj) return [];

    const ghost = {
      startTileX: Math.floor(obj.x / TILE_SIZE),
      startTileY: Math.floor(obj.y / TILE_SIZE),
      dir: { x: 1, y: 0 },
      color: config.color,
      behavior: config.behavior,
      speed: GHOST_SPEED
    };
    placeAtStart(ghost);
    return [ghost];
  });
}

export function resetGhosts() {
  state.ghosts.forEach(placeAtStart);
}

// === COMPORTAMIENTOS: cada uno devuelve el punto objetivo del fantasma ===
const TARGETS = {
  // 👻 ROJO (Blinky): persigue directamente a Pac-Man
  chase: () => ({ x: pacman.x, y: pacman.y }),

  // 💖 ROSA (Pinky): anticipa 4 tiles adelante de Pac-Man
  ambush: () => ({
    x: pacman.x + pacman.dir.x * 4 * TILE_SIZE,
    y: pacman.y + pacman.dir.y * 4 * TILE_SIZE
  }),

  // 💙 AZUL (Inky): flanquea usando la posición del fantasma rojo
  patrol: () => {
    const red = state.ghosts.find(g => g.behavior === 'chase');

    if (red) {
      // Vector desde el rojo hacia 2 tiles adelante de Pac-Man, duplicado
      const aheadX = pacman.x + pacman.dir.x * 2 * TILE_SIZE;
      const aheadY = pacman.y + pacman.dir.y * 2 * TILE_SIZE;
      return {
        x: aheadX + (aheadX - red.x),
        y: aheadY + (aheadY - red.y)
      };
    }

    // Si no hay fantasma rojo, patrullar esquinas
    const { width, height } = state.mapData;
    const corners = [
      { x: TILE_SIZE * 2, y: TILE_SIZE * 2 },
      { x: TILE_SIZE * (width - 3), y: TILE_SIZE * 2 },
      { x: TILE_SIZE * 2, y: TILE_SIZE * (height - 3) },
      { x: TILE_SIZE * (width - 3), y: TILE_SIZE * (height - 3) }
    ];
    return corners[Math.floor(Date.now() / 5000) % corners.length];
  },

  // 🧡 NARANJA (Clyde): persigue si está lejos (>8 tiles), huye a su esquina si está cerca
  random: ghost => {
    if (distance(pacman.x, pacman.y, ghost.x, ghost.y) > 8 * TILE_SIZE) {
      return { x: pacman.x, y: pacman.y };
    }
    return { x: TILE_SIZE * 2, y: TILE_SIZE * (state.mapData.height - 3) };
  }
};

function isReverse(dir, current) {
  return (dir.x === -current.x && current.x !== 0) ||
         (dir.y === -current.y && current.y !== 0);
}

// Salidas del tile actual: sin pared y sin retroceder
// (solo se permite retroceder si no hay otra salida)
function getCandidates(ghost) {
  const open = DIRECTIONS.filter(dir => canMoveTile(ghost.tileX + dir.x, ghost.tileY + dir.y));
  const forward = open.filter(dir => !isReverse(dir, ghost.dir));
  return forward.length > 0 ? forward : open;
}

// Dirección cuyo siguiente tile queda más cerca del objetivo (o más lejos, si huye)
function pickDirection(ghost, candidates, target, flee) {
  let bestDirection = candidates[0];
  let bestScore = Infinity;

  candidates.forEach(dir => {
    const dist = distance(
      target.x, target.y,
      ghost.x + dir.x * TILE_SIZE, ghost.y + dir.y * TILE_SIZE
    );
    const score = flee ? -dist : dist;
    if (score < bestScore) {
      bestScore = score;
      bestDirection = dir;
    }
  });

  return bestDirection;
}

// Se decide al llegar al centro de cada tile
function chooseDirection(ghost) {
  const candidates = getCandidates(ghost);
  if (candidates.length === 0) return null;

  // MODO ASUSTADO: huir de Pac-Man
  if (state.powerMode) return pickDirection(ghost, candidates, pacman, true);

  const getTarget = TARGETS[ghost.behavior];
  if (!getTarget) return candidates[0];
  return pickDirection(ghost, candidates, getTarget(ghost), false);
}

// Teletransporte por los portales de los bordes
function wrapAroundPortals(ghost) {
  const { width } = state.mapData;

  if (ghost.tileX < 0) ghost.tileX = width - 1;
  else if (ghost.tileX >= width) ghost.tileX = 0;
  else return;

  ghost.x = tileCenter(ghost.tileX);
}

// Avanza por la grilla: siempre de centro a centro de tile, sin salirse del carril.
// Si sobra movimiento al llegar a un tile, se aprovecha en el siguiente tramo.
function moveGhost(ghost) {
  let remaining = ghost.speed;

  while (remaining > 0) {
    if (!ghost.isMoving) {
      const dir = chooseDirection(ghost);
      if (!dir) return;
      ghost.dir = dir;
      ghost.isMoving = true;
    }

    const targetX = tileCenter(ghost.tileX + ghost.dir.x);
    const targetY = tileCenter(ghost.tileY + ghost.dir.y);
    const toTarget = Math.abs(targetX - ghost.x) + Math.abs(targetY - ghost.y);

    if (remaining < toTarget) {
      ghost.x += ghost.dir.x * remaining;
      ghost.y += ghost.dir.y * remaining;
      return;
    }

    // Llegó al centro del siguiente tile
    remaining -= toTarget;
    ghost.x = targetX;
    ghost.y = targetY;
    ghost.tileX += ghost.dir.x;
    ghost.tileY += ghost.dir.y;
    ghost.isMoving = false;
    wrapAroundPortals(ghost);
  }
}

function eatGhost(ghost) {
  state.score += POINTS.ghost;
  placeAtStart(ghost);
  playSound('comer');
  updateScoreboard();
}

// onCatch se llama cuando un fantasma atrapa a Pac-Man (fuera del modo poder)
export function updateGhosts(onCatch) {
  if (state.gameOver || state.victory) return;

  state.ghosts.forEach(ghost => {
    moveGhost(ghost);

    // Colisión con Pac-Man
    if (distance(pacman.x, pacman.y, ghost.x, ghost.y) < CATCH_DISTANCE) {
      if (state.powerMode) {
        eatGhost(ghost);
      } else {
        onCatch();
      }
    }
  });
}
