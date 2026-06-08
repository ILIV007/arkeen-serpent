import { state, THEMES } from '../core/state.js';
import { drawParticles, updateParticles } from './particles.js';
import { updateJuice, applyShake, applyFlash } from './juice.js';

let canvas, ctx;
let stars = [];
let nebulaOffset = 0;

export function initRenderer() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  generateStars();
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  state.canvasWidth = canvas.width;
  state.canvasHeight = canvas.height;
  // Calculate cell size to fit grid
  const minDim = Math.min(canvas.width, canvas.height);
  state.cellSize = Math.floor(minDim / (state.gridSize + 2));
  generateStars();
}

function generateStars() {
  stars = [];
  for (let i = 0; i < 80; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 0.5 + Math.random() * 2,
      speed: 0.1 + Math.random() * 0.5,
      brightness: 0.3 + Math.random() * 0.7,
    });
  }
}

export function render() {
  const theme = THEMES[state.settings.theme];

  ctx.save();
  applyShake(ctx);

  // Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Ambient effects
  drawAmbient(ctx, theme);

  if (state.mode === 'playing' || state.mode === 'paused' || state.mode === 'gameover') {
    drawGame(ctx, theme);
  } else if (state.mode === 'menu') {
    drawMenuBackground(ctx, theme);
  }

  // Flash overlay
  applyFlash(ctx, canvas.width, canvas.height);

  ctx.restore();
}

function drawMenuBackground(ctx, theme) {
  drawAmbient(ctx, theme);
  // Subtle snake trail animation in background
  const t = Date.now() * 0.001;
  ctx.strokeStyle = theme.snakeBody;
  ctx.globalAlpha = 0.1;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 50; i++) {
    const x = canvas.width / 2 + Math.sin(t + i * 0.2) * 100 + Math.cos(t * 0.5 + i * 0.1) * 50;
    const y = canvas.height / 2 + Math.cos(t + i * 0.15) * 80 + Math.sin(t * 0.3 + i * 0.1) * 40;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawGame(ctx, theme) {
  const cs = state.cellSize;
  const gs = state.gridSize;
  const offsetX = (canvas.width - gs * cs) / 2;
  const offsetY = (canvas.height - gs * cs) / 2;

  // Grid background
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(offsetX - 2, offsetY - 2, gs * cs + 4, gs * cs + 4);

  // Grid lines
  if (state.settings.grid) {
    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;
    for (let i = 0; i <= gs; i++) {
      ctx.beginPath();
      ctx.moveTo(offsetX + i * cs, offsetY);
      ctx.lineTo(offsetX + i * cs, offsetY + gs * cs);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY + i * cs);
      ctx.lineTo(offsetX + gs * cs, offsetY + i * cs);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // Food glow
  if (state.food) {
    const fx = offsetX + state.food.x * cs + cs / 2;
    const fy = offsetY + state.food.y * cs + cs / 2;
    const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.15;
    const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, cs * pulse);
    grad.addColorStop(0, 'rgba(255, 68, 68, 0.4)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(fx, fy, cs * pulse, 0, Math.PI * 2);
    ctx.fill();
  }

  // Special food
  if (state.specialFood) {
    const sx = offsetX + state.specialFood.x * cs + cs / 2;
    const sy = offsetY + state.specialFood.y * cs + cs / 2;
    const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.25;
    const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, cs * pulse * 1.5);
    grad.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(sx, sy, cs * pulse * 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = theme.specialFood;
    ctx.beginPath();
    ctx.arc(sx, sy, cs * 0.35 * pulse, 0, Math.PI * 2);
    ctx.fill();
  }

  // Snake
  state.snake.forEach((seg, i) => {
    const sx = offsetX + seg.x * cs;
    const sy = offsetY + seg.y * cs;
    const isHead = i === 0;
    const size = isHead ? cs * 0.9 : cs * 0.8;
    const pad = (cs - size) / 2;

    // Glow for head
    if (isHead) {
      const grad = ctx.createRadialGradient(sx + cs / 2, sy + cs / 2, 0, sx + cs / 2, sy + cs / 2, cs * 1.2);
      grad.addColorStop(0, 'rgba(201, 168, 76, 0.3)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(sx + cs / 2, sy + cs / 2, cs * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = isHead ? theme.snakeHead : theme.snakeBody;
    const alpha = isHead ? 1 : 0.7 + (state.snake.length - i) / state.snake.length * 0.3;
    ctx.globalAlpha = alpha;
    roundRect(ctx, sx + pad, sy + pad, size, size, 4);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Eyes on head
    if (isHead) {
      ctx.fillStyle = '#000';
      const eyeSize = cs * 0.12;
      const eyeOffset = cs * 0.25;
      let ex1, ey1, ex2, ey2;
      switch (state.direction) {
        case 'RIGHT':
          ex1 = sx + cs * 0.7; ey1 = sy + cs * 0.3;
          ex2 = sx + cs * 0.7; ey2 = sy + cs * 0.7;
          break;
        case 'LEFT':
          ex1 = sx + cs * 0.3; ey1 = sy + cs * 0.3;
          ex2 = sx + cs * 0.3; ey2 = sy + cs * 0.7;
          break;
        case 'UP':
          ex1 = sx + cs * 0.3; ey1 = sy + cs * 0.3;
          ex2 = sx + cs * 0.7; ey2 = sy + cs * 0.3;
          break;
        case 'DOWN':
          ex1 = sx + cs * 0.3; ey1 = sy + cs * 0.7;
          ex2 = sx + cs * 0.7; ey2 = sy + cs * 0.7;
          break;
      }
      ctx.beginPath();
      ctx.arc(ex1, ey1, eyeSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex2, ey2, eyeSize, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  // Food
  if (state.food) {
    const fx = offsetX + state.food.x * cs + cs / 2;
    const fy = offsetY + state.food.y * cs + cs / 2;
    const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.1;
    ctx.fillStyle = theme.food;
    ctx.beginPath();
    ctx.arc(fx, fy, cs * 0.3 * pulse, 0, Math.PI * 2);
    ctx.fill();
  }

  // Particles
  updateParticles();
  drawParticles(ctx);

  // Update juice
  updateJuice();
}

function drawAmbient(ctx, theme) {
  if (theme.ambient === 'stars') {
    drawStars(ctx);
  } else if (theme.ambient === 'fire') {
    drawFireGlow(ctx);
  } else if (theme.ambient === 'nebula') {
    drawNebula(ctx);
  } else if (theme.ambient === 'gold') {
    drawGoldDust(ctx);
  }
}

function drawStars(ctx) {
  const t = Date.now() * 0.0005;
  for (const s of stars) {
    const flicker = 0.5 + Math.sin(t + s.x) * 0.5;
    ctx.fillStyle = `rgba(255, 255, 255, ${s.brightness * flicker})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFireGlow(ctx) {
  const t = Date.now() * 0.001;
  for (let i = 0; i < 5; i++) {
    const x = canvas.width * (0.1 + i * 0.2 + Math.sin(t + i) * 0.05);
    const y = canvas.height * (0.8 + Math.sin(t * 0.5 + i) * 0.1);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, 200);
    grad.addColorStop(0, 'rgba(255, 50, 0, 0.08)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, 200, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawNebula(ctx) {
  nebulaOffset += 0.2;
  const t = Date.now() * 0.0003;
  for (let i = 0; i < 3; i++) {
    const x = canvas.width * (0.2 + i * 0.3 + Math.sin(t + i * 2) * 0.1);
    const y = canvas.height * (0.3 + Math.cos(t + i * 1.5) * 0.2);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, 300);
    const colors = ['rgba(176, 132, 255, 0.06)', 'rgba(128, 80, 204, 0.05)', 'rgba(0, 255, 170, 0.04)'];
    grad.addColorStop(0, colors[i]);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, 300, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGoldDust(ctx) {
  const t = Date.now() * 0.001;
  for (let i = 0; i < 40; i++) {
    const x = (Math.sin(t * 0.3 + i * 0.5) * 0.5 + 0.5) * canvas.width;
    const y = (Math.cos(t * 0.2 + i * 0.7) * 0.5 + 0.5) * canvas.height;
    const size = 1 + Math.sin(t + i) * 1;
    ctx.fillStyle = `rgba(255, 215, 0, ${0.3 + Math.sin(t + i) * 0.2})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.5, size), 0, Math.PI * 2);
    ctx.fill();
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
