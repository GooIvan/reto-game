import { state } from './state.js';
import { pacman } from './pacman.js';

const UP = { x: 0, y: -1 };
const DOWN = { x: 0, y: 1 };
const LEFT = { x: -1, y: 0 };
const RIGHT = { x: 1, y: 0 };

const KEY_DIRECTIONS = {
  ArrowUp: UP, w: UP, W: UP,
  ArrowDown: DOWN, s: DOWN, S: DOWN,
  ArrowLeft: LEFT, a: LEFT, A: LEFT,
  ArrowRight: RIGHT, d: RIGHT, D: RIGHT
};

const DPAD_DIRECTIONS = { up: UP, down: DOWN, left: LEFT, right: RIGHT };

// Distancia mínima (px de pantalla) para que un arrastre cuente como deslizamiento
const SWIPE_MIN_DISTANCE = 24;

// Movimiento con buffer de dirección
function steer(dir) {
  pacman.nextDir = { ...dir };
}

function isFinished() {
  return state.gameOver || state.victory;
}

function setupKeyboard(onRestart) {
  window.addEventListener('keydown', e => {
    if (!state.gameStarted) return; // No permitir controles antes de iniciar

    if (isFinished() && e.key === 'Enter') {
      onRestart();
      return;
    }

    const dir = KEY_DIRECTIONS[e.key];
    if (dir) {
      steer(dir);
      e.preventDefault();
    }
  });
}

// Cruceta en pantalla (solo visible en dispositivos táctiles)
function setupDpad() {
  document.querySelectorAll('.dpad-btn').forEach(button => {
    // La clase .pressed da el efecto de botón hundido (más fiable que :active en móviles)
    const release = () => button.classList.remove('pressed');

    button.addEventListener('pointerdown', e => {
      e.preventDefault();
      button.classList.add('pressed');
      if (state.gameStarted) steer(DPAD_DIRECTIONS[button.dataset.dir]);
    });
    button.addEventListener('pointerup', release);
    button.addEventListener('pointercancel', release);
    button.addEventListener('pointerleave', release);
  });
}

// Deslizar sobre el canvas cambia de dirección; tocarlo reinicia al terminar la partida
function setupCanvasGestures(onRestart) {
  const canvas = document.getElementById('gameCanvas');
  let origin = null;
  let dragged = false;
  let startedFinished = false;

  canvas.addEventListener('pointerdown', e => {
    origin = { x: e.clientX, y: e.clientY };
    dragged = false;
    // Solo reinicia un toque que empezó con la partida ya terminada,
    // para no reiniciar por accidente al deslizar justo cuando se muere
    startedFinished = isFinished();
  });

  canvas.addEventListener('pointermove', e => {
    if (!origin) return;

    const dx = e.clientX - origin.x;
    const dy = e.clientY - origin.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN_DISTANCE) return;

    dragged = true; // ya no es un toque: ni reinicia ni, con el ratón, mueve
    if (e.pointerType === 'mouse' || !state.gameStarted) return;

    steer(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? RIGHT : LEFT) : (dy > 0 ? DOWN : UP));
    origin = { x: e.clientX, y: e.clientY }; // permite encadenar giros sin levantar el dedo
  });

  canvas.addEventListener('pointerup', () => {
    if (startedFinished && isFinished() && !dragged) onRestart();
    origin = null;
  });

  canvas.addEventListener('pointercancel', () => {
    origin = null;
  });
}

// onRestart se llama al terminar la partida (Enter o toque en el canvas)
export function setupInput(onRestart) {
  setupKeyboard(onRestart);
  setupDpad();
  setupCanvasGestures(onRestart);
}
