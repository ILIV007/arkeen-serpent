import { state, initState, setMode } from './core/state.js';
import { startLoop, stopLoop } from './core/loop.js';
import { initInput, applyNextDirection } from './systems/input.js';
import { playSound } from './systems/audio.js';
import { initRenderer, render } from './render/renderer.js';
import { moveSnake } from './gameplay/snake.js';
import { checkFood, checkCollision } from './gameplay/rules.js';
import { initScreens, updateScreenVisibility } from './ui/screens.js';

let lastScreenMode = null;

function init() {
  initState();
  initRenderer();
  initInput();
  initScreens();

  // Start with menu
  setMode('menu');
  updateScreenVisibility();

  // Start render loop (always running for background/menu effects)
  startLoop(update, renderLoop, 16);
}

function update() {
  if (state.mode === 'playing') {
    applyNextDirection();
    moveSnake();
    checkFood();
    checkCollision();
  }

  // Screen transition detection
  if (state.mode !== lastScreenMode) {
    lastScreenMode = state.mode;
    updateScreenVisibility();
  }
}

function renderLoop() {
  render();
}

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
