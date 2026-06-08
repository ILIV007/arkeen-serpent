/**
 * PARTICLES — Arkeen Serpent
 * Pure visual layer. No game logic.
 */
const particles = [];

export function spawn(x, y, color, count = 8, speed = 3, size = 2) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * speed,
      vy: (Math.random() - 0.5) * speed - 1,
      life: 20 + Math.random() * 15,
      maxLife: 35,
      color,
      size: size + Math.random() * 2
    });
  }
}

export function update() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05;
    p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

export function draw(ctx) {
  for (const p of particles) {
    const a = p.life / p.maxLife;
    ctx.globalAlpha = a;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

export function clear() { particles.length = 0; }
