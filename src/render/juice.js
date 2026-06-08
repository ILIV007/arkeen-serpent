import { state } from '../core/state.js';

let shake = 0;
let flash = 0;

export function addShake(amount = 5) {
  if (!state.settings.shake) return;
  shake = Math.min(shake + amount, 20);
}

export function addFlash(amount = 0.3) {
  flash = Math.min(flash + amount, 0.6);
}

export function updateJuice() {
  shake *= 0.88;
  if (shake < 0.3) shake = 0;
  flash *= 0.92;
  if (flash < 0.01) flash = 0;
}

export function applyShake(ctx) {
  if (shake > 0.5) {
    ctx.translate(
      (Math.random() - 0.5) * shake,
      (Math.random() - 0.5) * shake
    );
  }
}

export function applyFlash(ctx, width, height) {
  if (flash > 0.01) {
    ctx.fillStyle = `rgba(255, 255, 255, ${flash})`;
    ctx.fillRect(0, 0, width, height);
  }
}

export function getShake() {
  return shake;
}
