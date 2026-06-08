import { state, setMode } from '../core/state.js';

let locked = false;
let touchStartX = 0;
let touchStartY = 0;
let touchStartTime = 0;

export function initInput() {
  window.addEventListener('keydown', onKeyDown, { passive: true });
  const canvas = document.getElementById('gameCanvas');
  canvas.addEventListener('touchstart', onTouchStart, { passive: true });
  canvas.addEventListener('touchend', onTouchEnd, { passive: true });
  canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

  document.querySelectorAll('.d-btn[data-dir]').forEach(btn => {
    btn.addEventListener('click', (e) => { e.preventDefault(); const dir = btn.dataset.dir; if (dir) setDirection(dir); });
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); const dir = btn.dataset.dir; if (dir) setDirection(dir); }, { passive: true });
  });
}

function onKeyDown(e) {
  if (state.mode !== 'playing') {
    if (e.key === 'Enter' || e.key === ' ') {
      if (state.mode === 'menu') setMode('playing');
      else if (state.mode === 'gameover') restartGame();
      else if (state.mode === 'paused') setMode('playing');
    }
    if (e.key === 'Escape') {
      if (state.mode === 'playing') setMode('paused');
      else if (state.mode === 'paused') setMode('playing');
    }
    return;
  }
  switch (e.key) {
    case 'ArrowUp': case 'w': case 'W': setDirection('UP'); break;
    case 'ArrowDown': case 's': case 'S': setDirection('DOWN'); break;
    case 'ArrowLeft': case 'a': case 'A': setDirection('LEFT'); break;
    case 'ArrowRight': case 'd': case 'D': setDirection('RIGHT'); break;
    case ' ': case 'Escape': setMode('paused'); break;
  }
}

function onTouchStart(e) {
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  }
}

function onTouchEnd(e) {
  if (state.mode !== 'playing') return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const dt = Date.now() - touchStartTime;
  if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
  if (dt > 500) return;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0) setDirection('RIGHT'); else setDirection('LEFT');
  } else {
    if (dy > 0) setDirection('DOWN'); else setDirection('UP');
  }
}

export function setDirection(dir) {
  if (locked) return;
  const opposites = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
  if (opposites[dir] === state.direction) return;
  state.nextDirection = dir;
  locked = true;
  setTimeout(() => { locked = false; }, 60);
}

export function applyNextDirection() {
  state.direction = state.nextDirection;
}

function restartGame() {
  setMode('playing');
}
