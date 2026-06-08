import { state } from '../core/state.js';

let ctx = null;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return ctx;
}

function beep(freq, dur, type = 'square', vol = 0.08) {
  if (!state.settings.sound) return;
  try {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
  } catch (e) {}
}

export function playSound(event) {
  if (!state.settings.sound) return;
  switch (event) {
    case 'EAT': beep(600, 0.06, 'square', 0.06); break;
    case 'COMBO': beep(800, 0.08, 'square', 0.07); beep(1000, 0.08, 'square', 0.05); break;
    case 'LEVEL_UP': beep(500, 0.1, 'sine', 0.08); beep(700, 0.1, 'sine', 0.08); beep(900, 0.15, 'sine', 0.08); break;
    case 'SPECIAL': beep(1200, 0.1, 'sine', 0.08); beep(1500, 0.15, 'sine', 0.06); break;
    case 'GAME_OVER': beep(200, 0.3, 'sawtooth', 0.08); beep(150, 0.4, 'sawtooth', 0.06); break;
    case 'PAUSE': beep(400, 0.08, 'sine', 0.05); break;
    case 'UNPAUSE': beep(500, 0.08, 'sine', 0.05); break;
    case 'MENU_CLICK': beep(300, 0.04, 'sine', 0.04); break;
    case 'ACHIEVEMENT': beep(600, 0.08, 'sine', 0.06); beep(800, 0.12, 'sine', 0.06); beep(1000, 0.2, 'sine', 0.06); break;
  }
}
