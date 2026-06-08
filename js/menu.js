/**
 * MENU SYSTEM — Arkeen Serpent
 */
const Menu = (function(){
  const screens = {
    menu: document.getElementById('screen-menu'),
    difficulty: document.getElementById('screen-difficulty'),
    themes: document.getElementById('screen-themes'),
    leaderboard: document.getElementById('screen-leaderboard'),
    stats: document.getElementById('screen-stats'),
    settings: document.getElementById('screen-settings'),
    name: document.getElementById('screen-name'),
    game: document.getElementById('screen-game')
  };

  let currentScreen = 'game'; // start in game (attract mode)
  let pendingScore = 0;
  let gameMode = 'adventure';

  function show(name){
    Object.values(screens).forEach(s => s.classList.remove('active'));
    if(screens[name]) screens[name].classList.add('active');
    currentScreen = name;
    if(name !== 'game') Audio.stopAmbient();
  }

  function back(){ show('menu'); }

  // Main menu buttons
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      Audio.playMenuClick();
      const act = btn.dataset.action;
      if(act === 'play') startGame('adventure');
      else if(act === 'difficulty') show('difficulty');
      else if(act === 'themes') { populateThemes(); show('themes'); }
      else if(act === 'leaderboard') { populateLeaderboard(); show('leaderboard'); }
      else if(act === 'stats') { populateStats(); show('stats'); }
      else if(act === 'settings') { populateSettings(); show('settings'); }
      else if(act === 'back') back();
    });
  });

  // Difficulty select
  document.querySelectorAll('[data-diff]').forEach(btn => {
    btn.addEventListener('click', () => {
      Audio.playMenuClick();
      Storage.Settings.set('difficulty', btn.dataset.diff);
      startGame('difficulty');
    });
  });

  // Attract mode: tap to start
  document.getElementById('btn-start').addEventListener('click', () => {
    Audio.playMenuClick();
    document.getElementById('overlay-start').classList.add('hidden');
    Game.start();
  });

  // Attract mode: menu button
  document.getElementById('btn-attract-menu').addEventListener('click', () => {
    Audio.playMenuClick();
    show('menu');
  });

  // Pause
  document.getElementById('btn-pause').addEventListener('click', () => {
    Audio.playMenuClick();
    Game.pause();
    document.getElementById('overlay-pause').classList.remove('hidden');
  });
  document.getElementById('btn-resume').addEventListener('click', () => {
    Audio.playMenuClick();
    document.getElementById('overlay-pause').classList.add('hidden');
    Game.resume();
  });
  document.getElementById('btn-menu-from-pause').addEventListener('click', () => {
    Audio.playMenuClick();
    document.getElementById('overlay-pause').classList.add('hidden');
    show('menu');
  });
  document.getElementById('btn-quit').addEventListener('click', () => {
    Audio.playMenuClick();
    document.getElementById('overlay-pause').classList.add('hidden');
    show('menu');
  });

  // Game Over
  document.getElementById('btn-retry').addEventListener('click', () => {
    Audio.playMenuClick();
    const diff = Storage.Settings.getOne('difficulty');
    document.getElementById('overlay-over').classList.add('hidden');
    Game.init(diff, gameMode);
    Game.start();
  });
  document.getElementById('btn-menu-from-over').addEventListener('click', () => {
    Audio.playMenuClick();
    document.getElementById('overlay-over').classList.add('hidden');
    show('menu');
  });

  // Name input — FIXED
  document.getElementById('name-submit').addEventListener('click', () => {
    const rawName = document.getElementById('name-input').value;
    const name = (rawName && rawName.trim()) ? rawName.trim() : 'KNIGHT';
    Storage.Leaderboard.add(name, pendingScore);
    show('leaderboard');
    populateLeaderboard();
  });

  document.getElementById('name-skip').addEventListener('click', () => {
    Audio.playMenuClick();
    show('menu');
  });

  // Also submit on Enter key
  document.getElementById('name-input').addEventListener('keydown', e => {
    if(e.key === 'Enter'){
      e.preventDefault();
      document.getElementById('name-submit').click();
    }
  });

  function populateThemes(){
    const grid = document.getElementById('theme-grid');
    const current = Storage.Settings.getOne('theme');
    const list = Object.entries(CONFIG.themes).map(([id, t]) => ({id, ...t}));
    grid.innerHTML = '';
    list.forEach(t => {
      const card = document.createElement('div');
      card.className = 'theme-card' + (t.id===current ? ' active' : '');
      card.innerHTML = `<div class="theme-preview" style="background:${t.bg}"></div><div class="theme-name">${t.name}</div>`;
      card.addEventListener('click', () => {
        Audio.playMenuClick();
        Storage.Settings.set('theme', t.id);
        Renderer.setTheme(t.id);
        populateThemes();
      });
      grid.appendChild(card);
    });
  }

  function populateLeaderboard(){
    const container = document.getElementById('leaderboard-table');
    const lb = Storage.Leaderboard.get();
    if(lb.length === 0){
      container.innerHTML = '<div class="lb-empty">No champions yet... Be the first!</div>';
      return;
    }
    container.innerHTML = '';
    lb.forEach((e,i) => {
      const row = document.createElement('div');
      row.className = 'lb-row';
      const rankClass = i===0?'gold':i===1?'silver':i===2?'bronze':'';
      row.innerHTML = `<span class="lb-rank ${rankClass}">${i+1}</span><span class="lb-name">${e.name}</span><span class="lb-score">${e.score}</span>`;
      container.appendChild(row);
    });
  }

  function populateStats(){
    const s = Storage.Stats.get();
    const grid = document.getElementById('stats-grid');
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

  function populateSettings(){
    const s = Storage.Settings.get();
    const setToggle = (id, key) => {
      const btn = document.getElementById(id);
      if(!btn) return;
      btn.textContent = s[key] ? 'ON' : 'OFF';
      btn.className = 'toggle ' + (s[key] ? 'on' : '');
      btn.onclick = () => {
        Audio.playMenuClick();
        const newVal = !Storage.Settings.getOne(key);
        Storage.Settings.set(key, newVal);
        populateSettings();
        if(key === 'sfx' || key === 'music') Audio.setMute(Storage.Settings.getOne('sfx'), Storage.Settings.getOne('music'));
      };
    };
    setToggle('set-sfx', 'sfx');
    setToggle('set-music', 'music');
    setToggle('set-shake', 'shake');
    setToggle('set-particles', 'particles');
  }

  function showGameOver(score, combo, level, isHigh){
    show('game');
    document.getElementById('overlay-over').classList.remove('hidden');
    document.getElementById('over-score').textContent = score;
    document.getElementById('over-combo').textContent = 'x' + combo;
    document.getElementById('over-level').textContent = level;
    const rankEl = document.getElementById('over-rank');
    if(isHigh){
      const rank = Storage.Leaderboard.rank(score);
      document.getElementById('over-rank-num').textContent = rank;
      rankEl.classList.remove('hidden');
    } else {
      rankEl.classList.add('hidden');
    }
  }

  function startGame(mode){
    gameMode = mode;
    const diff = Storage.Settings.getOne('difficulty');
    const theme = Storage.Settings.getOne('theme');
    Renderer.setTheme(theme);
    Game.init(diff, mode);
    show('game');
    document.getElementById('overlay-start').classList.remove('hidden');
    document.getElementById('overlay-over').classList.add('hidden');
    document.getElementById('overlay-pause').classList.add('hidden');
    updateHUD();
  }

  function updateHUD(){
    const s = Game.getState();
    if(!s) return;
    document.getElementById('hud-score').textContent = Math.max(0, s.score);
    document.getElementById('hud-level').textContent = s.level;
    document.getElementById('hud-best').textContent = Storage.Stats.get().bestScore;
    const comboEl = document.getElementById('hud-combo');
    if(s.combo >= 2){
      comboEl.textContent = '🔥 x' + Math.min(s.combo, 5);
      comboEl.classList.remove('hidden');
    } else {
      comboEl.classList.add('hidden');
    }
  }

  function checkHighScoreName(score){
    if(Storage.Leaderboard.isHigh(score)){
      pendingScore = score;
      document.getElementById('name-score').textContent = score;
      document.getElementById('name-input').value = '';
      show('name');
      // Focus input after screen transition
      setTimeout(() => document.getElementById('name-input').focus(), 100);
      return true;
    }
    return false;
  }

  // Hover sounds
  document.querySelectorAll('.btn, .theme-card, .toggle').forEach(el => {
    el.addEventListener('mouseenter', () => Audio.playMenuHover());
  });

  return { show, startGame, updateHUD, showGameOver, checkHighScoreName };
})();