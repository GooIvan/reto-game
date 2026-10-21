import { TILE_SIZE, IS_TOUCH } from './config.js';
import { state } from './state.js';
import { pacman } from './pacman.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const RESTART_HINT = IS_TOUCH ? 'Toca para reiniciar' : 'Presiona ENTER';

let portalImage;
let mazeLayer; // Paredes prerenderizadas (no cambian durante la partida)
let portalTiles = []; // Tiles de portal en los bordes del mapa

// Carga el portal y prepara todo lo que se dibuja igual en cada frame.
// Requiere que el mapa ya esté cargado.
export async function initRenderer() {
  portalImage = new Image();
  portalImage.src = 'assets/portal.png';
  await new Promise(resolve => {
    portalImage.onload = resolve;
  });

  mazeLayer = createMazeLayer(createWallTile());
  portalTiles = findPortalTiles();
}

// Tile de pared (azul neón), generado proceduralmente
function createWallTile() {
  const tile = document.createElement('canvas');
  tile.width = TILE_SIZE;
  tile.height = TILE_SIZE;
  const tileCtx = tile.getContext('2d');

  tileCtx.fillStyle = '#0015ff';
  tileCtx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
  tileCtx.strokeStyle = '#00ccff';
  tileCtx.lineWidth = 2;
  tileCtx.strokeRect(2, 2, TILE_SIZE - 4, TILE_SIZE - 4);

  return tile;
}

function createMazeLayer(wallTile) {
  const { width, height } = state.mapData;
  const layer = document.createElement('canvas');
  layer.width = canvas.width;
  layer.height = canvas.height;
  const layerCtx = layer.getContext('2d');

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (state.walls[y * width + x] === 1) {
        layerCtx.drawImage(wallTile, x * TILE_SIZE, y * TILE_SIZE);
      }
    }
  }

  return layer;
}

// Hay portal en cada fila cuyo borde izquierdo o derecho está vacío (0)
function findPortalTiles() {
  const { width, height } = state.mapData;
  const tiles = [];

  for (let y = 0; y < height; y++) {
    if (state.walls[y * width] === 0) tiles.push({ x: 0, y });
    if (state.walls[y * width + (width - 1)] === 0) tiles.push({ x: width - 1, y });
  }

  return tiles;
}

function drawPortals() {
  if (!portalImage || !portalImage.complete) return;

  const time = Date.now() / 1000;
  const glow = Math.sin(time * 3) * 0.3 + 0.7;

  portalTiles.forEach(({ x, y }) => {
    ctx.drawImage(portalImage, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

    // Efecto de brillo
    ctx.save();
    ctx.globalAlpha = glow * 0.5;
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    ctx.restore();
  });
}

function drawDots() {
  state.dots.forEach(dot => {
    if (dot.collected) return;

    ctx.beginPath();

    if (dot.isPower) {
      // Power Pellet: más grande y con efecto de pulso
      const pulseSize = 8 + Math.sin(Date.now() / 200) * 2;
      ctx.arc(dot.x, dot.y, pulseSize, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ffff00';
      ctx.fill();
      ctx.shadowBlur = 0;
    } else {
      ctx.arc(dot.x, dot.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffb897';
      ctx.fill();
    }
  });
}

function getGhostColor(ghost) {
  if (!state.powerMode) return ghost.color;

  // En modo poder: azul, pero parpadea en los últimos 3 segundos
  const timeRemaining = state.powerModeTimer / 60;
  if (timeRemaining > 3) return '#0000ff';

  const blinkSpeed = 10; // frames por parpadeo
  const shouldBlink = Math.floor(state.powerModeTimer / blinkSpeed) % 2 === 0;
  return shouldBlink ? '#0000ff' : ghost.color;
}

// El sprite ocupa de y=-17 a y=10 respecto a su origen; este desplazamiento
// centra ese rango (-3.5) sobre la posición del fantasma.
const GHOST_SPRITE_OFFSET_Y = 3.5;

function drawGhost(ghost) {
  ctx.save();
  ctx.translate(ghost.x, ghost.y + GHOST_SPRITE_OFFSET_Y);

  // Cuerpo
  ctx.beginPath();
  ctx.arc(0, -5, 12, Math.PI, 0);
  ctx.lineTo(12, 10);
  ctx.lineTo(9, 5);
  ctx.lineTo(6, 10);
  ctx.lineTo(3, 5);
  ctx.lineTo(0, 10);
  ctx.lineTo(-3, 5);
  ctx.lineTo(-6, 10);
  ctx.lineTo(-9, 5);
  ctx.lineTo(-12, 10);
  ctx.lineTo(-12, -5);
  ctx.closePath();

  ctx.fillStyle = getGhostColor(ghost);
  ctx.fill();

  // Ojos (cambian de expresión en modo asustado)
  if (state.powerMode) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(-6, -5, 4, 5);
    ctx.fillRect(2, -5, 4, 5);

    ctx.fillStyle = '#000';
    ctx.fillRect(-5, -2, 2, 2);
    ctx.fillRect(3, -2, 2, 2);
  } else {
    ctx.fillStyle = '#fff';
    ctx.fillRect(-7, -8, 5, 6);
    ctx.fillRect(2, -8, 5, 6);

    ctx.fillStyle = '#000';
    ctx.fillRect(-5, -6, 2, 3);
    ctx.fillRect(4, -6, 2, 3);
  }

  ctx.restore();
}

function drawPacman() {
  ctx.save();
  ctx.translate(pacman.x, pacman.y);

  // Rotar según dirección
  let angle = 0;
  if (pacman.dir.x === 1) angle = 0;
  else if (pacman.dir.x === -1) angle = Math.PI;
  else if (pacman.dir.y === -1) angle = -Math.PI / 2;
  else if (pacman.dir.y === 1) angle = Math.PI / 2;
  ctx.rotate(angle);

  // Animación de boca
  const mouthAngle = 0.3 * Math.sin(pacman.mouthOpen * Math.PI * 2);

  ctx.beginPath();
  ctx.arc(0, 0, pacman.radius, 0.2 + mouthAngle, 2 * Math.PI - 0.2 - mouthAngle);
  ctx.lineTo(0, 0);
  ctx.fillStyle = '#ffcc00';
  ctx.fill();

  // Ojo
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.arc(5, -5, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawVictoryScreen() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = 'center';

  ctx.fillStyle = '#FFD700';
  ctx.font = '48px "Press Start 2P", monospace';
  ctx.fillText('¡VICTORIA!', cx, cy - 40);

  ctx.fillStyle = '#00ffcc';
  ctx.font = '24px "Press Start 2P", monospace';
  ctx.fillText('🎉 ¡GANASTE! 🎉', cx, cy + 10);

  ctx.fillStyle = '#fff';
  ctx.font = '16px "Press Start 2P", monospace';
  ctx.fillText('Puntuación: ' + state.score, cx, cy + 60);

  ctx.font = '20px "Press Start 2P", monospace';
  ctx.fillText(RESTART_HINT, cx, cy + 110);
}

function drawGameOverScreen() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textAlign = 'center';

  ctx.fillStyle = '#fff';
  ctx.font = '48px "Press Start 2P", monospace';
  ctx.fillText('GAME OVER', cx, cy);

  ctx.font = '20px "Press Start 2P", monospace';
  ctx.fillText(RESTART_HINT, cx, cy + 50);
}

export function draw() {
  // Fondo
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(mazeLayer, 0, 0);
  drawPortals();
  drawDots();
  state.ghosts.forEach(drawGhost);
  drawPacman();

  // Power mode indicator
  if (state.powerMode) {
    ctx.fillStyle = 'rgba(0, 100, 255, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (state.victory) drawVictoryScreen();
  if (state.gameOver) drawGameOverScreen();
}
