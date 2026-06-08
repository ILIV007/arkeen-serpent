import { state, THEMES } from '../core/state.js';
import { drawParticles, updateParticles } from './particles.js';
import { updateJuice, applyShake, applyFlash } from './juice.js';

let canvas, ctx;
let stars = [];
let meteors = [];
let fireflies = [];
let lastMeteorTime = 0;

export function initRenderer() {
  canvas = document.getElementById('gameCanvas');
  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  generateStars();
  generateFireflies();
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  state.canvasWidth = canvas.width;
  state.canvasHeight = canvas.height;
  const minDim = Math.min(canvas.width, canvas.height);
  state.cellSize = Math.floor(minDim / (state.gridSize + 2));
  generateStars();
  generateFireflies();
}

function generateStars() {
  stars = [];
  for (let i = 0; i < 120; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 0.5 + Math.random() * 2.5,
      speed: 0.02 + Math.random() * 0.2,
      brightness: 0.2 + Math.random() * 0.8,
      twinkleSpeed: 0.3 + Math.random() * 2,
      phase: Math.random() * Math.PI * 2,
    });
  }
}

function generateFireflies() {
  fireflies = [];
  for (let i = 0; i < 15; i++) {
    fireflies.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: 1 + Math.random() * 2,
      brightness: 0.3 + Math.random() * 0.7,
      phase: Math.random() * Math.PI * 2,
    });
  }
}

function rgba(arr, alpha) {
  if (alpha !== undefined) {
    return `rgba(${arr[0]}, ${arr[1]}, ${arr[2]}, ${alpha})`;
  }
  return `rgba(${arr[0]}, ${arr[1]}, ${arr[2]}, ${arr[3]})`;
}

export function render() {
  const theme = THEMES[state.settings.theme];
  ctx.save();
  applyShake(ctx);

  drawBackground(ctx, theme);
  drawAmbient(ctx, theme);

  if (state.mode === 'playing' || state.mode === 'paused' || state.mode === 'gameover') {
    drawGame(ctx, theme);
  } else if (state.mode === 'menu') {
    drawMenuBackground(ctx, theme);
  }

  applyFlash(ctx, canvas.width, canvas.height);
  ctx.restore();
}

function drawBackground(ctx, theme) {
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, theme.bgGradient[0]);
  grad.addColorStop(1, theme.bgGradient[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawMenuBackground(ctx, theme) {
  drawAmbient(ctx, theme);

  const t = Date.now() * 0.001;
  ctx.strokeStyle = theme.snakeTrail;
  ctx.globalAlpha = 0.12;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < 80; i++) {
    const x = canvas.width / 2 + Math.sin(t + i * 0.12) * 140 + Math.cos(t * 0.35 + i * 0.08) * 70;
    const y = canvas.height / 2 + Math.cos(t + i * 0.1) * 110 + Math.sin(t * 0.25 + i * 0.06) * 55;
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

  // ===== BOARD =====
  ctx.shadowColor = rgba(theme.snakeHeadGlow, 0.3);
  ctx.shadowBlur = 20;
  ctx.fillStyle = theme.boardBg;
  roundRect(ctx, offsetX - 4, offsetY - 4, gs * cs + 8, gs * cs + 8, 8);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = theme.boardBorder;
  ctx.lineWidth = 2;
  roundRect(ctx, offsetX - 4, offsetY - 4, gs * cs + 8, gs * cs + 8, 8);
  ctx.stroke();

  ctx.fillStyle = theme.boardBg;
  ctx.fillRect(offsetX, offsetY, gs * cs, gs * cs);

  // ===== GRID =====
  if (state.settings.grid) {
    ctx.strokeStyle = theme.gridStrong;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(offsetX, offsetY, gs * cs, gs * cs);

    ctx.strokeStyle = theme.grid;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.6;
    for (let i = 1; i < gs; i++) {
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

  // ===== OBSTACLES =====
  for (const obs of state.obstacles) {
    const ox = offsetX + obs.x * cs;
    const oy = offsetY + obs.y * cs;
    ctx.fillStyle = '#555';
    ctx.fillRect(ox + 2, oy + 2, cs - 4, cs - 4);
    ctx.fillStyle = '#777';
    ctx.fillRect(ox + 4, oy + 4, cs - 8, cs - 8);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ox + 4, oy + 4);
    ctx.lineTo(ox + cs - 4, oy + cs - 4);
    ctx.moveTo(ox + cs - 4, oy + 4);
    ctx.lineTo(ox + 4, oy + cs - 4);
    ctx.stroke();
  }

  // ===== SNAKE TRAIL =====
  if (state.snake.length > 1) {
    ctx.strokeStyle = theme.snakeTrail;
    ctx.lineWidth = cs * 0.3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i < state.snake.length; i++) {
      const sx = offsetX + state.snake[i].x * cs + cs / 2;
      const sy = offsetY + state.snake[i].y * cs + cs / 2;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  }

  // ===== FOOD GLOW =====
  if (state.food) {
    const fx = offsetX + state.food.x * cs + cs / 2;
    const fy = offsetY + state.food.y * cs + cs / 2;
    const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.2;

    const glowGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, cs * pulse * 1.8);
    glowGrad.addColorStop(0, rgba(theme.foodGlow, 0.3));
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(fx, fy, cs * pulse * 1.8, 0, Math.PI * 2);
    ctx.fill();

    const innerGlow = ctx.createRadialGradient(fx, fy, 0, fx, fy, cs * pulse * 0.8);
    innerGlow.addColorStop(0, rgba(theme.foodGlow, 0.6));
    innerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = innerGlow;
    ctx.beginPath();
    ctx.arc(fx, fy, cs * pulse * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // ===== SPECIAL FOOD =====
  if (state.specialFood) {
    const sx = offsetX + state.specialFood.x * cs + cs / 2;
    const sy = offsetY + state.specialFood.y * cs + cs / 2;
    const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.3;

    const glowGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, cs * pulse * 2);
    glowGrad.addColorStop(0, rgba(theme.specialFoodGlow, 0.4));
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(sx, sy, cs * pulse * 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = theme.specialFood;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(Date.now() * 0.003);
    drawStar(ctx, 0, 0, 5, cs * 0.35 * pulse, cs * 0.15 * pulse);
    ctx.fill();
    ctx.restore();
  }

  // ===== SNAKE - NEW SERPENT DESIGN =====
  drawSerpent(ctx, theme, offsetX, offsetY, cs);

  // ===== FOOD =====
  if (state.food) {
    const fx = offsetX + state.food.x * cs + cs / 2;
    const fy = offsetY + state.food.y * cs + cs / 2;
    const pulse = 1 + Math.sin(Date.now() * 0.005) * 0.1;

    ctx.fillStyle = theme.food;
    ctx.beginPath();
    ctx.arc(fx, fy, cs * 0.28 * pulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(fx - cs * 0.08, fy - cs * 0.08, cs * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  updateParticles();
  drawParticles(ctx);
  updateJuice();
}

function drawSerpent(ctx, theme, offsetX, offsetY, cs) {
  if (!state.snake || state.snake.length === 0) return;

  const snake = state.snake;
  const dir = state.direction;

  for (let i = snake.length - 1; i >= 0; i--) {
    const seg = snake[i];
    const sx = offsetX + seg.x * cs;
    const sy = offsetY + seg.y * cs;
    const isHead = i === 0;
    const isTail = i === snake.length - 1;

    let segSize;
    if (isHead) {
      segSize = cs * 0.92;
    } else if (isTail) {
      segSize = cs * 0.55;
    } else {
      const tailFactor = i / snake.length;
      segSize = cs * (0.78 - tailFactor * 0.15);
    }

    const pad = (cs - segSize) / 2;
    const cx = sx + cs / 2;
    const cy = sy + cs / 2;

    if (isHead) {
      const headGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, cs * 1.5);
      headGlow.addColorStop(0, rgba(theme.snakeHeadGlow, 0.25));
      headGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = headGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, cs * 1.5, 0, Math.PI * 2);
      ctx.fill();

      const headGrad = ctx.createRadialGradient(
        cx - cs * 0.15, cy - cs * 0.15, 0,
        cx, cy, segSize / 2
      );
      headGrad.addColorStop(0, lightenColor(theme.snakeHead, 35));
      headGrad.addColorStop(0.6, theme.snakeHead);
      headGrad.addColorStop(1, darkenColor(theme.snakeHead, 20));

      ctx.fillStyle = headGrad;
      ctx.shadowColor = theme.snakeHead;
      ctx.shadowBlur = 8;
      roundRect(ctx, sx + pad, sy + pad, segSize, segSize, cs * 0.22);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.beginPath();
      ctx.ellipse(cx - cs * 0.1, cy - cs * 0.1, segSize * 0.25, segSize * 0.15, -0.3, 0, Math.PI * 2);
      ctx.fill();

      drawEyes(ctx, cx, cy, cs, dir, theme);
      drawTongue(ctx, cx, cy, cs, dir, theme);

    } else {
      const bodyAlpha = isTail ? 0.6 : 0.75 + (1 - i / snake.length) * 0.25;
      ctx.globalAlpha = bodyAlpha;

      const bodyGrad = ctx.createRadialGradient(
        cx - cs * 0.05, cy - cs * 0.05, 0,
        cx, cy, segSize / 2
      );

      if (i === 1) {
        bodyGrad.addColorStop(0, lightenColor(theme.snakeBody, 15));
        bodyGrad.addColorStop(1, theme.snakeBody);
      } else {
        bodyGrad.addColorStop(0, theme.snakeBody);
        bodyGrad.addColorStop(1, theme.snakeBodyFade);
      }

      ctx.fillStyle = bodyGrad;

      const cornerRadius = isTail ? cs * 0.35 : cs * 0.18;
      roundRect(ctx, sx + pad, sy + pad, segSize, segSize, cornerRadius);
      ctx.fill();

      if (!isTail && segSize > cs * 0.5) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        const scaleSize = segSize * 0.18;
        ctx.beginPath();
        ctx.arc(cx, cy, scaleSize, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
    }
  }
}

function drawEyes(ctx, cx, cy, cs, dir, theme) {
  const eyeSize = cs * 0.11;
  const eyeOffset = cs * 0.22;
  let ex1, ey1, ex2, ey2;

  switch (dir) {
    case 'RIGHT':
      ex1 = cx + eyeOffset; ey1 = cy - cs * 0.12;
      ex2 = cx + eyeOffset; ey2 = cy + cs * 0.12;
      break;
    case 'LEFT':
      ex1 = cx - eyeOffset; ey1 = cy - cs * 0.12;
      ex2 = cx - eyeOffset; ey2 = cy + cs * 0.12;
      break;
    case 'UP':
      ex1 = cx - cs * 0.12; ey1 = cy - eyeOffset;
      ex2 = cx + cs * 0.12; ey2 = cy - eyeOffset;
      break;
    case 'DOWN':
      ex1 = cx - cs * 0.12; ey1 = cy + eyeOffset;
      ex2 = cx + cs * 0.12; ey2 = cy + eyeOffset;
      break;
  }

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(ex1, ey1, eyeSize, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ex2, ey2, eyeSize, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#000';
  const pupilOffset = cs * 0.03;
  let px = 0, py = 0;
  switch (dir) {
    case 'RIGHT': px = pupilOffset; break;
    case 'LEFT': px = -pupilOffset; break;
    case 'UP': py = -pupilOffset; break;
    case 'DOWN': py = pupilOffset; break;
  }

  ctx.beginPath();
  ctx.arc(ex1 + px, ey1 + py, eyeSize * 0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ex2 + px, ey2 + py, eyeSize * 0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(ex1 - eyeSize * 0.2, ey1 - eyeSize * 0.2, eyeSize * 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ex2 - eyeSize * 0.2, ey2 - eyeSize * 0.2, eyeSize * 0.25, 0, Math.PI * 2);
  ctx.fill();
}

function drawTongue(ctx, cx, cy, cs, dir, theme) {
  const tongueLen = cs * 0.45;
  const tongueWidth = cs * 0.06;
  let tx = cx, ty = cy;
  let angle = 0;

  switch (dir) {
    case 'RIGHT': tx += cs * 0.5; angle = 0; break;
    case 'LEFT': tx -= cs * 0.5; angle = Math.PI; break;
    case 'UP': ty -= cs * 0.5; angle = -Math.PI / 2; break;
    case 'DOWN': ty += cs * 0.5; angle = Math.PI / 2; break;
  }

  const flicker = Math.sin(Date.now() * 0.015) > 0.3;
  if (!flicker) return;

  ctx.save();
  ctx.translate(tx, ty);
  ctx.rotate(angle);

  ctx.fillStyle = '#ff6b6b';
  ctx.beginPath();
  ctx.roundRect(0, -tongueWidth / 2, tongueLen * 0.7, tongueWidth, tongueWidth / 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(tongueLen * 0.7, -tongueWidth * 0.8);
  ctx.lineTo(tongueLen, -tongueWidth * 0.3);
  ctx.lineTo(tongueLen * 0.7, 0);
  ctx.lineTo(tongueLen, tongueWidth * 0.3);
  ctx.lineTo(tongueLen * 0.7, tongueWidth * 0.8);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawAmbient(ctx, theme) {
  if (theme.ambient === 'stars') {
    drawStars(ctx, theme);
  } else if (theme.ambient === 'embers') {
    drawEmbers(ctx, theme);
  } else if (theme.ambient === 'fireflies') {
    drawFirefliesEffect(ctx, theme);
  } else if (theme.ambient === 'gold_dust') {
    drawGoldDust(ctx, theme);
  } else if (theme.ambient === 'moon') {
    drawMoon(ctx, theme);
  }
  drawMeteors(ctx, theme);
}

function drawStars(ctx, theme) {
  const t = Date.now() * 0.0005;
  for (const s of stars) {
    const flicker = 0.5 + Math.sin(t * s.twinkleSpeed + s.phase) * 0.5;
    const alpha = s.brightness * flicker;
    ctx.fillStyle = rgba(theme.starColor, alpha);
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();

    if (alpha > 0.7 && s.size > 1.5) {
      ctx.strokeStyle = rgba(theme.starColor, alpha * 0.5);
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(s.x - s.size * 2, s.y);
      ctx.lineTo(s.x + s.size * 2, s.y);
      ctx.moveTo(s.x, s.y - s.size * 2);
      ctx.lineTo(s.x, s.y + s.size * 2);
      ctx.stroke();
    }
  }
}

function drawEmbers(ctx, theme) {
  const t = Date.now() * 0.001;
  for (let i = 0; i < 8; i++) {
    const x = canvas.width * (0.1 + i * 0.12 + Math.sin(t + i) * 0.05);
    const y = canvas.height * (0.85 + Math.sin(t * 0.5 + i) * 0.1);
    const grad = ctx.createRadialGradient(x, y, 0, x, y, 150);
    grad.addColorStop(0, 'rgba(255, 80, 0, 0.06)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, 150, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 20; i++) {
    const x = (Math.sin(t * 0.2 + i * 0.8) * 0.5 + 0.5) * canvas.width;
    const y = canvas.height - (t * 30 + i * 50) % canvas.height;
    const alpha = 0.3 + Math.sin(t + i) * 0.2;
    ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, 1 + Math.sin(t + i) * 1, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawFirefliesEffect(ctx, theme) {
  const t = Date.now() * 0.001;
  for (const f of fireflies) {
    f.x += f.vx + Math.sin(t + f.phase) * 0.3;
    f.y += f.vy + Math.cos(t + f.phase) * 0.3;

    if (f.x < 0) f.x = canvas.width;
    if (f.x > canvas.width) f.x = 0;
    if (f.y < 0) f.y = canvas.height;
    if (f.y > canvas.height) f.y = 0;

    const flicker = 0.3 + Math.sin(t * 2 + f.phase) * 0.3;
    ctx.fillStyle = `rgba(52, 211, 153, ${flicker})`;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
    ctx.fill();

    const glow = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 4);
    glow.addColorStop(0, `rgba(52, 211, 153, ${flicker * 0.3})`);
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.size * 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGoldDust(ctx, theme) {
  const t = Date.now() * 0.001;
  for (let i = 0; i < 50; i++) {
    const x = (Math.sin(t * 0.3 + i * 0.5) * 0.5 + 0.5) * canvas.width;
    const y = (Math.cos(t * 0.2 + i * 0.7) * 0.5 + 0.5) * canvas.height;
    const size = 1 + Math.sin(t + i) * 1;
    const alpha = 0.2 + Math.sin(t + i) * 0.15;
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, Math.max(0.5, size), 0, Math.PI * 2);
    ctx.fill();
  }
}

// FIX: New moon ambient with a glowing moon in the sky
function drawMoon(ctx, theme) {
  drawStars(ctx, theme);

  const t = Date.now() * 0.0003;
  const moonX = canvas.width * 0.75 + Math.sin(t) * 20;
  const moonY = canvas.height * 0.2 + Math.cos(t * 0.7) * 10;
  const moonRadius = Math.min(canvas.width, canvas.height) * 0.12;

  // Outer glow
  const glowGrad = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.5, moonX, moonY, moonRadius * 3);
  glowGrad.addColorStop(0, 'rgba(220, 230, 255, 0.15)');
  glowGrad.addColorStop(0.5, 'rgba(200, 210, 240, 0.05)');
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius * 3, 0, Math.PI * 2);
  ctx.fill();

  // Moon body
  const moonGrad = ctx.createRadialGradient(moonX - moonRadius * 0.2, moonY - moonRadius * 0.2, 0, moonX, moonY, moonRadius);
  moonGrad.addColorStop(0, 'rgba(250, 250, 255, 0.9)');
  moonGrad.addColorStop(0.8, 'rgba(230, 235, 245, 0.7)');
  moonGrad.addColorStop(1, 'rgba(210, 220, 235, 0.4)');
  ctx.fillStyle = moonGrad;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
  ctx.fill();

  // Moon craters (subtle)
  ctx.fillStyle = 'rgba(180, 190, 210, 0.15)';
  ctx.beginPath();
  ctx.arc(moonX - moonRadius * 0.2, moonY + moonRadius * 0.1, moonRadius * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(moonX + moonRadius * 0.3, moonY - moonRadius * 0.2, moonRadius * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(moonX + moonRadius * 0.1, moonY + moonRadius * 0.35, moonRadius * 0.12, 0, Math.PI * 2);
  ctx.fill();
}

function drawMeteors(ctx, theme) {
  const now = Date.now();

  if (now - lastMeteorTime > 10000 + Math.random() * 5000) {
    lastMeteorTime = now;
    meteors.push({
      x: Math.random() * canvas.width,
      y: -50,
      vx: (Math.random() - 0.3) * 3,
      vy: 4 + Math.random() * 3,
      length: 30 + Math.random() * 50,
      life: 60,
      maxLife: 60,
    });
  }

  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i];
    m.x += m.vx;
    m.y += m.vy;
    m.life--;

    if (m.life <= 0 || m.y > canvas.height + 100) {
      meteors.splice(i, 1);
      continue;
    }

    const alpha = m.life / m.maxLife;
    const tailX = m.x - m.vx * (m.length / 5);
    const tailY = m.y - m.vy * (m.length / 5);

    const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
    grad.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    grad.addColorStop(0.5, `rgba(255, 215, 0, ${alpha * 0.6})`);
    grad.addColorStop(1, 'transparent');

    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(m.x, m.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();

    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(m.x, m.y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
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

function lightenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

function darkenColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}
