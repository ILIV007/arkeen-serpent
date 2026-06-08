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
  moveAccumulator: 0,
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

// =====================================================
// COMPLETE THEME ENGINE - Each theme has full identity
// =====================================================
export const THEMES = {
  void: {
    name: 'VOID',
    // Background
    bg: '#050814',
    bgGradient: ['#050814', '#0a1020'],
    // Board
    boardBg: 'rgba(10, 16, 32, 0.6)',
    boardBorder: 'rgba(201, 168, 76, 0.2)',
    // Grid
    grid: 'rgba(201, 168, 76, 0.08)',
    gridStrong: 'rgba(201, 168, 76, 0.15)',
    // Snake
    snakeHead: '#c9a84c',
    snakeHeadGlow: 'rgba(201, 168, 76, 0.4)',
    snakeBody: '#8b7340',
    snakeBodyFade: '#5a4a28',
    snakeTrail: 'rgba(201, 168, 76, 0.15)',
    // Food
    food: '#ff4444',
    foodGlow: 'rgba(255, 68, 68, 0.5)',
    specialFood: '#ffd700',
    specialFoodGlow: 'rgba(255, 215, 0, 0.6)',
    // Particles
    particle: ['#c9a84c', '#e8d5a3', '#ffaa00', '#ffd700'],
    // Ambient
    ambient: 'stars',
    starColor: 'rgba(255, 255, 255,',
    // UI
    uiAccent: '#c9a84c',
    uiText: '#f0e6d2',
  },
  moon: {
    name: 'MOON',
    // Background - LIGHT theme!
    bg: '#e2e8f0',
    bgGradient: ['#e2e8f0', '#cbd5e1'],
    // Board
    boardBg: 'rgba(255, 255, 255, 0.7)',
    boardBorder: 'rgba(148, 163, 184, 0.4)',
    // Grid - visible silver
    grid: 'rgba(148, 163, 184, 0.25)',
    gridStrong: 'rgba(148, 163, 184, 0.4)',
    // Snake - silver/white/blue
    snakeHead: '#2563eb',
    snakeHeadGlow: 'rgba(37, 99, 235, 0.35)',
    snakeBody: '#60a5fa',
    snakeBodyFade: '#93c5fd',
    snakeTrail: 'rgba(96, 165, 250, 0.2)',
    // Food - bright cyan/blue
    food: '#0ea5e9',
    foodGlow: 'rgba(14, 165, 233, 0.5)',
    specialFood: '#f59e0b',
    specialFoodGlow: 'rgba(245, 158, 11, 0.6)',
    // Particles
    particle: ['#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
    // Ambient
    ambient: 'stars',
    starColor: 'rgba(100, 116, 139,',
    // UI
    uiAccent: '#2563eb',
    uiText: '#1e293b',
  },
  emerald: {
    name: 'EMERALD',
    // Background
    bg: '#022c22',
    bgGradient: ['#022c22', '#064e3b'],
    // Board
    boardBg: 'rgba(6, 78, 59, 0.5)',
    boardBorder: 'rgba(16, 185, 129, 0.25)',
    // Grid
    grid: 'rgba(16, 185, 129, 0.12)',
    gridStrong: 'rgba(16, 185, 129, 0.25)',
    // Snake - green/gold
    snakeHead: '#fbbf24',
    snakeHeadGlow: 'rgba(251, 191, 36, 0.4)',
    snakeBody: '#10b981',
    snakeBodyFade: '#059669',
    snakeTrail: 'rgba(16, 185, 129, 0.2)',
    // Food
    food: '#34d399',
    foodGlow: 'rgba(52, 211, 153, 0.5)',
    specialFood: '#fbbf24',
    specialFoodGlow: 'rgba(251, 191, 36, 0.6)',
    // Particles
    particle: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
    // Ambient
    ambient: 'fireflies',
    starColor: 'rgba(52, 211, 153,',
    // UI
    uiAccent: '#10b981',
    uiText: '#d1fae5',
  },
  crimson: {
    name: 'CRIMSON',
    // Background
    bg: '#1a0505',
    bgGradient: ['#1a0505', '#2d0a0a'],
    // Board
    boardBg: 'rgba(45, 10, 10, 0.6)',
    boardBorder: 'rgba(239, 68, 68, 0.2)',
    // Grid
    grid: 'rgba(239, 68, 68, 0.1)',
    gridStrong: 'rgba(239, 68, 68, 0.2)',
    // Snake - red/orange
    snakeHead: '#f97316',
    snakeHeadGlow: 'rgba(249, 115, 22, 0.4)',
    snakeBody: '#ef4444',
    snakeBodyFade: '#b91c1c',
    snakeTrail: 'rgba(239, 68, 68, 0.15)',
    // Food
    food: '#fbbf24',
    foodGlow: 'rgba(251, 191, 36, 0.5)',
    specialFood: '#ffffff',
    specialFoodGlow: 'rgba(255, 255, 255, 0.6)',
    // Particles
    particle: ['#ef4444', '#f97316', '#fca5a5', '#fee2e2'],
    // Ambient
    ambient: 'embers',
    starColor: 'rgba(251, 191, 36,',
    // UI
    uiAccent: '#ef4444',
    uiText: '#fecaca',
  },
  royal: {
    name: 'ROYAL',
    // Background
    bg: '#0a0800',
    bgGradient: ['#0a0800', '#1a1400'],
    // Board
    boardBg: 'rgba(26, 20, 0, 0.6)',
    boardBorder: 'rgba(201, 168, 76, 0.3)',
    // Grid
    grid: 'rgba(201, 168, 76, 0.1)',
    gridStrong: 'rgba(201, 168, 76, 0.2)',
    // Snake - gold/amber
    snakeHead: '#ffd700',
    snakeHeadGlow: 'rgba(255, 215, 0, 0.5)',
    snakeBody: '#c9a84c',
    snakeBodyFade: '#8b7340',
    snakeTrail: 'rgba(201, 168, 76, 0.2)',
    // Food
    food: '#ff6600',
    foodGlow: 'rgba(255, 102, 0, 0.5)',
    specialFood: '#ffffff',
    specialFoodGlow: 'rgba(255, 255, 255, 0.6)',
    // Particles
    particle: ['#ffd700', '#c9a84c', '#e8d5a3', '#fff8dc'],
    // Ambient
    ambient: 'gold_dust',
    starColor: 'rgba(255, 215, 0,',
    // UI
    uiAccent: '#ffd700',
    uiText: '#fef3c7',
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
      if (parsed.difficulty && !DIFFICULTY[parsed.difficulty]) {
        parsed.difficulty = 'normal';
      }
      if (parsed.theme && !THEMES[parsed.theme]) {
        parsed.theme = 'void';
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
  const diff = state.settings.difficulty;
  if (!DIFFICULTY[diff]) {
    console.warn(`Invalid difficulty "${diff}", falling back to normal`);
    state.settings.difficulty = 'normal';
  }
  state.step = DIFFICULTY[state.settings.difficulty].step;
}
