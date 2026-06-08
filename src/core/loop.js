let started = false;
let rafId = null;

export function startLoop(update, render, step) {
  if (started) return;
  started = true;
  let last = performance.now();
  let acc = 0;

  function frame(now) {
    const delta = now - last;
    last = now;
    acc += delta;
    while (acc >= step) {
      update();
      acc -= step;
    }
    render();
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
}

export function stopLoop() {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  started = false;
}

export function isLoopRunning() {
  return started;
}
