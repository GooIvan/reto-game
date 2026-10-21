import { HIGHSCORE_KEY, INITIAL_LIVES } from './config.js';

// Estado compartido del juego. Es un objeto para que cualquier módulo pueda
// modificarlo (los `export let` no se pueden reasignar desde fuera).
export const state = {
  mapData: null,
  walls: null, // data de la capa 'walls'
  dots: [],
  ghosts: [],
  score: 0,
  lives: INITIAL_LIVES,
  highscore: Number(localStorage.getItem(HIGHSCORE_KEY)) || 0,
  gameOver: false,
  victory: false, // Estado de victoria
  powerMode: false,
  powerModeTimer: 0,
  username: '',
  gameStarted: false
};
