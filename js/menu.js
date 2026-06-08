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

  let currentScreen = 'menu';
  let pendingScore = 0;

  function show(name){
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
    currentScreen = name;
    if(name !== 'game') Audio.stopAmbient();
  }

  function back(){ show('menu'); }

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

  document.querySelectorAll('[data-diff]').forEach(btn => {
    btn.addEventListener('click', () => {
      Audio.playMenuClick();
      Storage.Settings.set('difficulty', btn.dataset.diff);
      startGame('difficulty');
    });
  });

  function populateThemes(){
    const grid = document.getElementById('theme-grid');
    const current = Storage.Settings.getOne('theme');
    const list = [
      {id:'royal', name:'Royal Courtyard', bg:'#0a0a1a', accent:'#c9a840'},
      {id:'dungeon', name:'Dungeon Depths', bg:'#0a000a', accent:'#c080ff'},
      {id:'forest', name:'Forest Quest', bg:'#000a00', accent:'#80d040'},
      {id:'volcano', name:'Volcanic Keep', bg:'#1a0500', accent:'#ff8040'},
      {id:'icy', name:'Icy Tower', bg:'#000a14', accent:'#80e0ff'},
      {id:'mystic', name:'Mystic Realm', bg:'#0a0014', accent:'#c080ff'}
    ];
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

  document.getElementById('name-submit').addEventListener('click', () => {
    const name = document.getElementById('name-input').value.trim() || 'KNIGHT';
    Storage.Leaderboard.add(name, pendingScore);
    document.getElementById('screen-name').classList.remove('active');
    populateLeaderboard();
    show('leaderboard');
  });
  document.getElementById('name-skip').addEventListener('click', () => {
    document.getElementById('screen-name').classList.remove('active');
    show('menu');
  });

  document.getElementById('btn-start').addEventListener('click', () => {
    Audio.playMenuClick();
    document.getElementById('overlay-start').classList.add('hidden');
    Game.start();
  });
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
  document.getElementById('btn-quit').addEventListener('click', () => {
    Audio.playMenuClick();
    document.getElementById('overlay-pause').classList.add('hidden');
    show('menu');
  });
  document.getElementById('btn-retry').addEventListener('click', () => {
    Audio.playMenuClick();
    const diff = Storage.Settings.getOne('difficulty');
    document.getElementById('overlay-over').classList.add('hidden');
    Game.init(diff, 'adventure');
    Game.start();
  });
  document.getElementById('btn-menu').addEventListener('click', () => {
    Audio.playMenuClick();
    document.getElementById('overlay-over').classList.add('hidden');
    show('menu');
  });

  function startGame(mode){
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
    document.getElementById('hud-score').textContent = Math.max(0, s.score);
    document.getElementById('hud-level').textContent = s.level;
    document.getElementById('hud-best').textContent = Storage.Stats.get().bestScore;
    const comboEl = document.getElementById('hud-combo');
    if(s.combo >= 2){
      comboEl.textContent = `🔥 COMBO x${Math.min(s.combo, 5)}`;
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
      return true;
    }
    return false;
  }

  document.querySelectorAll('.btn, .theme-card, .toggle').forEach(el => {
    el.addEventListener('mouseenter', () => Audio.playMenuHover());
  });

  return { show, startGame, updateHUD, showGameOver, checkHighScoreName };
})();