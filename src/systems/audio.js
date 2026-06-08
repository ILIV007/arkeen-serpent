/**
 * AUDIO — Arkeen Serpent
 * Procedural WebAudio. Event-driven. No external files.
 */
let ctx = null;
let masterGain = null;
let ambientNode = null;
let ambientGain = null;
let mutedSfx = false;
let mutedMusic = false;

function init() {
  if (ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.35;
  masterGain.connect(ctx.destination);
}

function resume() {
  if (ctx && ctx.state === 'suspended') ctx.resume();
}

function pluck(freq, dur, vol, delay = 0) {
  if (!ctx || mutedSfx) return;
  const t = ctx.currentTime + delay;
  const sr = ctx.sampleRate;
  const len = Math.floor(sr * dur);
  const buf = ctx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  const p = Math.round(sr / freq);
  for (let i = 0; i < p; i++) d[i] = Math.random() * 2 - 1;
  for (let i = p; i < len; i++) d[i] = 0.996 * (d[i - p] + d[i - p + 1]) * 0.5;
  const src = ctx.createBufferSource(); src.buffer = buf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.9);
  const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 3000 + freq * 2;
  src.connect(f); f.connect(g); g.connect(masterGain);
  src.start(t); src.stop(t + dur);
}

function noise(dur, vol, freq = 1000, delay = 0) {
  if (!ctx || mutedSfx) return;
  const t = ctx.currentTime + delay;
  const sr = ctx.sampleRate;
  const len = Math.floor(sr * dur);
  const buf = ctx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
  const src = ctx.createBufferSource(); src.buffer = buf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 1;
  src.connect(f); f.connect(g); g.connect(masterGain);
  src.start(t); src.stop(t + dur);
}

function tone(freq, dur, type = 'sine', vol = 0.3, delay = 0) {
  if (!ctx || mutedSfx) return;
  const t = ctx.currentTime + delay;
  const o = ctx.createOscillator(); o.type = type; o.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  o.connect(g); g.connect(masterGain);
  o.start(t); o.stop(t + dur);
}

export const Audio = {
  playEat() { init(); resume(); pluck(880, 0.07, 0.25); },
  playGolden() { init(); resume(); pluck(1320, 0.12, 0.3); pluck(1760, 0.1, 0.2, 0.05); },
  playPoison() { init(); resume(); noise(0.15, 0.2, 200); tone(150, 0.2, 'sawtooth', 0.1); },
  playCombo(n) { init(); resume(); for (let i = 0; i < Math.min(n, 4); i++) pluck(660 + i * 220, 0.06, 0.2, i * 0.04); },
  playLevelUp() { init(); resume(); tone(523, 0.1, 'sine', 0.3); tone(659, 0.1, 'sine', 0.3, 0.08); tone(784, 0.15, 'sine', 0.3, 0.16); },
  playGameOver() { init(); resume(); tone(400, 0.2, 'sawtooth', 0.2); tone(300, 0.3, 'sawtooth', 0.2, 0.15); tone(200, 0.4, 'sawtooth', 0.2, 0.3); },
  playPitWarning() { init(); resume(); tone(300, 0.08, 'square', 0.1); },
  playPitOpen() { init(); resume(); noise(0.2, 0.15, 100); },
  playMenuHover() { if (!mutedSfx) { init(); resume(); noise(0.03, 0.05, 3000); } },
  playMenuClick() { if (!mutedSfx) { init(); resume(); pluck(440, 0.05, 0.15); } },

  startAmbient() {
    if (!ctx || mutedMusic || ambientNode) return;
    const sr = ctx.sampleRate;
    const len = Math.floor(sr * 4);
    const buf = ctx.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * 0.05;
    ambientNode = ctx.createBufferSource(); ambientNode.buffer = buf; ambientNode.loop = true;
    ambientGain = ctx.createGain(); ambientGain.gain.value = 0.06;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 350;
    ambientNode.connect(f); f.connect(ambientGain); ambientGain.connect(masterGain);
    ambientNode.start();
  },
  stopAmbient() { if (ambientNode) { ambientNode.stop(); ambientNode = null; ambientGain = null; } },
  setMute(sfx, music) { mutedSfx = !sfx; mutedMusic = !music; if (mutedMusic) this.stopAmbient(); },
  isReady() { return !!ctx; }
};
