# Pac-Man — Reto Game

Clon de Pac-Man hecho con **JavaScript puro** (canvas 2D, sin frameworks, sin build y sin dependencias).
Funciona en computador y en celular.

Desarrollado por [Brian Ortega](https://github.com/BrianOrtegaa/) e [Iván Madera](https://github.com/GooIvan/)
durante una prueba realizada en el SENA, obteniendo el **primer lugar en el Reto Game** del
Primer Encuentro de Tecnología e Innovación **SENA BIT**.

## Cómo probarlo

El juego usa módulos ES y carga el mapa con `fetch`, así que **hay que abrirlo desde un servidor local**
(abrir `index.html` con doble clic, `file://`, no funciona).

### 1. En tu computador

Necesitas solo **Python 3** o **Node.js**. Desde la carpeta del proyecto, elige una opción:

```bash
# Python 3 (Linux / macOS)
python3 -m http.server 8000

# Python 3 (Windows)
py -m http.server 8000

# Node.js
npx serve -l 8000 .
```

Abre **http://localhost:8000** en el navegador. Si usas VS Code, también sirve la extensión *Live Server*.

> Necesita un navegador actual (Chrome, Edge, Firefox o Safari recientes).

### 2. En tu celular

1. Conecta el celular y el computador **al mismo Wi-Fi**.
2. Levanta el servidor como en el paso anterior. `python -m http.server` ya escucha en toda la red.
3. Averigua la IP del computador:
   - Linux: `hostname -I`
   - macOS: `ipconfig getifaddr en0`
   - Windows: `ipconfig` (busca "Dirección IPv4")
4. En el navegador del celular abre `http://<IP-del-computador>:8000`, por ejemplo `http://192.168.1.20:8000`.

Si no carga:
- Revisa que el firewall permita el puerto 8000 (por ejemplo, en Fedora: `sudo firewall-cmd --add-port=8000/tcp`).
- Las redes de invitados o de oficinas suelen aislar los dispositivos entre sí.
- Desactiva la VPN o los datos móviles en el celular.
- Usa el servidor solo en redes de confianza: expone todos los archivos de la carpeta.

Sin celular a mano, en Chrome abre las herramientas de desarrollador (`F12`) y activa el modo dispositivo
(`Ctrl + Shift + M`): ahí aparece la cruceta táctil.

### 3. Qué probar

- [ ] **Menú:** escribe tu nombre y pulsa *Jugar* (o `Enter`). El botón **Info** abre el modal con los créditos.
- [ ] **Sonido:** los botones **Música** y **Efectos** los activan o silencian por separado, y recuerdan tu elección.
- [ ] **Juego:** come todos los puntos para ganar. Los puntos grandes activan el modo poder (8 s) y puedes comerte a los fantasmas.
- [ ] **Portales:** los túneles de los bordes te llevan al lado contrario del mapa.
- [ ] **Perder:** al quedarte sin vidas aparece *Game Over*; `Enter` (o tocar el juego en celular) reinicia.
- [ ] **Salir:** el botón **Salir** del marcador vuelve al menú de inicio. El récord se conserva.
- [ ] **Pantalla:** cambia el tamaño de la ventana o gira el celular; el juego se adapta y se ve completo.

## Cómo se juega

| Control | Acción |
|---|---|
| Flechas o `W` `A` `S` `D` | Mover a Pac-Man |
| `Enter` | Reiniciar al terminar la partida |
| Deslizar sobre el juego (celular) | Mover a Pac-Man |
| Cruceta en pantalla (celular) | Mover a Pac-Man |
| Tocar el juego (celular) | Reiniciar al terminar la partida |

**Puntos:** punto normal 10 · punto grande 50 (activa el modo poder) · fantasma comido 200. Tienes 3 vidas.

**Fantasmas:**

| Color | Comportamiento |
|---|---|
| 👻 Rojo | Persigue a Pac-Man directamente |
| 💖 Rosa | Se anticipa: apunta 4 casillas por delante de Pac-Man |
| 💙 Azul | Flanquea usando la posición del fantasma rojo |
| 🧡 Naranja | Persigue si está lejos y huye a su esquina si está cerca |

El récord y las preferencias de sonido se guardan en el navegador (`localStorage`). Para borrarlos,
ejecuta `localStorage.clear()` en la consola del navegador.

## Estructura del proyecto

```
index.html        Página: menú, juego, marcador y cruceta
styles.css        Estilos y diseño adaptable a cualquier pantalla
assets/           Mapa (map.json) e imágenes
sounds/           Música y efectos
js/               Código del juego, dividido en módulos ES
```

| Módulo | Responsabilidad |
|---|---|
| `js/main.js` | Punto de entrada: carga el mapa y conecta todo |
| `js/game.js` | Bucle principal, inicio, perder vida, reinicio y salir al menú |
| `js/pacman.js` | Movimiento, puntos, modo poder y victoria |
| `js/ghosts.js` | Creación, movimiento por casillas e IA de los fantasmas |
| `js/renderer.js` | Todo el dibujo en el canvas |
| `js/map.js` | Carga del mapa, puntos y colisiones con paredes |
| `js/state.js` | Estado compartido (puntaje, vidas, puntos, fantasmas...) |
| `js/config.js` | Constantes: velocidades, puntos, fantasmas |
| `js/input.js` | Teclado, deslizamiento sobre el juego y cruceta táctil |
| `js/menu.js` | Menú de inicio y botón Salir |
| `js/info.js` | Modal "Acerca del proyecto" |
| `js/ui.js` | Marcador (puntos, vidas, récord) |
| `js/audio.js` | Sonidos y preferencias de audio |
| `js/audio-controls.js` | Botones de música y efectos |
| `js/utils.js` | Utilidades |

### Modificar el mapa

El laberinto está en `assets/map.json` (capa `walls`, 28 columnas × 25 filas): `0` vacío, `1` pared,
`2` punto y `3` punto grande. Las posiciones de inicio están en la capa `entities`
(`x` e `y` en píxeles; usa el **centro** de la casilla, es decir `columna × 32 + 16` y `fila × 32 + 16`,
para que los fantasmas salgan bien centrados).

## Créditos

- Música de fondo: «Pac-man theme remix» de Arsenic1987.
- Pac-Man es una marca de Bandai Namco. Este es un proyecto educativo, sin fines comerciales.
