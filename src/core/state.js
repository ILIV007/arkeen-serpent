export const state = {
  mode: 'menu',
  previousMode: null,
  score: 0,
  best: 0,
  level: 1,
  combo: 0,
  lastEatTime: 0,
  comboMultiplier: 1,
  foodsEatenThisLevel: 0,
  gridSize: 20,
  cellSize: 0,
  canvasWidth: 0,
  canvasHeight: 0,
  snake: [],
  direction: 'RIGHT',
  nextDirection: 'RIGHT',
  growthQueue: 0,
  food: null,
  specialFood: null,
  specialFoodTimer: 0,
  settings: {
    sound: true,
    music: false,
    particles: true,
    shake: true,
    grid: false,
    difficulty: 'normal',
    theme: 'void',
  },
  stats: {
    gamesPlayed: 0,
    totalScore: 0,
    maxCombo: 0,
    foodsEaten: 0,
    timePlayed: 0,
  },
  leaderboard: [],
  achievements: {},
  lastTime: 0,
  accumulator: 0,
  step: 120,
  paused: false,
  gameOver: false,
  startTime: 0,
  isMobile: false,
};

export const DIFFICULTY = {
  easy: { step: 150, label: 'EASY' },
  normal: { step: 120, label: 'NORMAL' },
  hard: { step: 90, label: 'HARD' },
  insane: { step: 70, label: 'INSANE' },
};

export const THEMES = {
  void: {
    name: 'VOID',
    bg: '#050814',
    snakeHead: '#c9a84c',
    snakeBody: '#8b7340',
    food: '#ff4444',
    specialFood: '#ffd700',
    grid: '#0a1020',
    particle: '#c9a84c',
    ambient: null,
  },
  moon: {
    name: 'MOON',
    bg: '#050814',
    snakeHead: '#7dd3fc',
    snakeBody: '#4a7090',
    food: '#a0a0ff',
    specialFood: '#ffffff',
    grid: '#0a1020',
    particle: '#7dd3fc',
    ambient: 'stars',
  },
  crimson: {
    name: 'CRIMSON',
    bg: '#0a0204',
    snakeHead: '#ff6b6b',
    snakeBody: '#a04040',
    food: '#ffaa00',
    specialFood: '#ff0000',
    grid: '#140205',
    particle: '#ff6b6b',
    ambient: 'fire',
  },
  nebula: {
    name: 'NEBULA',
    bg: '#060310',
    snakeHead: '#b084ff',
    snakeBody: '#7050a0',
    food: '#00ffaa',
    specialFood: '#ff00ff',
    grid: '#0a0518',
    particle: '#b084ff',
    ambient: 'nebula',
  },
  golden: {
    name: 'GOLDEN',
    bg: '#0a0800',
    snakeHead: '#ffd700',
    snakeBody: '#c9a84c',
    food: '#ff6600',
    specialFood: '#ffffff',
    grid: '#141000',
    particle: '#ffd700',
    ambient: 'gold',
  },
};

export const ACHIEVEMENTS = {
  first_blood: { id: 'first_blood', title: 'First Blood', desc: 'Eat your first food', icon: '🍎' },
  novice: { id: 'novice', title: 'Novice Serpent', desc: 'Score 10 points', icon: '🐍' },
  warrior: { id: 'warrior', title: 'Serpent Warrior', desc: 'Score 50 points', icon: '⚔' },
  master: { id: 'master', title: 'Serpent Master', desc: 'Score 100 points', icon: '👑' },
  legend: { id: 'legend', title: 'Cosmic Legend', desc: 'Score 200 points', icon: '🌟' },
  combo3: { id: 'combo3', title: 'Quick Bite', desc: 'Reach x3 combo', icon: '🔥' },
  combo5: { id: 'combo5', title: 'Frenzy', desc: 'Reach x5 combo', icon: '💥' },
  combo10: { id: 'combo10', title: 'Unstoppable', desc: 'Reach x10 combo', icon: '⚡' },
  level5: { id: 'level5', title: 'Ascended', desc: 'Reach level 5', icon: '🚀' },
  level10: { id: 'level10', title: 'Transcended', desc: 'Reach level 10', icon: '🌌' },
  survivor: { id: 'survivor', title: 'Survivor', desc: 'Play 10 games', icon: '🛡' },
  glutton: { id: 'glutton', title: 'Glutton', desc: 'Eat 100 foods total', icon: '🍖' },
  speed_demon: { id: 'speed_demon', title: 'Speed Demon', desc: 'Play on Insane', icon: '💀' },
  perfectionist: { id: 'perfectionist', title: 'Perfectionist', desc: 'Fill 50% of grid', icon: '🔲' },
};

export function setMode(mode) {
  state.previousMode = state.mode;
  state.mode = mode;
}

export function loadSettings() {
  try {
    const saved = localStorage.getItem('arkeen_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Validate difficulty exists
      if (parsed.difficulty && !DIFFICULTY[parsed.difficulty]) {
        parsed.difficulty = 'normal'; // fallback
      }
      // Validate theme exists
      if (parsed.theme && !THEMES[parsed.theme]) {
        parsed.theme = 'void'; // fallback
      }
      Object.assign(state.settings, parsed);
    }
  } catch (e) {
    console.warn('Failed to load settings, using defaults:', e);
  }
}

export function saveSettings() {
  try {
    localStorage.setItem('arkeen_settings', JSON.stringify(state.settings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

export function loadStats() {
  try {
    const saved = localStorage.getItem('arkeen_stats');
    if (saved) Object.assign(state.stats, JSON.parse(saved));
    const lb = localStorage.getItem('arkeen_leaderboard');
    if (lb) state.leaderboard = JSON.parse(lb);
    const ach = localStorage.getItem('arkeen_achievements');
    if (ach) state.achievements = JSON.parse(ach);
    const best = localStorage.getItem('arkeen_best');
    if (best) state.best = parseInt(best, 10);
  } catch (e) {
    console.warn('Failed to load stats:', e);
  }
}

export function saveStats() {
  try {
    localStorage.setItem('arkeen_stats', JSON.stringify(state.stats));
    localStorage.setItem('arkeen_leaderboard', JSON.stringify(state.leaderboard));
    localStorage.setItem('arkeen_achievements', JSON.stringify(state.achievements));
    localStorage.setItem('arkeen_best', String(state.best));
  } catch (e) {
    console.warn('Failed to save stats:', e);
  }
}

export function resetAllData() {
  state.stats = { gamesPlayed: 0, totalScore: 0, maxCombo: 0, foodsEaten: 0, timePlayed: 0 };
  state.leaderboard = [];
  state.achievements = {};
  state.best = 0;
  state.settings = { sound: true, music: false, particles: true, shake: true, grid: false, difficulty: 'normal', theme: 'void' };
  try {
    localStorage.removeItem('arkeen_settings');
    localStorage.removeItem('arkeen_stats');
    localStorage.removeItem('arkeen_leaderboard');
    localStorage.removeItem('arkeen_achievements');
    localStorage.removeItem('arkeen_best');
  } catch (e) {}
}

export function initState() {
  loadSettings();
  loadStats();
  state.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  // SAFE fallback: if difficulty doesn't exist, default to normal
  const diff = state.settings.difficulty;
  if (!DIFFICULTY[diff]) {
    console.warn(`Invalid difficulty "${diff}", falling back to normal`);
    state.settings.difficulty = 'normal';
  }
  state.step = DIFFICULTY[state.settings.difficulty].step;
}
