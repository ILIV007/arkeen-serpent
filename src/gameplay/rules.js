import { state, setMode, ACHIEVEMENTS } from '../core/state.js';
import { growSnake } from './snake.js';
import { playSound } from '../systems/audio.js';
import { spawnParticles } from '../render/particles.js';
import { addShake } from '../render/juice.js';
import { showToast } from '../ui/toast.js';

export function spawnFood() {
  let pos;
  let attempts = 0;
  do {
    pos = {
      x: Math.floor(Math.random() * state.gridSize),
      y: Math.floor(Math.random() * state.gridSize),
    };
    attempts++;
  } while (isOnSnake(pos) && attempts < 100);
  state.food = pos;
}

export function spawnSpecialFood() {
  if (Math.random() > 0.15) return;
  let pos;
  let attempts = 0;
  do {
    pos = {
      x: Math.floor(Math.random() * state.gridSize),
      y: Math.floor(Math.random() * state.gridSize),
    };
    attempts++;
  } while ((isOnSnake(pos) || (state.food && pos.x === state.food.x && pos.y === state.food.y)) && attempts < 100);
  state.specialFood = pos;
  state.specialFoodTimer = 6000;
}

function isOnSnake(pos) {
  return state.snake.some(s => s.x === pos.x && s.y === pos.y);
}

export function checkFood() {
  const head = state.snake[0];
  let ate = false;

  if (state.food && head.x === state.food.x && head.y === state.food.y) {
    ate = true;
    state.food = null;
    state.score++;
    state.stats.foodsEaten++;
    state.foodsEatenThisLevel++;
    growSnake(1);
    playSound('EAT');
    spawnParticles(head.x * state.cellSize + state.cellSize / 2, head.y * state.cellSize + state.cellSize / 2, 'food');
  }

  if (state.specialFood && head.x === state.specialFood.x && head.y === state.specialFood.y) {
    ate = true;
    state.specialFood = null;
    state.score += 5;
    state.stats.foodsEaten++;
    growSnake(3);
    playSound('SPECIAL');
    addShake(5);
    showToast('⭐ SPECIAL FOOD! +5');
    spawnParticles(head.x * state.cellSize + state.cellSize / 2, head.y * state.cellSize + state.cellSize / 2, 'special');
  }

  if (ate) {
    handleCombo();
    checkLevelUp();
    if (!state.food) spawnFood();
    if (!state.specialFood && Math.random() < 0.15) spawnSpecialFood();
  }

  if (state.specialFood) {
    state.specialFoodTimer -= state.step;
    if (state.specialFoodTimer <= 0) state.specialFood = null;
  }
}

function handleCombo() {
  const now = Date.now();
  if (now - state.lastEatTime < 2500) {
    state.combo++;
    state.comboMultiplier = Math.min(1 + Math.floor(state.combo / 3) * 0.5, 5);
    state.score += Math.floor(state.comboMultiplier);
    if (state.combo > state.stats.maxCombo) state.stats.maxCombo = state.combo;
    if (state.combo >= 3) playSound('COMBO');
    if (state.combo >= 3 && state.combo % 3 === 0) {
      showToast(`🔥 COMBO x${state.combo}!`);
      addShake(2);
    }
  } else {
    state.combo = 1;
    state.comboMultiplier = 1;
  }
  state.lastEatTime = now;
}

function checkLevelUp() {
  if (state.foodsEatenThisLevel >= 5) {
    state.foodsEatenThisLevel = 0;
    state.level++;
    playSound('LEVEL_UP');
    showToast(`🚀 LEVEL ${state.level}!`);
    addShake(3);
    const baseStep = { easy: 150, normal: 120, hard: 90, insane: 70 }[state.settings.difficulty];
    state.step = Math.max(baseStep - (state.level - 1) * 3, 50);
  }
}

export function checkCollision() {
  const head = state.snake[0];
  const gs = state.gridSize;
  if (head.x < 0 || head.y < 0 || head.x >= gs || head.y >= gs) {
    triggerGameOver();
    return;
  }
  for (let i = 1; i < state.snake.length; i++) {
    if (head.x === state.snake[i].x && head.y === state.snake[i].y) {
      triggerGameOver();
      return;
    }
  }
}

function triggerGameOver() {
  setMode('gameover');
  state.gameOver = true;
  playSound('GAME_OVER');
  addShake(12);
  spawnParticles(state.snake[0].x * state.cellSize + state.cellSize / 2, state.snake[0].y * state.cellSize + state.cellSize / 2, 'death');
  state.stats.gamesPlayed++;
  state.stats.totalScore += state.score;
  const playTime = Date.now() - state.startTime;
  state.stats.timePlayed += playTime;
  if (state.score > state.best) state.best = state.score;
  checkAchievements();
  saveLeaderboard();
  saveStats();
}

function checkAchievements() {
  const unlock = (id) => {
    if (!state.achievements[id]) {
      state.achievements[id] = true;
      const ach = ACHIEVEMENTS[id];
      if (ach) {
        playSound('ACHIEVEMENT');
        showToast(`🏆 ${ach.title} unlocked!`);
      }
    }
  };
  if (state.stats.foodsEaten >= 1) unlock('first_blood');
  if (state.score >= 10) unlock('novice');
  if (state.score >= 50) unlock('warrior');
  if (state.score >= 100) unlock('master');
  if (state.score >= 200) unlock('legend');
  if (state.stats.maxCombo >= 3) unlock('combo3');
  if (state.stats.maxCombo >= 5) unlock('combo5');
  if (state.stats.maxCombo >= 10) unlock('combo10');
  if (state.level >= 5) unlock('level5');
  if (state.level >= 10) unlock('level10');
  if (state.stats.gamesPlayed >= 10) unlock('survivor');
  if (state.stats.foodsEaten >= 100) unlock('glutton');
  if (state.settings.difficulty === 'insane') unlock('speed_demon');
  if (state.snake.length >= state.gridSize * state.gridSize * 0.5) unlock('perfectionist');
}

function saveLeaderboard() {
  state.leaderboard.push({
    score: state.score,
    level: state.level,
    combo: state.stats.maxCombo,
    difficulty: state.settings.difficulty,
    date: Date.now(),
  });
  state.leaderboard.sort((a, b) => b.score - a.score);
  state.leaderboard = state.leaderboard.slice(0, 20);
}

function saveStats() {
  try {
    localStorage.setItem('arkeen_stats', JSON.stringify(state.stats));
    localStorage.setItem('arkeen_leaderboard', JSON.stringify(state.leaderboard));
    localStorage.setItem('arkeen_achievements', JSON.stringify(state.achievements));
    localStorage.setItem('arkeen_best', String(state.best));
  } catch (e) {}
}
