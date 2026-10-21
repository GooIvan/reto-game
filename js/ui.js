import { HIGHSCORE_KEY } from './config.js';
import { state } from './state.js';

const usernameEl = document.getElementById('username');
const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const highscoreEl = document.getElementById('highscore');

// Vidas con corazones
function renderLives() {
  // Solo reconstruir cuando cambia la cantidad de vidas
  if (livesEl.children.length === state.lives) return;

  livesEl.innerHTML = '';
  for (let i = 0; i < state.lives; i++) {
    const heart = document.createElement('img');
    heart.src = 'assets/heart.webp';
    heart.alt = 'vida';
    heart.classList.add('heart-icon');
    livesEl.appendChild(heart);
  }
}

export function updateScoreboard() {
  usernameEl.textContent = state.username;
  scoreEl.textContent = state.score;
  renderLives();

  if (state.score > state.highscore) {
    state.highscore = state.score;
    localStorage.setItem(HIGHSCORE_KEY, state.highscore);
  }
  highscoreEl.textContent = state.highscore;
}
