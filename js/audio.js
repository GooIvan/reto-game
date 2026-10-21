import { AUDIO_SETTINGS_KEY } from './config.js';
import { state } from './state.js';

export const sounds = {
  inicio: new Audio('sounds/inicio.mp3'),
  music: new Audio('sounds/Pac-man theme remix - By Arsenic1987.mp3'),
  comer: new Audio('sounds/comer.mp3'),
  muerte: new Audio('sounds/Muerte.mp3'),
  powerUp: new Audio('sounds/off.mp3')
};

sounds.music.loop = true; // La música se repite
sounds.music.volume = 0.3; // Volumen más bajo para la música de fondo
sounds.comer.volume = 0.5;
sounds.muerte.volume = 0.6;
sounds.powerUp.volume = 0.7;
sounds.inicio.volume = 0.5;

// Preferencias: 'music' es la música de fondo, 'effects' todos los demás sonidos
export const audioSettings = loadSettings();

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(AUDIO_SETTINGS_KEY)) ?? {};
    return { music: saved.music !== false, effects: saved.effects !== false };
  } catch {
    return { music: true, effects: true };
  }
}

function saveSettings() {
  try {
    localStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify(audioSettings));
  } catch {
    // Sin almacenamiento disponible: la preferencia solo dura la sesión
  }
}

function logPlayError(name, e) {
  console.log(`Error al reproducir ${name}:`, e);
}

// Activa o desactiva 'music' o 'effects' y lo aplica de inmediato
export function setAudioEnabled(type, enabled) {
  audioSettings[type] = enabled;
  saveSettings();

  if (type === 'music') {
    if (!enabled) {
      sounds.music.pause();
    } else if (state.gameStarted && !state.gameOver && !state.victory) {
      // Reanudar solo si la partida está en curso
      sounds.music.play().catch(e => logPlayError('music', e));
    }
    return;
  }

  // Cortar los efectos que estén sonando
  stopSounds(Object.keys(sounds).filter(name => name !== 'music'));
}

function stopSounds(names) {
  names.forEach(name => {
    sounds[name].pause();
    sounds[name].currentTime = 0;
  });
}

export function stopAllSounds() {
  stopSounds(Object.keys(sounds));
}

// Reproduce un sonido desde el principio (si su tipo está activado).
export function playSound(name) {
  if (!audioSettings[name === 'music' ? 'music' : 'effects']) return;

  const sound = sounds[name];
  sound.currentTime = 0;
  sound.play().catch(e => logPlayError(name, e));
}

export function stopMusic() {
  sounds.music.pause();
  sounds.music.currentTime = 0;
}
