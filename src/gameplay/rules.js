/**
 * RULES — Arkeen Serpent
 * All game logic: collision, food, scoring, combo, level up.
 * No rendering. Emits events for audio/visual feedback.
 */
import { state } from '../core/state.js';
import { CONFIG } from '../core/config.js';
import { emit } from '../utils/events.js';

const FOOD_TYPES = {
  normal: { score: 1, color: 'red' },
  golden: { score: 10, color: 'gold' },
  poison: { score: -3, color: 'purple' }
};

export function getActiveRules() {
  if (state.mode === 'adventure') {
    const s = state.score;
    const adv = CONFIG.adventure;
    return {
      poison: s >= adv.poison,
      golden: s >= adv.golden,
      obstacle: s >= adv.obstacle,
      movingObs: s >= adv.movingObs,
      pits: s >= adv.pits,
      enemy: s >= adv.enemy,
      trap: s >= adv.trap
    };
  }
  const d = CONFIG.difficulty[state.settings.difficulty] || CONFIG.difficulty.normal;
  return { poison: d.poison, golden: true, obstacle: d.obstacle, movingObs: d.movingObs, pits: d.pits, enemy: d.enemy, trap: d.trap };
}

export function generateTiles() {
  state.tiles = [];
  for (let r = 0; r < CONFIG.ROWS; r++) {
    state.tiles[r] = [];
    for (let c = 0; c < CONFIG.COLS; c++) {
      if (r === 0 || r === CONFIG.ROWS - 1 || c === 0 || c === CONFIG.COLS - 1) state.tiles[r][c] = 'border';
      else if ((c + r) % 6 === 0) state.tiles[r][c] = 'patternA';
      else if ((c * 2 + r * 3) % 7 === 0) state.tiles[r][c] = 'patternB';
      else state.tiles[r][c] = 'normal';
    }
  }
}

export function spawnApple() {
  const rules = getActiveRules();
  const available = [];
  for (let r = 1; r < CONFIG.ROWS - 1; r++) {
    for (let c = 1; c < CONFIG.COLS - 1; c++) {
      if (state.snake.some(s => s.x === c && s.y === r)) continue;
      if (state.obstacles.some(o => o.x === c && o.y === r)) continue;
      if (state.pits.some(p => p.x === c && p.y === r && p.state === 'open')) continue;
      available.push({ x: c, y: r });
    }
  }
  if (available.length === 0) return;
  const pos = available[Math.floor(Math.random() * available.length)];
  let type = 'normal';
  if (rules.golden && state.goldenTimer <= 0 && Math.random() < 0.12) type = 'golden';
  else if (rules.poison && Math.random() < 0.1) type = 'poison';
  state.apple = { x: pos.x, y: pos.y, type };
  if (type === 'golden') state.goldenTimer = CONFIG.pits.spawnInterval;
}

export function checkFood() {
  if (!state.apple) return false;
  const head = state.snake[0];
  if (head.x !== state.apple.x || head.y !== state.apple.y) return false;

  const type = state.apple.type;
  const food = FOOD_TYPES[type];
  let points = food.score;

  if (type === 'golden') emit('EAT_GOLDEN');
  else if (type === 'poison') emit('EAT_POISON');
  else emit('EAT');

  // Combo logic
  if (type !== 'poison' && points > 0) {
    if (state.comboTimer > 0) {
      state.combo++;
      if (state.combo > state.bestCombo) state.bestCombo = state.combo;
      if (state.combo >= 2) {
        const mult = Math.min(state.combo, CONFIG.combo.maxMult);
        points *= mult;
        emit('COMBO', { mult, x: head.x, y: head.y });
      }
    } else {
      state.combo = 1;
    }
    state.comboTimer = CONFIG.combo.window;
  } else {
    state.combo = 0;
  }

  state.score += points;
  state.xp += CONFIG.xp.perApple;
  state.applesEaten++;

  // Level up
  const needed = state.level * CONFIG.xp.levelBase;
  if (state.xp >= needed) {
    state.level++;
    state.xp -= needed;
    emit('LEVEL_UP', { level: state.level });
  }

  spawnApple();
  return true;
}

export function checkCollision() {
  const head = state.snake[0];
  // Wall
  if (head.x <= 0 || head.x >= CONFIG.COLS - 1 || head.y <= 0 || head.y >= CONFIG.ROWS - 1) {
    emit('GAME_OVER'); return true;
  }
  // Self
  for (let i = 1; i < state.snake.length; i++) {
    if (head.x === state.snake[i].x && head.y === state.snake[i].y) {
      emit('GAME_OVER'); return true;
    }
  }
  // Obstacle
  if (state.obstacles.some(o => o.x === head.x && o.y === head.y)) {
    emit('GAME_OVER'); return true;
  }
  // Enemy
  if (state.enemies.some(e => e.x === head.x && e.y === head.y)) {
    emit('GAME_OVER'); return true;
  }
  // Open pit
  if (state.pits.some(p => p.x === head.x && p.y === head.y && p.state === 'open')) {
    emit('GAME_OVER'); return true;
  }
  return false;
}

export function spawnObstacle() {
  const rules = getActiveRules();
  if (!rules.obstacle || state.obstacles.length >= 5) return;
  let attempts = 0;
  while (attempts++ < 50) {
    const c = 2 + Math.floor(Math.random() * (CONFIG.COLS - 4));
    const r = 2 + Math.floor(Math.random() * (CONFIG.ROWS - 4));
    if (state.snake.some(s => s.x === c && s.y === r)) continue;
    if (state.apple && state.apple.x === c && state.apple.y === r) continue;
    if (state.obstacles.some(o => o.x === c && o.y === r)) continue;
    if (state.pits.some(p => p.x === c && p.y === r)) continue;
    state.obstacles.push({ x: c, y: r, moving: false });
    break;
  }
}

export function spawnEnemy() {
  const rules = getActiveRules();
  if (!rules.enemy || state.enemies.length >= 2) return;
  const edge = Math.floor(Math.random() * 4);
  let ex, ey;
  if (edge === 0) { ex = 1; ey = Math.floor(Math.random() * (CONFIG.ROWS - 2)) + 1; }
  else if (edge === 1) { ex = CONFIG.COLS - 2; ey = Math.floor(Math.random() * (CONFIG.ROWS - 2)) + 1; }
  else if (edge === 2) { ex = Math.floor(Math.random() * (CONFIG.COLS - 2)) + 1; ey = 1; }
  else { ex = Math.floor(Math.random() * (CONFIG.COLS - 2)) + 1; ey = CONFIG.ROWS - 2; }
  state.enemies.push({ x: ex, y: ey, timer: 0 });
}

export function updateEnemies() {
  state.enemies.forEach(e => {
    e.timer++;
    if (e.timer < 8) return;
    e.timer = 0;
    const head = state.snake[0];
    const dx = head.x - e.x, dy = head.y - e.y;
    let mx = 0, my = 0;
    if (Math.abs(dx) > Math.abs(dy)) mx = dx > 0 ? 1 : -1;
    else my = dy > 0 ? 1 : -1;
    const nx = e.x + mx, ny = e.y + my;
    if (state.snake.some(s => s.x === nx && s.y === ny)) return;
    e.x = nx; e.y = ny;
  });
}

export function updateObstacles() {
  const rules = getActiveRules();
  state.obstacles.forEach(o => {
    if (!o.moving || !rules.movingObs) return;
    if (Math.random() > 0.05) return;
    const dirs = [{ x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }];
    const d = dirs[Math.floor(Math.random() * dirs.length)];
    const nx = o.x + d.x, ny = o.y + d.y;
    if (nx <= 0 || nx >= CONFIG.COLS - 1 || ny <= 0 || ny >= CONFIG.ROWS - 1) return;
    if (state.snake.some(s => s.x === nx && s.y === ny)) return;
    if (state.apple && state.apple.x === nx && state.apple.y === ny) return;
    if (state.pits.some(p => p.x === nx && p.y === ny && p.state === 'open')) return;
    o.x = nx; o.y = ny;
  });
}

export function updatePits() {
  const rules = getActiveRules();
  if (!rules.pits) return;

  state.pitTimer++;
  if (state.pitTimer >= CONFIG.pits.spawnInterval && state.pits.length < CONFIG.pits.maxActive) {
    state.pitTimer = 0;
    let attempts = 0;
    while (attempts++ < 50) {
      const c = 3 + Math.floor(Math.random() * (CONFIG.COLS - 6));
      const r = 3 + Math.floor(Math.random() * (CONFIG.ROWS - 6));
      if (state.snake.some(s => s.x === c && s.y === r)) continue;
      if (state.apple && state.apple.x === c && state.apple.y === r) continue;
      if (state.obstacles.some(o => o.x === c && o.y === r)) continue;
      if (state.pits.some(p => p.x === c && p.y === r)) continue;
      state.pits.push({ x: c, y: r, state: 'warning', timer: 0, maxTimer: CONFIG.pits.warning + CONFIG.pits.duration });
      emit('PIT_WARNING');
      break;
    }
  }

  state.pits = state.pits.filter(p => {
    p.timer++;
    if (p.state === 'warning' && p.timer >= CONFIG.pits.warning) {
      p.state = 'open';
      emit('PIT_OPEN');
    }
    if (p.state === 'open' && p.timer >= p.maxTimer) return false;
    return true;
  });
}

export function updateMeteors() {
  const cfg = CONFIG.meteors;
  if (Math.random() < cfg.spawnRate) {
    const mx = 10 + Math.random() * (CONFIG.COLS * CONFIG.PX - 20);
    const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.5;
    const speed = cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin);
    state.meteors.push({
      x: mx, y: -5,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: cfg.life, maxLife: cfg.life
    });
  }

  state.meteors = state.meteors.filter(m => {
    m.x += m.vx; m.y += m.vy; m.life--;
    const head = state.snake[0];
    const hx = head.x * CONFIG.PX, hy = head.y * CONFIG.PX;
    if (Math.abs(m.x - hx - CONFIG.PX / 2) < 6 && Math.abs(m.y - hy - CONFIG.PX / 2) < 6) {
      emit('GAME_OVER'); return false;
    }
    return m.life > 0 && m.y < CONFIG.ROWS * CONFIG.PX + 10;
  });
}

export function getSpeed() {
  const base = CONFIG.difficulty[state.settings.difficulty]?.speed || CONFIG.difficulty.normal.speed;
  return Math.max(base * 0.6, base - state.score * 1.5);
}
