import { state } from '../core/state.js';

const particles = [];
const floatingTexts = [];

export function spawnParticles(x, y, type) {
  if (!state.settings.particles) return;
  const theme = state.settings.theme;
  let colors;
  if (theme === 'moon') {
    colors = ['#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];
  } else if (theme === 'emerald') {
    colors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];
  } else if (theme === 'crimson') {
    colors = ['#ef4444', '#f97316', '#fca5a5', '#fee2e2'];
  } else if (theme === 'royal') {
    colors = ['#ffd700', '#c9a84c', '#e8d5a3', '#fff8dc'];
  } else {
    colors = ['#c9a84c', '#e8d5a3', '#ffaa00', '#ffd700'];
  }

  const count = type === 'death' ? 35 : type === 'special' ? 25 : 15;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 1.5 + Math.random() * 5;
    particles.push({
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 40 + Math.random() * 25,
      maxLife: 40 + Math.random() * 25,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 2 + Math.random() * 4,
      type: type,
    });
  }
}

export function spawnFloatingText(x, y, text, color) {
  floatingTexts.push({
    x, y,
    text,
    color,
    life: 45,
    maxLife: 45,
    vy: -1.2,
  });
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

  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const t = floatingTexts[i];
    t.y += t.vy;
    t.life--;
    if (t.life <= 0) floatingTexts.splice(i, 1);
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

    // Sparkle effect for special food
    if (p.type === 'special' && Math.random() > 0.7) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x + (Math.random() - 0.5) * 10, p.y + (Math.random() - 0.5) * 10, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw floating texts
  for (const t of floatingTexts) {
    const alpha = t.life / t.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = t.color;
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(t.text, t.x, t.y);
  }

  ctx.globalAlpha = 1;
  ctx.textAlign = 'start';
}

export function clearParticles() {
  particles.length = 0;
  floatingTexts.length = 0;
}
