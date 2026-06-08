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
  obstacles: [],
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
  step: 140,
  paused: false,
  gameOver: false,
  startTime: 0,
  isMobile: false,
};

export const DIFFICULTY = {
  easy: { step: 180, label: 'EASY' },
  normal: { step: 140, label: 'NORMAL' },
  hard: { step: 110, label: 'HARD' },
  insane: { step: 85, label: 'INSANE' },
};

export const THEMES = {
  void: {
    name: 'VOID',
    bg: '#050814',
    bgGradient: ['#050814', '#0a1020'],
    boardBg: 'rgba(10, 16, 32, 0.6)',
    boardBorder: 'rgba(201, 168, 76, 0.2)',
    grid: 'rgba(201, 168, 76, 0.08)',
    gridStrong: 'rgba(201, 168, 76, 0.15)',
    snakeHead: '#c9a84c',
    snakeHeadGlow: [201, 168, 76, 0.3],
    snakeBody: '#8b7340',
    snakeBodyFade: '#5a4a28',
    snakeTrail: 'rgba(201, 168, 76, 0.15)',
    food: '#ff4444',
    foodGlow: [255, 68, 68, 0.5],
    specialFood: '#ffd700',
    specialFoodGlow: [255, 215, 0, 0.6],
    particle: ['#c9a84c', '#e8d5a3', '#ffaa00', '#ffd700'],
    ambient: 'stars',
    starColor: [255, 255, 255],
    uiAccent: '#c9a84c',
    uiText: '#f0e6d2',
  },
  moon: {
    name: 'MOON',
    bg: '#080c18',
    bgGradient: ['#080c18', '#0f1525'],
    boardBg: 'rgba(200, 210, 230, 0.12)',
    boardBorder: 'rgba(220, 230, 245, 0.35)',
    grid: 'rgba(200, 210, 230, 0.1)',
    gridStrong: 'rgba(220, 230, 245, 0.22)',
    snakeHead: '#f1f5f9',
    snakeHeadGlow: [241, 245, 249, 0.5],
    snakeBody: '#cbd5e1',
    snakeBodyFade: '#94a3b8',
    snakeTrail: 'rgba(241, 245, 249, 0.2)',
    food: '#e2e8f0',
    foodGlow: [226, 232, 240, 0.7],
    specialFood: '#ffd700',
    specialFoodGlow: [255, 215, 0, 0.6],
    particle: ['#f1f5f9', '#e2e8f0', '#cbd5e1', '#ffffff'],
    ambient: 'moon',
    starColor: [255, 255, 255],
    uiAccent: '#e2e8f0',
    uiText: '#f8fafc',
  },
  emerald: {
    name: 'EMERALD',
    bg: '#022c22',
    bgGradient: ['#022c22', '#064e3b'],
    boardBg: 'rgba(6, 78, 59, 0.5)',
    boardBorder: 'rgba(16, 185, 129, 0.25)',
    grid: 'rgba(16, 185, 129, 0.12)',
    gridStrong: 'rgba(16, 185, 129, 0.25)',
    snakeHead: '#fbbf24',
    snakeHeadGlow: [251, 191, 36, 0.4],
    snakeBody: '#10b981',
    snakeBodyFade: '#059669',
    snakeTrail: 'rgba(16, 185, 129, 0.2)',
    food: '#34d399',
    foodGlow: [52, 211, 153, 0.5],
    specialFood: '#fbbf24',
    specialFoodGlow: [251, 191, 36, 0.6],
    particle: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
    ambient: 'fireflies',
    starColor: [52, 211, 153],
    uiAccent: '#10b981',
    uiText: '#d1fae5',
  },
  crimson: {
    name: 'CRIMSON',
    bg: '#1a0505',
    bgGradient: ['#1a0505', '#2d0a0a'],
    boardBg: 'rgba(45, 10, 10, 0.6)',
    boardBorder: 'rgba(239, 68, 68, 0.2)',
    grid: 'rgba(239, 68, 68, 0.1)',
    gridStrong: 'rgba(239, 68, 68, 0.2)',
    snakeHead: '#f97316',
    snakeHeadGlow: [249, 115, 22, 0.4],
    snakeBody: '#ef4444',
    snakeBodyFade: '#b91c1c',
    snakeTrail: 'rgba(239, 68, 68, 0.15)',
    food: '#fbbf24',
    foodGlow: [251, 191, 36, 0.5],
    specialFood: '#ffffff',
    specialFoodGlow: [255, 255, 255, 0.6],
    particle: ['#ef4444', '#f97316', '#fca5a5', '#fee2e2'],
    ambient: 'embers',
    starColor: [251, 191, 36],
    uiAccent: '#ef4444',
    uiText: '#fecaca',
  },
  royal: {
    name: 'ROYAL',
    bg: '#0a0800',
    bgGradient: ['#0a0800', '#1a1400'],
    boardBg: 'rgba(26, 20, 0, 0.6)',
    boardBorder: 'rgba(201, 168, 76, 0.3)',
    grid: 'rgba(201, 168, 76, 0.1)',
    gridStrong: 'rgba(201, 168, 76, 0.2)',
    snakeHead: '#ffd700',
    snakeHeadGlow: [255, 215, 0, 0.5],
    snakeBody: '#c9a84c',
    snakeBodyFade: '#8b7340',
    snakeTrail: 'rgba(201, 168, 76, 0.2)',
    food: '#ff6600',
    foodGlow: [255, 102, 0, 0.5],
    specialFood: '#ffffff',
    specialFoodGlow: [255, 255, 255, 0.6],
    particle: ['#ffd700', '#c9a84c', '#e8d5a3', '#fff8dc'],
    ambient: 'gold_dust',
    starColor: [255, 215, 0],
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
