import { state } from './state.js';
import { loadMap, buildDots } from './map.js';
import { initRenderer } from './renderer.js';
import { resetPacman } from './pacman.js';
import { createGhosts } from './ghosts.js';
import { updateScoreboard } from './ui.js';
import { setupMenu, setupExitButton } from './menu.js';
import { setupInput } from './input.js';
import { setupInfoModal } from './info.js';
import { setupAudioControls } from './audio-controls.js';
import { startGame, resetGame, exitToMenu } from './game.js';

async function init() {
  setupInfoModal();
  setupAudioControls();

  await loadMap();
  await initRenderer();

  state.dots = buildDots();
  resetPacman();
  state.ghosts = createGhosts();

  updateScoreboard();
  setupMenu(startGame);
  setupExitButton(exitToMenu);
  setupInput(resetGame);
}

init();
