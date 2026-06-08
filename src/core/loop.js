/**
 * LOOP — Arkeen Serpent
 * Single requestAnimationFrame loop. No duplicates. No intervals.
 */
let lastTime = 0;
let accumulator = 0;
let rafId = null;
let updateFn = null;
let renderFn = null;
let stepMs = 120;

export function startLoop(update, render, step = 120) {
  stopLoop();
  updateFn = update;
  renderFn = render;
  stepMs = step;
  lastTime = performance.now();
  accumulator = 0;
  rafId = requestAnimationFrame(tick);
}

export function stopLoop() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

export function isRunning() { return !!rafId; }

function tick(timestamp) {
  rafId = requestAnimationFrame(tick);

  const dt = timestamp - lastTime;
  lastTime = timestamp;

  accumulator += dt;

  while (accumulator >= stepMs) {
    if (updateFn) updateFn(stepMs);
    accumulator -= stepMs;
  }

  if (renderFn) renderFn();
}
