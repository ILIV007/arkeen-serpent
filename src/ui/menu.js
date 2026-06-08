/**
 * MENU — Arkeen Serpent
 * Menu wiring, HUD updates, name input, leaderboard, stats, themes.
 */
import { state } from '../core/state.js';
import { CONFIG } from '../core/config.js';
import { show } from './screens.js';
import { Audio } from '../systems/audio.js';
import { Leaderboard, Settings, Stats } from '../systems/storage.js';
import { getTheme, addFloatingText } from '../render/renderer.js';

let gameMode = 'adventure';
let pendingScore = 0;

export function initMenu(startGameFn) {
  // Main menu actions
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      Audio.playMenuClick();
      const act = btn.dataset.action;
      if (act === 'play') startGameFn('adventure');
      else if (act === 'difficulty') show('difficulty');
      else if (act === 'themes') { populateThemes(); show('themes'); }
      else if (act === 'leaderboard') { populateLeaderboard(); show('leaderboard'); }
      else if (act === 'stats') { populateStats(); show('stats'); }
      else if (act === 'settings') { populateSettings(); show('settings'); }
      else if (act === 'back') show('menu');
    });
  });

  // Difficulty select
  document.querySelectorAll('[data-diff]').forEach(btn => {
    btn.addEventListener('click', () => {
      Audio.playMenuClick();
      Settings.set('difficulty', btn.dataset.diff);
      startGameFn('difficulty');
    });
  });

  // Attract mode buttons
  document.getElementById('btn-start')?.addEventListener('click', () => {
    Audio.playMenuClick();
    document.getElementById('overlay-start').classList.add('hidden');
    state.running = true;
    Audio.startAmbient();
  });

  document.getElementById('btn-attract-menu')?.addEventListener('click', () => {
    Audio.playMenuClick();
    show('menu');
  });

  // Pause
  document.getElementById('btn-pause')?.addEventListener('click', () => {
    Audio.playMenuClick();
    state.paused = true;
    state.running = false;
    document.getElementById('overlay-pause').classList.remove('hidden');
  });

  document.getElementById('btn-resume')?.addEventListener('click', () => {
    Audio.playMenuClick();
    state.paused = false;
    state.running = true;
    document.getElementById('overlay-pause').classList.add('hidden');
    Audio.startAmbient();
  });

  document.getElementById('btn-menu-from-pause')?.addEventListener('click', () => {
    Audio.playMenuClick();
    document.getElementById('overlay-pause').classList.add('hidden');
    show('menu');
  });

  document.getElementById('btn-quit')?.addEventListener('click', () => {
    Audio.playMenuClick();
    document.getElementById('overlay-pause').classList.add('hidden');
    show('menu');
  });

  // Game Over
  document.getElementById('btn-retry')?.addEventListener('click', () => {
    Audio.playMenuClick();
    document.getElementById('overlay-over').classList.add('hidden');
    startGameFn(gameMode);
  });

  document.getElementById('btn-menu-from-over')?.addEventListener('click', () => {
    Audio.playMenuClick();
    document.getElementById('overlay-over').classList.add('hidden');
    show('menu');
  });

  // Name input — FIXED
  document.getElementById('name-submit')?.addEventListener('click', submitName);
  document.getElementById('name-skip')?.addEventListener('click', () => {
    Audio.playMenuClick();
    show('menu');
  });
  document.getElementById('name-input')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); submitName(); }
  });

  // Hover sounds
  document.querySelectorAll('.btn, .theme-card, .toggle').forEach(el => {
    el.addEventListener('mouseenter', () => Audio.playMenuHover());
  });
}

function submitName() {
  const raw = document.getElementById('name-input')?.value;
  const name = (raw && raw.trim()) ? raw.trim() : 'KNIGHT';
  Leaderboard.add(name, pendingScore);
  show('leaderboard');
  populateLeaderboard();
}

export function showGameOver(score, combo, level, isHigh) {
  show('game');
  document.getElementById('overlay-over').classList.remove('hidden');
  document.getElementById('over-score').textContent = score;
  document.getElementById('over-combo').textContent = 'x' + combo;
  document.getElementById('over-level').textContent = level;
  const rankEl = document.getElementById('over-rank');
  if (isHigh) {
    document.getElementById('over-rank-num').textContent = Leaderboard.rank(score);
    rankEl.classList.remove('hidden');
  } else {
    rankEl.classList.add('hidden');
  }
}

export function checkHighScore(score) {
  if (Leaderboard.isHigh(score)) {
    pendingScore = score;
    document.getElementById('name-score').textContent = score;
    const input = document.getElementById('name-input');
    if (input) { input.value = ''; setTimeout(() => input.focus(), 100); }
    show('name');
    return true;
  }
  return false;
}

export function updateHUD() {
  if (!state) return;
  const elScore = document.getElementById('hud-score');
  const elLevel = document.getElementById('hud-level');
  const elBest = document.getElementById('hud-best');
  const elCombo = document.getElementById('hud-combo');
  if (elScore) elScore.textContent = Math.max(0, state.score);
  if (elLevel) elLevel.textContent = state.level;
  if (elBest) elBest.textContent = Stats.get().bestScore;
  if (elCombo) {
    if (state.combo >= 2) {
      elCombo.textContent = '🔥 x' + Math.min(state.combo, CONFIG.combo.maxMult);
      elCombo.classList.remove('hidden');
    } else {
      elCombo.classList.add('hidden');
    }
  }
}

function populateThemes() {
  const grid = document.getElementById('theme-grid');
  if (!grid) return;
  const current = Settings.getOne('theme');
  grid.innerHTML = '';
  Object.entries(CONFIG.themes).forEach(([id, t]) => {
    const card = document.createElement('div');
    card.className = 'theme-card' + (id === current ? ' active' : '');
    card.innerHTML = `<div class="theme-preview" style="background:${t.bg}"></div><div class="theme-name">${t.name}</div>`;
    card.addEventListener('click', () => {
      Audio.playMenuClick();
      Settings.set('theme', id);
      populateThemes();
    });
    grid.appendChild(card);
  });
}

function populateLeaderboard() {
  const container = document.getElementById('leaderboard-table');
  if (!container) return;
  const lb = Leaderboard.get();
  if (lb.length === 0) {
    container.innerHTML = '<div class="lb-empty">No champions yet... Be the first!</div>';
    return;
  }
  container.innerHTML = '';
  lb.forEach((e, i) => {
    const row = document.createElement('div');
    row.className = 'lb-row';
    const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    row.innerHTML = `<span class="lb-rank ${rankClass}">${i + 1}</span><span class="lb-name">${e.name}</span><span class="lb-score">${e.score}</span>`;
    container.appendChild(row);
  });
}

function populateStats() {
  const grid = document.getElementById('stats-grid');
  if (!grid) return;
  const s = Stats.get();
  const mins = Math.floor(s.totalTime / 60);
  grid.innerHTML = `
    <div class="stat-row"><span class="stat-label">Games Played</span><span class="stat-val">${s.gamesPlayed}</span></div>
    <div class="stat-row"><span class="stat-label">Apples Eaten</span><span class="stat-val">${s.totalApples}</span></div>
    <div class="stat-row"><span class="stat-label">Best Score</span><span class="stat-val">${s.bestScore}</span></div>
    <div class="stat-row"><span class="stat-label">Best Combo</span><span class="stat-val">x${s.bestCombo}</span></div>
    <div class="stat-row"><span class="stat-label">Total Score</span><span class="stat-val">${s.totalScore}</span></div>
    <div class="stat-row"><span class="stat-label">Play Time</span><span class="stat-val">${mins}m</span></div>
  `;
}

function populateSettings() {
  const s = Settings.get();
  const setToggle = (id, key) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.textContent = s[key] ? 'ON' : 'OFF';
    btn.className = 'toggle ' + (s[key] ? 'on' : '');
    btn.onclick = () => {
      Audio.playMenuClick();
      const newVal = !Settings.getOne(key);
      Settings.set(key, newVal);
      populateSettings();
      if (key === 'sfx' || key === 'music') Audio.setMute(Settings.getOne('sfx'), Settings.getOne('music'));
    };
  };
  setToggle('set-sfx', 'sfx');
  setToggle('set-music', 'music');
  setToggle('set-shake', 'shake');
  setToggle('set-particles', 'particles');
}

export function setGameMode(m) { gameMode = m; }
