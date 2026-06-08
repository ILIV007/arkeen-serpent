/**
 * STATE — Arkeen Serpent
 * Single source of truth. No other file mutates state directly.
 */
import { CONFIG } from './config.js';

export const state = {
  // Game mode
  running: false,
  gameOver: false,
  paused: false,
  mode: 'adventure', // 'adventure' | 'difficulty'

  // Score & progression
  score: 0,
  level: 1,
  xp: 0,
  combo: 0,
  comboTimer: 0,
  bestCombo: 0,
  applesEaten: 0,

  // Snake
  snake: [],
  dir: { x: 1, y: 0 },

  // World
  apple: null,
  obstacles: [],
  enemies: [],
  pits: [],
  meteors: [],
  tiles: [],

  // Timers
  moveTimer: 0,
  moveInterval: CONFIG.difficulty.normal.speed,
  goldenTimer: 0,
  pitTimer: 0,
  meteorTimer: 0,
  frameCount: 0,
  startTime: 0,

  // Settings (mirrored from storage)
  settings: {
    difficulty: 'normal',
    theme: 'space',
    sfx: true,
    music: true,
    shake: true,
    particles: true
  }
};

export function resetState() {
  state.running = false;
  state.gameOver = false;
  state.paused = false;
  state.score = 0;
  state.level = 1;
  state.xp = 0;
  state.combo = 0;
  state.comboTimer = 0;
  state.bestCombo = 0;
  state.applesEaten = 0;
  state.snake = [];
  state.dir = { x: 1, y: 0 };
  state.apple = null;
  state.obstacles = [];
  state.enemies = [];
  state.pits = [];
  state.meteors = [];
  state.tiles = [];
  state.moveTimer = 0;
  state.moveInterval = CONFIG.difficulty[state.settings.difficulty]?.speed || CONFIG.difficulty.normal.speed;
  state.goldenTimer = 0;
  state.pitTimer = 0;
  state.meteorTimer = 0;
  state.frameCount = 0;
  state.startTime = Date.now();
}
