import { state } from '../core/state.js';

const particles = [];

export function spawnParticles(x, y, type) {
  if (!state.settings.particles) return;
  const colors = {
    food: ['#c9a84c', '#e8d5a3', '#ffaa00'],
    special: ['#ffd700', '#ffaa00', '#ffffff'],
    death: ['#ff4444', '#ff0000', '#cc0000'],
    combo: ['#ff6600', '#ffaa00', '#ffd700'],
    level: ['#4cc98b', '#00ffaa', '#ffffff'],
  };
  const palette = colors[type] || colors.food;
  const count = type === 'death' ? 30 : type === 'special' ? 20 : 12;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1 + Math.random() * 4;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 30 + Math.random() * 20,
      maxLife: 30 + Math.random() * 20,
      color: palette[Math.floor(Math.random() * palette.length)],
      size: 2 + Math.random() * 3,
    });
  }
}

export function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.96;
    p.vy *= 0.96;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

export function drawParticles(ctx) {
  if (!state.settings.particles) return;
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function clearParticles() {
  particles.length = 0;
}
