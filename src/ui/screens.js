import { state, setMode, DIFFICULTY, THEMES, ACHIEVEMENTS, saveSettings, saveStats, resetAllData } from '../core/state.js';
import { playSound } from '../systems/audio.js';
import { showToast } from './toast.js';

const screens = {
  menu: document.getElementById('menuScreen'),
  difficulty: document.getElementById('difficultyScreen'),
  themes: document.getElementById('themesScreen'),
  leaderboard: document.getElementById('leaderboardScreen'),
  achievements: document.getElementById('achievementsScreen'),
  settings: document.getElementById('settingsScreen'),
  howto: document.getElementById('howtoScreen'),
};

const overlays = {
  pause: document.getElementById('pauseScreen'),
  gameover: document.getElementById('gameoverScreen'),
};

const hud = document.getElementById('hud');
const mobileControls = document.getElementById('mobileControls');

export function initScreens() {
  // Menu buttons
  document.querySelectorAll('#menuScreen .menu-btn[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('MENU_CLICK');
      const action = btn.dataset.action;
      handleMenuAction(action);
    });
  });

  // Back buttons
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('MENU_CLICK');
      showScreen('menu');
    });
  });

  // Difficulty selector
  document.querySelectorAll('#difficultyScreen .select-card').forEach(card => {
    card.addEventListener('click', () => {
      playSound('MENU_CLICK');
      const diff = card.dataset.diff;
      state.settings.difficulty = diff;
      state.step = DIFFICULTY[diff].step;
      saveSettings();
      document.querySelectorAll('#difficultyScreen .select-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      document.getElementById('diffBadge').textContent = DIFFICULTY[diff].label;
      showToast(`Difficulty: ${DIFFICULTY[diff].label}`);
    });
  });

  // Theme selector
  document.querySelectorAll('#themesScreen .select-card').forEach(card => {
    card.addEventListener('click', () => {
      playSound('MENU_CLICK');
      const theme = card.dataset.theme;
      state.settings.theme = theme;
      saveSettings();
      document.querySelectorAll('#themesScreen .select-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      document.getElementById('themeBadge').textContent = THEMES[theme].name;
      showToast(`Realm: ${THEMES[theme].name}`);
    });
  });

  // Settings toggles
  const bindToggle = (id, key) => {
    const el = document.getElementById(id);
    if (el) {
      el.checked = state.settings[key];
      el.addEventListener('change', () => {
        state.settings[key] = el.checked;
        saveSettings();
      });
    }
  };
  bindToggle('settingSound', 'sound');
  bindToggle('settingMusic', 'music');
  bindToggle('settingShake', 'shake');
  bindToggle('settingParticles', 'particles');
  bindToggle('settingGrid', 'grid');

  // Reset data
  document.getElementById('resetDataBtn')?.addEventListener('click', () => {
    if (confirm('Are you sure? ALL data will be lost forever.')) {
      resetAllData();
      showToast('All data reset');
      updateUI();
    }
  });

  // Pause button
  document.getElementById('pauseBtn')?.addEventListener('click', () => {
    if (state.mode === 'playing') {
      setMode('paused');
      playSound('PAUSE');
    }
  });

  // Overlay buttons
  document.querySelectorAll('#pauseScreen .menu-btn[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('MENU_CLICK');
      const action = btn.dataset.action;
      if (action === 'resume') {
        setMode('playing');
        playSound('UNPAUSE');
      } else if (action === 'restart') {
        restartGame();
      } else if (action === 'menu') {
        setMode('menu');
      }
    });
  });

  document.querySelectorAll('#gameoverScreen .menu-btn[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('MENU_CLICK');
      const action = btn.dataset.action;
      if (action === 'restart') {
        restartGame();
      } else if (action === 'menu') {
        setMode('menu');
      }
    });
  });

  // Save score button
  document.getElementById('saveScoreBtn')?.addEventListener('click', () => {
    const name = document.getElementById('playerName').value.trim() || 'Anonymous';
    const entry = state.leaderboard.find(e => e.score === state.score && !e.name);
    if (entry) entry.name = name;
    saveStats();
    document.getElementById('nameEntry').classList.add('hidden');
    showToast('Score saved!');
  });

  // Initial UI update
  updateUI();
}

function handleMenuAction(action) {
  switch (action) {
    case 'play':
      restartGame();
      break;
    case 'difficulty':
      showScreen('difficulty');
      break;
    case 'themes':
      showScreen('themes');
      break;
    case 'leaderboard':
      showScreen('leaderboard');
      renderLeaderboard();
      break;
    case 'achievements':
      showScreen('achievements');
      renderAchievements();
      break;
    case 'settings':
      showScreen('settings');
      break;
    case 'howtoplay':
      showScreen('howto');
      break;
  }
}

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  if (screens[name]) screens[name].classList.add('active');
}

export function updateScreenVisibility() {
  const mode = state.mode;

  // Screens
  Object.values(screens).forEach(s => s.classList.remove('active'));
  Object.values(overlays).forEach(o => {
    o.classList.remove('active');
    o.classList.add('hidden');
  });

  if (mode === 'menu') {
    screens.menu.classList.add('active');
    hud.classList.add('hidden');
    mobileControls.classList.add('hidden');
  } else if (mode === 'playing' || mode === 'paused' || mode === 'gameover') {
    hud.classList.remove('hidden');
    if (state.isMobile) mobileControls.classList.remove('hidden');

    if (mode === 'paused') {
      overlays.pause.classList.remove('hidden');
      overlays.pause.classList.add('active');
    } else if (mode === 'gameover') {
      overlays.gameover.classList.remove('hidden');
      overlays.gameover.classList.add('active');
      renderGameOver();
    }
  }

  updateHUD();
}

function updateHUD() {
  document.getElementById('hudScore').textContent = state.score;
  document.getElementById('hudBest').textContent = state.best;
  document.getElementById('hudLevel').textContent = state.level;

  const comboBox = document.getElementById('hudComboBox');
  if (state.combo >= 2) {
    comboBox.classList.remove('hidden');
    document.getElementById('hudCombo').textContent = `x${state.combo}`;
  } else {
    comboBox.classList.add('hidden');
  }
}

function renderGameOver() {
  document.getElementById('goScore').textContent = state.score;
  document.getElementById('goCombo').textContent = `x${state.combo}`;
  document.getElementById('goLevel').textContent = state.level;
  document.getElementById('goBest').textContent = state.best;

  const nameEntry = document.getElementById('nameEntry');
  const isNewHigh = state.score > 0 && state.score >= state.best && state.leaderboard.length <= 1 ||
    state.leaderboard.some((e, i) => i < 10 && e.score === state.score);
  if (isNewHigh && state.score > 0) {
    nameEntry.classList.remove('hidden');
    document.getElementById('playerName').value = '';
  } else {
    nameEntry.classList.add('hidden');
  }
}

function renderLeaderboard() {
  const list = document.getElementById('leaderboardList');
  if (state.leaderboard.length === 0) {
    list.innerHTML = '<p class="empty-msg">No champions yet... Be the first!</p>';
    return;
  }
  list.innerHTML = state.leaderboard.slice(0, 10).map((entry, i) => {
    const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
    return `
      <div class="lb-entry">
        <span class="lb-rank ${rankClass}">${medal}</span>
        <span class="lb-name">${entry.name || 'Unknown'}</span>
        <span class="lb-score">${entry.score}</span>
      </div>
    `;
  }).join('');
}

function renderAchievements() {
  const grid = document.getElementById('achievementsGrid');
  grid.innerHTML = Object.values(ACHIEVEMENTS).map(ach => {
    const unlocked = state.achievements[ach.id];
    return `
      <div class="ach-card ${unlocked ? 'unlocked' : 'locked'}">
        <span class="ach-icon">${ach.icon}</span>
        <div class="ach-info">
          <span class="ach-title">${ach.title}</span>
          <span class="ach-desc">${ach.desc}</span>
        </div>
        <span class="ach-status">${unlocked ? '✓' : '🔒'}</span>
      </div>
    `;
  }).join('');
}

function updateUI() {
  document.getElementById('diffBadge').textContent = DIFFICULTY[state.settings.difficulty].label;
  document.getElementById('themeBadge').textContent = THEMES[state.settings.theme].name;
}

function restartGame() {
  setMode('playing');
  state.score = 0;
  state.level = 1;
  state.combo = 0;
  state.comboMultiplier = 1;
  state.lastEatTime = 0;
  state.foodsEatenThisLevel = 0;
  state.gameOver = false;
  state.paused = false;
  state.startTime = Date.now();
  state.step = DIFFICULTY[state.settings.difficulty].step;

  // Snake init
  const mid = Math.floor(state.gridSize / 2);
  state.snake = [
    { x: mid, y: mid },
    { x: mid - 1, y: mid },
    { x: mid - 2, y: mid },
  ];
  state.direction = 'RIGHT';
  state.nextDirection = 'RIGHT';
  state.growthQueue = 0;

  // Food
  state.food = null;
  state.specialFood = null;
  state.specialFoodTimer = 0;

  // Spawn food
  spawnFoodSafe();
}

function spawnFoodSafe() {
  let pos;
  let attempts = 0;
  do {
    pos = {
      x: Math.floor(Math.random() * state.gridSize),
      y: Math.floor(Math.random() * state.gridSize),
    };
    attempts++;
  } while (state.snake.some(s => s.x === pos.x && s.y === pos.y) && attempts < 100);
  state.food = pos;
}
