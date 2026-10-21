import { audioSettings, setAudioEnabled } from "./audio.js";

const LABELS = {
  music: { on: "Música: ON", off: "Música: OFF" },
  effects: { on: "Efectos: ON", off: "Efectos: OFF" },
};

function render(button) {
  const type = button.dataset.sound;
  const enabled = audioSettings[type];

  button.textContent = LABELS[type][enabled ? "on" : "off"];
  button.setAttribute("aria-pressed", enabled);
}

// Interruptores de música/efectos. Hay uno de cada tipo en el menú y otro en
// el marcador; todos se mantienen sincronizados.
export function setupAudioControls() {
  const buttons = document.querySelectorAll(".audio-toggle");

  buttons.forEach((button) => {
    render(button);

    button.addEventListener("click", () => {
      const type = button.dataset.sound;
      setAudioEnabled(type, !audioSettings[type]);
      buttons.forEach(render);

      // Quitar el foco para que el Enter de "reiniciar" no vuelva a pulsarlo
      button.blur();
    });
  });
}
