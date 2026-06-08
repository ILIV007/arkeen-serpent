/**
 * RENDERER — Arkeen Serpent
 * Pure visual layer. No game logic. Reads from state only.
 */
import { state } from '../core/state.js';
import { CONFIG } from '../core/config.js';
import * as Particles from './particles.js';

const COLS = CONFIG.COLS, ROWS = CONFIG.ROWS, PX = CONFIG.PX;
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
cv.width = COLS * PX; cv.height = ROWS * PX;
ctx.imageSmoothingEnabled = false;

let time = 0;
let shake = { x: 0, y: 0, intensity: 0 };
let floatingTexts = [];
let stars = [];

function initStars() {
  stars = [];
  for (let i = 0; i < 80; i++) {
    stars.push({
      x: Math.random() * (COLS * PX),
      y: Math.random() * (ROWS * PX),
      size: 0.5 + Math.random() * 1.5,
      twinkle: Math.random() * Math.PI * 2,
      speed: 0.2 + Math.random() * 0.5
    });
  }
}
initStars();

function getTheme() { return CONFIG.themes[state.settings.theme] || CONFIG.themes.space; }

export function triggerShake(intensity = 3) {
  shake.intensity = intensity;
}

function updateShake() {
  if (shake.intensity > 0) {
    shake.x = (Math.random() - 0.5) * shake.intensity;
    shake.y = (Math.random() - 0.5) * shake.intensity;
    shake.intensity *= 0.9;
    if (shake.intensity < 0.5) shake.intensity = 0;
  } else { shake.x = 0; shake.y = 0; }
}

export function addFloatingText(x, y, text, color = '#f0d080', life = 40) {
  floatingTexts.push({ x, y, text, color, life, maxLife: life, vy: -1 });
}

function updateFloatingTexts() {
  floatingTexts = floatingTexts.filter(t => {
    t.y += t.vy; t.vy *= 0.95; t.life--;
    return t.life > 0;
  });
}

function drawFloatingTexts() {
  floatingTexts.forEach(t => {
    const a = t.life / t.maxLife;
    ctx.globalAlpha = a;
    ctx.fillStyle = t.color;
    ctx.font = 'bold 10px monospace';
    ctx.fillText(t.text, t.x, t.y);
  });
  ctx.globalAlpha = 1;
}

// ===== BACKGROUND =====
function drawBackground() {
  const p = getTheme();
  ctx.fillStyle = p.bg; ctx.fillRect(0, 0, cv.width, cv.height);

  // Stars
  stars.forEach(s => {
    const tw = Math.sin(time * 2 + s.twinkle) * 0.5 + 0.5;
    ctx.fillStyle = `rgba(200,210,255,${0.3 + tw * 0.7})`;
    ctx.fillRect(s.x + shake.x, s.y + shake.y, s.size, s.size);
  });

  // Nebula dust
  ctx.fillStyle = p.gold + '08';
  for (let i = 0; i < 15; i++) {
    const dx = ((time * 3 + i * 137) % (COLS * PX));
    const dy = ((time * 1.5 + i * 89) % (ROWS * PX));
    ctx.fillRect(dx, dy, 2, 2);
  }
}

// ===== TILES =====
function drawTile(c, r, type) {
  const p = getTheme();
  const x = c * PX + shake.x, y = r * PX + shake.y;
  if (type === 'border') {
    ctx.fillStyle = p.border; ctx.fillRect(x, y, PX, PX);
    if ((c + r) % 4 === 0) {
      ctx.fillStyle = p.gold;
      ctx.fillRect(x + PX / 2 - 1, y + PX / 2 - 1, 2, 2);
    }
    return;
  }
  ctx.fillStyle = p.tile1; ctx.fillRect(x, y, PX, PX);
  if ((c + r) % 2 === 0) { ctx.fillStyle = p.tile2; ctx.fillRect(x + 1, y + 1, PX - 2, PX - 2); }
  if (type === 'patternA') {
    ctx.fillStyle = p.gold + '22';
    ctx.fillRect(x + PX / 2 - 1, y + 2, 2, PX - 4);
    ctx.fillRect(x + 2, y + PX / 2 - 1, PX - 4, 2);
  } else if (type === 'patternB') {
    ctx.fillStyle = p.accent + '33';
    ctx.fillRect(x + PX / 2 - 1, y + 1, 2, 2);
    ctx.fillRect(x + 1, y + PX / 2 - 1, 2, 2);
    ctx.fillRect(x + PX - 3, y + PX / 2 - 1, 2, 2);
    ctx.fillRect(x + PX / 2 - 1, y + PX - 3, 2, 2);
  }
}

function drawGrid() {
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      drawTile(c, r, state.tiles[r]?.[c] || 'normal');
}

// ===== PITS =====
function drawPits() {
  state.pits.forEach(pit => {
    const x = pit.x * PX + shake.x, y = pit.y * PX + shake.y;
    if (pit.state === 'warning') {
      const pulse = Math.sin(time * 8) * 0.3 + 0.5;
      ctx.strokeStyle = `rgba(255,60,60,${pulse})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 1, y + 1, PX - 2, PX - 2);
      ctx.fillStyle = `rgba(255,60,60,${pulse * 0.15})`;
      ctx.fillRect(x + 2, y + 2, PX - 4, PX - 4);
    } else if (pit.state === 'open') {
      ctx.fillStyle = '#000';
      ctx.fillRect(x + 1, y + 1, PX - 2, PX - 2);
      const glow = Math.sin(time * 3) * 0.2 + 0.3;
      ctx.strokeStyle = `rgba(128,0,200,${glow})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 1, y + 1, PX - 2, PX - 2);
      ctx.fillStyle = `rgba(128,0,200,${glow * 0.5})`;
      ctx.fillRect(x + PX / 2 - 1, y + 2, 1, 1);
      ctx.fillRect(x + PX - 3, y + PX / 2 - 1, 1, 1);
      ctx.fillRect(x + 2, y + PX - 3, 1, 1);
      ctx.fillRect(x + PX / 2 - 1, y + PX - 3, 1, 1);
    }
  });
}

// ===== METEORS =====
function drawMeteors() {
  state.meteors.forEach(m => {
    const mx = m.x + shake.x, my = m.y + shake.y;
    ctx.fillStyle = `rgba(255,120,40,${m.life / m.maxLife * 0.4})`;
    for (let i = 1; i <= 3; i++) ctx.fillRect(mx - m.vx * i * 2, my - m.vy * i * 2, 2, 2);
    ctx.fillStyle = '#ff8040';
    ctx.fillRect(mx, my, 3, 3);
    ctx.fillStyle = '#fff';
    ctx.fillRect(mx, my, 1, 1);
  });
}

// ===== APPLE =====
function drawApple() {
  if (!state.apple) return;
  const p = getTheme();
  const c = state.apple.x, r = state.apple.y;
  const x = c * PX + shake.x, y = r * PX + shake.y;
  const pulse = Math.sin(time * 4) * 0.5 + 0.5;
  const type = state.apple.type;
  const glowColor = type === 'golden' ? 'rgba(255,200,40,' : type === 'poison' ? 'rgba(128,40,200,' : 'rgba(200,40,40,';
  ctx.fillStyle = glowColor + (0.15 + pulse * 0.1) + ')';
  ctx.fillRect(x - 2, y - 2, PX + 4, PX + 4);

  if (type === 'golden') {
    ctx.fillStyle = '#e0c020'; ctx.fillRect(x + 2, y + 2, PX - 4, PX - 4);
    ctx.fillStyle = '#f0e080'; ctx.fillRect(x + 3, y + 3, PX - 6, PX - 6);
    ctx.fillStyle = '#fff'; ctx.fillRect(x + 4, y + 4, 3, 2);
  } else if (type === 'poison') {
    ctx.fillStyle = '#8040c0'; ctx.fillRect(x + 2, y + 2, PX - 4, PX - 4);
    ctx.fillStyle = '#a060e0'; ctx.fillRect(x + 3, y + 3, PX - 6, PX - 6);
    ctx.fillStyle = '#40ff40'; ctx.fillRect(x + 4, y + 4, 2, 2); ctx.fillRect(x + 8, y + 6, 2, 2);
  } else {
    ctx.fillStyle = '#c02020'; ctx.fillRect(x + 2, y + 3, PX - 4, PX - 5);
    ctx.fillStyle = '#e03030'; ctx.fillRect(x + 3, y + 2, PX - 6, PX - 4);
    ctx.fillStyle = '#ff6060'; ctx.fillRect(x + 3, y + 3, 3, 2);
    ctx.fillStyle = '#f0d040'; ctx.fillRect(x + 4, y + 6, 2, 2); ctx.fillRect(x + 8, y + 5, 2, 2);
  }
  ctx.fillStyle = type === 'poison' ? '#40ff40' : '#3a6020';
  ctx.fillRect(x + PX / 2, y, 1, 3);
}

// ===== SNAKE =====
function drawSnake() {
  const p = getTheme();
  for (let i = state.snake.length - 1; i >= 0; i--) {
    const seg = state.snake[i];
    const x = seg.x * PX + shake.x, y = seg.y * PX + shake.y;
    const t = i / Math.max(state.snake.length, 1);
    const h = p.snakeH + t * 20;
    const s = p.snakeS - t * 10;
    const l = p.snakeL - t * 12;
    const col = `hsl(${h},${s}%,${l}%)`;
    const dark = `hsl(${h},${s}%,${l - 10}%)`;
    ctx.fillStyle = col; ctx.fillRect(x + 1, y + 1, PX - 2, PX - 2);
    ctx.fillStyle = dark;
    if (i % 2 === 0) {
      ctx.fillRect(x + 2, y + 2, PX / 2 - 2, PX / 2 - 2);
      ctx.fillRect(x + PX / 2, y + PX / 2, PX / 2 - 2, PX / 2 - 2);
    } else {
      ctx.fillRect(x + PX / 2, y + 2, PX / 2 - 2, PX / 2 - 2);
      ctx.fillRect(x + 2, y + PX / 2, PX / 2 - 2, PX / 2 - 2);
    }
    if (i === 0) {
      ctx.fillStyle = p.gold;
      ctx.fillRect(x + 1, y, PX - 2, 1); ctx.fillRect(x + 1, y + PX - 1, PX - 2, 1);
      ctx.fillRect(x, y + 1, 1, PX - 2); ctx.fillRect(x + PX - 1, y + 1, 1, PX - 2);
      ctx.fillStyle = '#f0c030';
      const ex1 = state.dir.x === 0 ? x + 3 : state.dir.x > 0 ? x + PX - 5 : x + 1;
      const ey1 = state.dir.y === 0 ? y + 3 : state.dir.y > 0 ? y + PX - 5 : y + 1;
      const ex2 = state.dir.x === 0 ? x + PX - 6 : ex1;
      const ey2 = state.dir.y === 0 ? y + PX - 6 : ey1;
      ctx.fillRect(ex1, ey1, 3, 3); ctx.fillRect(ex2, ey2, 3, 3);
      ctx.fillStyle = '#100'; ctx.fillRect(ex1 + 1, ey1 + 1, 1, 1); ctx.fillRect(ex2 + 1, ey2 + 1, 1, 1);
      ctx.fillStyle = '#e02020'; ctx.fillRect(x + PX / 2 - 1, y + PX / 2 - 1, 2, 2);
    }
  }
}

// ===== OBSTACLES =====
function drawObstacles() {
  state.obstacles.forEach(o => {
    const x = o.x * PX + shake.x, y = o.y * PX + shake.y;
    ctx.fillStyle = '#2a2a3a'; ctx.fillRect(x + 1, y + 1, PX - 2, PX - 2);
    ctx.fillStyle = '#4a4a5a'; ctx.fillRect(x + 3, y + 3, PX - 6, PX - 6);
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(x + 2, y + 2, 3, 3);
  });
}

// ===== ENEMIES =====
function drawEnemies() {
  state.enemies.forEach(e => {
    const x = e.x * PX + shake.x, y = e.y * PX + shake.y;
    ctx.fillStyle = '#c04040'; ctx.fillRect(x + 2, y + 2, PX - 4, PX - 4);
    ctx.fillStyle = '#ff6060'; ctx.fillRect(x + 3, y + 3, 2, 2);
    ctx.fillRect(x + PX - 5, y + 3, 2, 2);
  });
}

// ===== MAIN FRAME =====
export function draw() {
  time += 0.016;
  updateShake();
  Particles.update();
  updateFloatingTexts();

  drawBackground();
  drawGrid();
  drawPits();
  drawObstacles();
  drawEnemies();
  drawApple();
  drawMeteors();
  drawSnake();
  Particles.draw(ctx);
  drawFloatingTexts();
}

export { ctx, cv, getTheme, addFloatingText };
