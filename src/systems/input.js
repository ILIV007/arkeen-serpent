/**
 * INPUT — Arkeen Serpent
 * Keyboard + Swipe. Lock-protected to prevent double-input per tick.
 */
import { state } from '../core/state.js';

let nextDir = { x: 1, y: 0 };
let locked = false;
let touchStart = null;
const SWIPE_THRESHOLD = 30;

const KEYS = {
  ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 }, s: { x: 0, y: 1 },
  a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
  W: { x: 0, y: -1 }, S: { x: 0, y: 1 },
  A: { x: -1, y: 0 }, D: { x: 1, y: 0 }
};

function setDir(d) {
  // Prevent 180 reversal
  if (d.x === -state.dir.x && d.y === -state.dir.y) return;
  nextDir = { x: d.x, y: d.y };
  locked = true;
}

function onKey(e) {
  if (KEYS[e.key]) {
    e.preventDefault();
    setDir(KEYS[e.key]);
  }
  if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
    emitPause?.();
  }
}

function onTouchStart(e) {
  if (e.touches.length === 1) {
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
}

function onTouchEnd(e) {
  if (!touchStart) return;
  const dx = e.changedTouches[0].clientX - touchStart.x;
  const dy = e.changedTouches[0].clientY - touchStart.y;
  const absX = Math.abs(dx), absY = Math.abs(dy);

  if (Math.max(absX, absY) > SWIPE_THRESHOLD) {
    if (absX > absY) setDir({ x: dx > 0 ? 1 : -1, y: 0 });
    else setDir({ x: 0, y: dy > 0 ? 1 : -1 });
  }
  touchStart = null;
}

let emitPause = null;

export function initInput(onPause) {
  emitPause = onPause;
  document.addEventListener('keydown', onKey);
  const wrap = document.getElementById('canvas-wrap') || document.body;
  wrap.addEventListener('touchstart', onTouchStart, { passive: false });
  wrap.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  wrap.addEventListener('touchend', onTouchEnd, { passive: false });
}

export function consumeDir() {
  const d = nextDir;
  state.dir = d;
  locked = false;
  return d;
}

export function resetInput() {
  nextDir = { x: 1, y: 0 };
  locked = false;
  touchStart = null;
}
