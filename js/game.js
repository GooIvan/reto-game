import { INITIAL_LIVES } from './config.js';
import { state } from './state.js';
import { playSound, stopMusic, stopAllSounds } from './audio.js';
import { resetPacman, updatePacman } from './pacman.js';
import { resetGhosts, updateGhosts } from './ghosts.js';
import { draw } from './renderer.js';
import { updateScoreboard } from './ui.js';
import { showMenu } from './menu.js';

let frameId = null; // para poder detener el bucle al salir
let musicTimer = null; // música de fondo, que arranca 1 s después del sonido de inicio

function update() {
  updatePacman();
  updateGhosts(loseLife);
}

function gameLoop() {
  update();
  draw();
  frameId = requestAnimationFrame(gameLoop);
}

export function startGame(username) {
  if (state.gameStarted) return;

  state.username = username;
  updateScoreboard();

  // Sonido de inicio y música de fondo
  playSound('inicio');
  musicTimer = setTimeout(() => playSound('music'), 1000);

  state.gameStarted = true;
  frameId = requestAnimationFrame(gameLoop);
}

function resetPositions() {
  resetPacman();
  resetGhosts();
}

function loseLife() {
  state.lives--;
  updateScoreboard();
  playSound('muerte');

  if (state.lives <= 0) {
    state.gameOver = true;
    stopMusic();
  } else {
    resetPositions();
  }
}

function resetState() {
  state.score = 0;
  state.lives = INITIAL_LIVES;
  state.gameOver = false;
  state.victory = false;
  state.powerMode = false;
  state.powerModeTimer = 0;

  state.dots.forEach(dot => dot.collected = false);
  resetPositions();
  updateScoreboard();
}

export function resetGame() {
  resetState();

  // Reiniciar música al resetear el juego
  playSound('music');
}

// Abandona la partida: detiene el juego, calla todo y vuelve al menú de inicio
export function exitToMenu() {
  cancelAnimationFrame(frameId);
  clearTimeout(musicTimer);
  stopAllSounds();

  state.gameStarted = false;
  resetState();
  showMenu();
}
