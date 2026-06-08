import { state, initState, setMode } from './core/state.js';
import { startLoop } from './core/loop.js';
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
  setMode('menu');
  updateScreenVisibility();
  startLoop(update, renderLoop, 16);
}

function update() {
  if (state.mode === 'playing') {
    state.moveAccumulator += 16;
    while (state.moveAccumulator >= state.step) {
      state.moveAccumulator -= state.step;
      applyNextDirection();
      moveSnake();
      checkFood();
      checkCollision();
    }
  }
  if (state.mode !== lastScreenMode) {
    lastScreenMode = state.mode;
    updateScreenVisibility();
  }
}

function renderLoop() {
  render();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
