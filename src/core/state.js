export const state = {
  // Screen mode
  mode: 'menu',
  previousMode: null,

  // Game state
  score: 0,
  best: 0,
  level: 1,
  combo: 0,
  lastEatTime: 0,
  comboMultiplier: 1,
  foodsEatenThisLevel: 0,

  // Grid & sizing
  gridSize: 20,
  cellSize: 0,
  canvasWidth: 0,
  canvasHeight: 0,

  // Snake
  snake: [],
  direction: 'RIGHT',
  nextDirection: 'RIGHT',
  growthQueue: 0,

  // Food
  food: null,
  specialFood: null,
  specialFoodTimer: 0,

  // Settings (loaded from storage)
  settings: {
    sound: true,
    music: false,
    particles: true,
    shake: true,
    grid: false,
    difficulty: 'normal',
    theme: 'void',
  },

  // Stats (persisted)
  stats: {
    gamesPlayed: 0,
    totalScore: 0,
    maxCombo: 0,
    foodsEaten: 0,
    timePlayed: 0,
  },

  // Leaderboard (persisted)
  leaderboard: [],

  // Achievements (persisted)
  achievements: {},

  // Runtime loop
  lastTime: 0,
  accumulator: 0,
  step: 120,
  paused: false,
  gameOver: false,
  startTime: 0,

  // Mobile detection
  isMobile: false,
};

// Difficulty config
export const DIFFICULTY = {
  easy: { step: 150, label: 'EASY' },
  normal: { step: 120, label: 'NORMAL' },
  hard: { step: 90, label: 'HARD' },
  insane: { step: 70, label: 'INSANE' },
};

// Theme config
export const THEMES = {
  void: {
    name: 'VOID',
    bg: '#120a00',
    snakeHead: '#c9a84c',
    snakeBody: '#8b7340',
    food: '#ff4444',
    specialFood: '#ffd700',
    grid: '#1a1005',
    particle: '#c9a84c',
    ambient: null,
  },
  moon: {
    name: 'MOON',
    bg: '#0a0a1a',
    snakeHead: '#c0c0e0',
    snakeBody: '#8080a0',
    food: '#a0a0ff',
    specialFood: '#ffffff',
    grid: '#101025',
    particle: '#c0c0e0',
    ambient: 'stars',
  },
  crimson: {
    name: 'CRIMSON',
    bg: '#1a0005',
    snakeHead: '#ff6b6b',
    snakeBody: '#c94c4c',
    food: '#ffaa00',
    specialFood: '#ff0000',
    grid: '#250005',
    particle: '#ff6b6b',
    ambient: 'fire',
  },
  nebula: {
    name: 'NEBULA',
    bg: '#0a0518',
    snakeHead: '#b084ff',
    snakeBody: '#8050cc',
    food: '#00ffaa',
    specialFood: '#ff00ff',
    grid: '#120a20',
    particle: '#b084ff',
    ambient: 'nebula',
  },
  golden: {
    name: 'GOLDEN',
    bg: '#1a1200',
    snakeHead: '#ffd700',
    snakeBody: '#c9a84c',
    food: '#ff6600',
    specialFood: '#ffffff',
    grid: '#251a00',
    particle: '#ffd700',
    ambient: 'gold',
  },
};

// Achievement definitions
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
    if (saved) Object.assign(state.settings, JSON.parse(saved));
  } catch (e) { /* ignore */ }
}

export function saveSettings() {
  try {
    localStorage.setItem('arkeen_settings', JSON.stringify(state.settings));
  } catch (e) { /* ignore */ }
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
  } catch (e) { /* ignore */ }
}

export function saveStats() {
  try {
    localStorage.setItem('arkeen_stats', JSON.stringify(state.stats));
    localStorage.setItem('arkeen_leaderboard', JSON.stringify(state.leaderboard));
    localStorage.setItem('arkeen_achievements', JSON.stringify(state.achievements));
    localStorage.setItem('arkeen_best', String(state.best));
  } catch (e) { /* ignore */ }
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
  } catch (e) { /* ignore */ }
}

export function initState() {
  loadSettings();
  loadStats();
  state.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  state.step = DIFFICULTY[state.settings.difficulty].step;
}
