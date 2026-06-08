/**
 * SCREENS — Arkeen Serpent
 * Screen navigation. No game logic.
 */
const screens = {};
let current = '';

export function initScreens() {
  screens.menu = document.getElementById('screen-menu');
  screens.difficulty = document.getElementById('screen-difficulty');
  screens.themes = document.getElementById('screen-themes');
  screens.leaderboard = document.getElementById('screen-leaderboard');
  screens.stats = document.getElementById('screen-stats');
  screens.settings = document.getElementById('screen-settings');
  screens.name = document.getElementById('screen-name');
  screens.game = document.getElementById('screen-game');
}

export function show(name) {
  Object.values(screens).forEach(s => s?.classList.remove('active'));
  if (screens[name]) screens[name].classList.add('active');
  current = name;
}

export function getCurrent() { return current; }
