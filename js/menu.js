import { IS_TOUCH } from './config.js';

const menuContainer = document.getElementById('menu-container');
const usernameInput = document.getElementById('username-input');

// Menú de inicio. Llama a onStart(nombreDeUsuario) al pulsar Jugar o Enter.
export function setupMenu(onStart) {
  const startButton = document.getElementById('start-button');

  function start() {
    menuContainer.classList.add('hidden');
    onStart(usernameInput.value.trim() || 'Jugador');
  }

  startButton.addEventListener('click', start);

  // Permitir presionar Enter para iniciar
  usernameInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') start();
  });
}

// Vuelve a mostrar el menú de inicio (conserva el nombre escrito)
export function showMenu() {
  menuContainer.classList.remove('hidden');
  if (!IS_TOUCH) usernameInput.focus(); // en móvil abriría el teclado
}

// Botón "Salir" de la partida
export function setupExitButton(onExit) {
  document.getElementById('exit-button').addEventListener('click', onExit);
}
