import { TILE_SIZE, PACMAN_SPEED, POWER_MODE_DURATION, POINTS } from './config.js';
import { state } from './state.js';
import { canMoveTile, getEntity } from './map.js';
import { playSound, stopMusic } from './audio.js';
import { updateScoreboard } from './ui.js';
import { distance } from './utils.js';

export const pacman = {
  x: 0,
  y: 0,
  tileX: 0, // Posición en la grilla
  tileY: 0, // Posición en la grilla
  dir: { x: 0, y: 0 },
  nextDir: { x: 0, y: 0 },
  speed: PACMAN_SPEED,
  mouthOpen: 0,
  radius: TILE_SIZE / 2 - 4,
  collisionRadius: 8, // Radio más pequeño para colisiones
  isMoving: false // Si está en movimiento entre tiles
};

// Vuelve a la posición inicial y se detiene
export function resetPacman() {
  const start = getEntity('pacman_start');
  if (start) {
    // Un cuadro a la izquierda del punto marcado en el mapa
    pacman.x = start.x - TILE_SIZE;
    pacman.y = start.y;
  } else {
    // Si no hay posición inicial, ponerlo en un espacio vacío
    pacman.x = TILE_SIZE * 1.5;
    pacman.y = TILE_SIZE * 1.5;
  }
  pacman.dir = { x: 0, y: 0 };
  pacman.nextDir = { x: 0, y: 0 };
  pacman.isMoving = false;
}

// Estando quieto en el centro de un tile, decide hacia dónde arrancar
function startMove() {
  pacman.tileX = Math.floor(pacman.x / TILE_SIZE);
  pacman.tileY = Math.floor(pacman.y / TILE_SIZE);

  // Centrar en el tile
  pacman.x = pacman.tileX * TILE_SIZE + TILE_SIZE / 2;
  pacman.y = pacman.tileY * TILE_SIZE + TILE_SIZE / 2;

  const { dir, nextDir } = pacman;

  // Intentar cambiar de dirección si hay una nueva dirección solicitada
  if (nextDir.x !== 0 || nextDir.y !== 0) {
    if (canMoveTile(pacman.tileX + nextDir.x, pacman.tileY + nextDir.y)) {
      pacman.dir = { ...nextDir };
      pacman.nextDir = { x: 0, y: 0 };
      pacman.isMoving = true;
    }
  }
  // Si no hay nueva dirección, continuar en la dirección actual
  else if (dir.x !== 0 || dir.y !== 0) {
    if (canMoveTile(pacman.tileX + dir.x, pacman.tileY + dir.y)) {
      pacman.isMoving = true;
    } else {
      // Detener si no puede continuar
      pacman.dir = { x: 0, y: 0 };
    }
  }
}

// Avanza hacia el centro del siguiente tile
function advance() {
  const targetX = (pacman.tileX + pacman.dir.x) * TILE_SIZE + TILE_SIZE / 2;
  const targetY = (pacman.tileY + pacman.dir.y) * TILE_SIZE + TILE_SIZE / 2;

  const dx = targetX - pacman.x;
  const dy = targetY - pacman.y;
  const dist = distance(targetX, targetY, pacman.x, pacman.y);

  if (dist > pacman.speed) {
    // Continuar moviéndose
    pacman.x += (dx / dist) * pacman.speed;
    pacman.y += (dy / dist) * pacman.speed;
    return;
  }

  // Llegó al siguiente tile
  pacman.x = targetX;
  pacman.y = targetY;
  pacman.isMoving = false;
  pacman.tileX += pacman.dir.x;
  pacman.tileY += pacman.dir.y;

  // Portales (teletransporte entre los bordes del mapa)
  const { width } = state.mapData;
  if (pacman.tileX < 0) {
    pacman.tileX = width - 1; // Aparecer en el lado derecho
    pacman.x = pacman.tileX * TILE_SIZE + TILE_SIZE / 2;
    console.log('🌀 Portal Izquierdo → Derecho');
  } else if (pacman.tileX >= width) {
    pacman.tileX = 1; // Aparecer en el lado izquierdo
    pacman.x = pacman.tileX * TILE_SIZE + TILE_SIZE / 2;
    console.log('🌀 Portal Derecho → Izquierdo');
  }
}

function collectDots() {
  state.dots.forEach(dot => {
    if (dot.collected) return;
    if (distance(pacman.x, pacman.y, dot.x, dot.y) >= TILE_SIZE / 2) return;

    dot.collected = true;

    if (dot.isPower) {
      // Power Pellet: activa el modo poder
      state.score += POINTS.power;
      state.powerMode = true;
      state.powerModeTimer = POWER_MODE_DURATION;
      playSound('powerUp');
    } else {
      state.score += POINTS.dot;
      playSound('comer');
    }

    updateScoreboard();
  });
}

function checkVictory() {
  if (!state.dots.every(d => d.collected)) return;

  state.victory = true;
  stopMusic();
  playSound('inicio'); // Sonido de victoria
}

function tickPowerMode() {
  if (!state.powerMode) return;

  state.powerModeTimer--;
  if (state.powerModeTimer <= 0) {
    state.powerMode = false;
  }
}

export function updatePacman() {
  if (state.gameOver || state.victory) return;

  if (!pacman.isMoving) startMove();
  if (pacman.isMoving) advance();

  // Animación de boca
  pacman.mouthOpen = (pacman.mouthOpen + 0.1) % 1;

  collectDots();
  checkVictory();
  tickPowerMode();
}
