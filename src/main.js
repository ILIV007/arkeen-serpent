/**
 * MAIN — Arkeen Serpent
 * Wires core, systems, gameplay, render, ui together.
 */
import { state, resetState } from './core/state.js';
import { CONFIG } from './core/config.js';
import { startLoop, stopLoop } from './core/loop.js';
import { initInput, consumeDir, resetInput } from './systems/input.js';
import { Audio } from './systems/audio.js';
import { Leaderboard, Stats, Settings } from './systems/storage.js';
import { initScreens, show } from './ui/screens.js';
import { initMenu, updateHUD, showGameOver, checkHighScore, setGameMode } from './ui/menu.js';
import { draw, triggerShake, addFloatingText } from './render/renderer.js';
import * as Particles from './render/particles.js';
import { moveSnake, shrinkTail } from './gameplay/snake.js';
import {
  generateTiles, spawnApple, checkFood, checkCollision,
  spawnObstacle, spawnEnemy, updateEnemies, updateObstacles,
  updatePits, updateMeteors, getActiveRules, getSpeed
} from './gameplay/rules.js';
import { on } from './utils/events.js';

let gameInitialized = false;

// ===== EVENT HOOKS =====
on('EAT', () => {
  Audio.playEat();
  const head = state.snake[0];
  Particles.spawn(head.x * CONFIG.PX + CONFIG.PX / 2, head.y * CONFIG.PX + CONFIG.PX / 2, '#ff4040', 8, 3);
});

on('EAT_GOLDEN', () => {
  Audio.playGolden();
  triggerShake(4);
  const head = state.snake[0];
  Particles.spawn(head.x * CONFIG.PX + CONFIG.PX / 2, head.y * CONFIG.PX + CONFIG.PX / 2, '#ffd700', 15, 4);
});

on('EAT_POISON', () => {
  Audio.playPoison();
  triggerShake(2);
});

on('COMBO', ({ mult, x, y }) => {
  Audio.playCombo(Math.min(mult, 4));
  if (mult >= 3) triggerShake(3);
  addFloatingText(x * CONFIG.PX, y * CONFIG.PX, `COMBO x${mult}`, '#ff6040', 40);
});

on('LEVEL_UP', ({ level }) => {
  Audio.playLevelUp();
  const head = state.snake[0];
  addFloatingText(head.x * CONFIG.PX, head.y * CONFIG.PX, 'LEVEL UP!', '#ffd700', 50);
});

on('PIT_WARNING', () => Audio.playPitWarning());
on('PIT_OPEN', () => Audio.playPitOpen());

on('GAME_OVER', () => {
  state.running = false;
  state.gameOver = true;
  Audio.playGameOver();
  triggerShake(5);
  Audio.stopAmbient();

  const finalScore = Math.max(0, state.score);
  const playTime = Math.floor((Date.now() - state.startTime) / 1000);
  Stats.addGame(finalScore, state.applesEaten, state.bestCombo, playTime);

  const isHigh = Leaderboard.isHigh(finalScore);
  showGameOver(finalScore, state.bestCombo, state.level, isHigh);

  if (isHigh) {
    checkHighScore(finalScore);
  }
});

// ===== GAME UPDATE =====
function update(dt) {
  if (!state.running || state.gameOver || state.paused) return;

  state.moveTimer += dt;
  state.comboTimer -= dt;
  state.goldenTimer -= dt;
  state.frameCount++;

  // Spawn mechanics based on score
  const rules = getActiveRules();
  if (rules.obstacle && state.score > 0 && state.score % 10 === 0 && state.obstacles.length === 0) spawnObstacle();
  if (rules.enemy && state.score > 0 && state.score % 15 === 0 && state.enemies.length === 0) spawnEnemy();

  updatePits();
  updateMeteors();

  if (state.moveTimer >= state.moveInterval) {
    state.moveTimer = 0;
    consumeDir();

    moveSnake();

    if (checkCollision()) return;

    if (checkFood()) {
      // Grow: don't pop tail
      state.moveInterval = getSpeed();
    } else {
      shrinkTail();
    }

    updateEnemies();
    updateObstacles();
  }
}

// ===== GAME RENDER =====
function render() {
  if (show() !== 'game') return; // only render when game screen active
  draw();
  updateHUD();
}

// ===== START GAME =====
function startGame(mode) {
  setGameMode(mode);
  resetState();
  state.mode = mode;
  state.settings = Settings.get();
  state.moveInterval = CONFIG.difficulty[state.settings.difficulty]?.speed || CONFIG.difficulty.normal.speed;

  generateTiles();
  spawnApple();
  resetInput();
  Particles.clear();

  show('game');
  document.getElementById('overlay-start').classList.remove('hidden');
  document.getElementById('overlay-over').classList.add('hidden');
  document.getElementById('overlay-pause').classList.add('hidden');
}

// ===== INIT =====
function init() {
  if (gameInitialized) return;
  gameInitialized = true;

  initScreens();
  initMenu(startGame);
  initInput(() => {
    // Pause toggle
    if (state.running) {
      state.paused = true;
      state.running = false;
      document.getElementById('overlay-pause').classList.remove('hidden');
    } else if (show() === 'game' && document.getElementById('overlay-start').classList.contains('hidden') && !state.gameOver) {
      state.paused = false;
      state.running = true;
      document.getElementById('overlay-pause').classList.add('hidden');
      Audio.startAmbient();
    }
  });

  // Load settings into state
  state.settings = Settings.get();

  // Start in attract mode (game screen visible, not running)
  show('game');
  resetState();
  generateTiles();
  spawnApple();

  // Start loop
  startLoop(update, render, 120);
}

window.addEventListener('load', init);
