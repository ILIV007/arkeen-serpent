/**
 * GAME LOGIC — Arkeen Serpent
 */
const Game = (function(){
  const COLS = 40, ROWS = 40;

  const DIFFICULTY = {
    easy:     {speed:150, poison:false, obstacle:false, movingObs:false, enemy:false, trap:false},
    normal:   {speed:120, poison:true,  obstacle:false, movingObs:false, enemy:false, trap:false},
    hard:     {speed:100, poison:true,  obstacle:true,  movingObs:false, enemy:false, trap:false},
    expert:   {speed:80,  poison:true,  obstacle:true,  movingObs:true,  enemy:false, trap:false},
    nightmare:{speed:60,  poison:true,  obstacle:true,  movingObs:true,  enemy:true,  trap:true}
  };

  let state = {};
  let diffSettings = DIFFICULTY.normal;
  let mode = 'adventure';

  function init(diffName='normal', gameMode='adventure'){
    mode = gameMode;
    diffSettings = DIFFICULTY[diffName] || DIFFICULTY.normal;
    const startX = 20, startY = 20;
    state = {
      snake: [{x:startX,y:startY},{x:startX-1,y:startY},{x:startX-2,y:startY},{x:startX-3,y:startY}],
      dir: {x:1,y:0},
      apple: null,
      appleType: 'normal',
      score: 0,
      level: 1,
      xp: 0,
      combo: 0,
      comboTimer: 0,
      bestCombo: 0,
      applesEaten: 0,
      obstacles: [],
      enemies: [],
      tiles: [],
      running: false,
      gameOver: false,
      moveTimer: 0,
      moveInterval: diffSettings.speed,
      goldenTimer: 0,
      startTime: Date.now()
    };
    generateTiles();
    spawnApple();
    Input.reset();
  }

  function generateTiles(){
    state.tiles = [];
    for(let r=0;r<ROWS;r++){
      state.tiles[r] = [];
      for(let c=0;c<COLS;c++){
        if(r===0 || r===ROWS-1 || c===0 || c===COLS-1) state.tiles[r][c] = 'border';
        else if((c+r)%6===0) state.tiles[r][c] = 'patternA';
        else if((c*2+r*3)%7===0) state.tiles[r][c] = 'patternB';
        else state.tiles[r][c] = 'normal';
      }
    }
  }

  function getAdventureRules(){
    const s = state.score;
    return {
      poison: s >= 10,
      golden: s >= 20,
      obstacle: s >= 30,
      movingObs: s >= 40,
      enemy: s >= 50,
      trap: s >= 75
    };
  }

  function getActiveRules(){
    if(mode === 'adventure') return getAdventureRules();
    return {
      poison: diffSettings.poison,
      golden: true,
      obstacle: diffSettings.obstacle,
      movingObs: diffSettings.movingObs,
      enemy: diffSettings.enemy,
      trap: diffSettings.trap
    };
  }

  function spawnApple(){
    const rules = getActiveRules();
    const available = [];
    for(let r=1;r<ROWS-1;r++)for(let c=1;c<COLS-1;c++){
      if(state.snake.some(s=>s.x===c&&s.y===r)) continue;
      if(state.obstacles.some(o=>o.x===c&&o.y===r)) continue;
      available.push({x:c,y:r});
    }
    if(available.length===0) return;
    const pos = available[Math.floor(Math.random()*available.length)];
    let type = 'normal';
    if(rules.golden && state.goldenTimer <= 0 && Math.random() < 0.15) type = 'golden';
    else if(rules.poison && Math.random() < 0.12) type = 'poison';
    state.apple = {x: pos.x, y: pos.y, type: type};
    if(type === 'golden') state.goldenTimer = 400;
  }

  function spawnObstacle(){
    const rules = getActiveRules();
    if(!rules.obstacle || state.obstacles.length >= 5) return;
    let attempts = 0;
    while(attempts++ < 50){
      const c = 2 + Math.floor(Math.random()*(COLS-4));
      const r = 2 + Math.floor(Math.random()*(ROWS-4));
      if(state.snake.some(s=>s.x===c&&s.y===r)) continue;
      if(state.apple && state.apple.x===c && state.apple.y===r) continue;
      if(state.obstacles.some(o=>o.x===c&&o.y===r)) continue;
      state.obstacles.push({x:c, y:r, moving: false});
      break;
    }
  }

  function spawnEnemy(){
    const rules = getActiveRules();
    if(!rules.enemy || state.enemies.length >= 2) return;
    const edge = Math.floor(Math.random()*4);
    let ex, ey;
    if(edge===0){ ex=1; ey=Math.floor(Math.random()*(ROWS-2))+1; }
    else if(edge===1){ ex=COLS-2; ey=Math.floor(Math.random()*(ROWS-2))+1; }
    else if(edge===2){ ex=Math.floor(Math.random()*(COLS-2))+1; ey=1; }
    else { ex=Math.floor(Math.random()*(COLS-2))+1; ey=ROWS-2; }
    state.enemies.push({x:ex, y:ey, dir:{x:0,y:0}, timer:0});
  }

  function updateEnemies(){
    state.enemies.forEach(e => {
      e.timer++;
      if(e.timer < 8) return;
      e.timer = 0;
      const head = state.snake[0];
      const dx = head.x - e.x, dy = head.y - e.y;
      let mx = 0, my = 0;
      if(Math.abs(dx) > Math.abs(dy)) mx = dx > 0 ? 1 : -1;
      else my = dy > 0 ? 1 : -1;
      const nx = e.x + mx, ny = e.y + my;
      if(state.snake.some(s=>s.x===nx&&s.y===ny)) return;
      e.x = nx; e.y = ny;
    });
  }

  function updateObstacles(){
    const rules = getActiveRules();
    state.obstacles.forEach(o => {
      if(!o.moving || !rules.movingObs) return;
      if(Math.random() > 0.05) return;
      const dirs = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
      const d = dirs[Math.floor(Math.random()*dirs.length)];
      const nx = o.x + d.x, ny = o.y + d.y;
      if(nx<=0 || nx>=COLS-1 || ny<=0 || ny>=ROWS-1) return;
      if(state.snake.some(s=>s.x===nx&&s.y===ny)) return;
      if(state.apple && state.apple.x===nx && state.apple.y===ny) return;
      o.x = nx; o.y = ny;
    });
  }

  function update(dt){
    if(!state.running || state.gameOver) return;
    state.moveTimer += dt;
    state.comboTimer -= dt;
    state.goldenTimer -= dt;

    const needed = state.level * 50;
    if(state.xp >= needed){
      state.level++;
      state.xp -= needed;
      Audio.playLevelUp();
      Renderer.addFloatingText(state.snake[0].x*Renderer.PX, state.snake[0].y*Renderer.PX, 'LEVEL UP!', '#ffd700', 50);
    }

    const rules = getActiveRules();
    if(rules.obstacle && state.score > 0 && state.score % 10 === 0 && state.obstacles.length === 0) spawnObstacle();
    if(rules.enemy && state.score > 0 && state.score % 15 === 0 && state.enemies.length === 0) spawnEnemy();

    if(state.moveTimer >= state.moveInterval){
      state.moveTimer = 0;
      const dir = Input.getDir();
      state.dir = dir;
      const head = {x: state.snake[0].x + dir.x, y: state.snake[0].y + dir.y};

      if(head.x <= 0 || head.x >= COLS-1 || head.y <= 0 || head.y >= ROWS-1){ die(); return; }
      if(state.snake.some(s => s.x === head.x && s.y === head.y)){ die(); return; }
      if(state.obstacles.some(o => o.x === head.x && o.y === head.y)){ die(); return; }
      if(state.enemies.some(e => e.x === head.x && e.y === head.y)){ die(); return; }

      state.snake.unshift(head);

      if(state.apple && head.x === state.apple.x && head.y === state.apple.y){
        const type = state.apple.type;
        let points = 1;
        if(type === 'golden'){ points = 10; Audio.playGolden(); Renderer.triggerShake(4); }
        else if(type === 'poison'){ points = -3; Audio.playPoison(); Renderer.triggerShake(2); }
        else { Audio.playEat(); }

        if(type !== 'poison' && points > 0){
          if(state.comboTimer > 0){
            state.combo++;
            if(state.combo > state.bestCombo) state.bestCombo = state.combo;
            if(state.combo >= 2){
              const mult = Math.min(state.combo, 5);
              points *= mult;
              Renderer.addFloatingText(head.x*Renderer.PX, head.y*Renderer.PX, `COMBO x${mult}`, '#ff6040', 40);
              if(state.combo >= 3) Audio.playCombo(Math.min(state.combo, 4));
              if(state.combo >= 5) Renderer.triggerShake(3);
            }
          } else { state.combo = 1; }
          state.comboTimer = 3000;
        } else { state.combo = 0; }

        state.score += points;
        state.xp += 15;
        state.applesEaten++;
        if(points > 0) Renderer.spawnParticles(head.x*Renderer.PX + Renderer.PX/2, head.y*Renderer.PX + Renderer.PX/2, type==='golden'?'#ffd700':'#ff4040', 10, 3);
        spawnApple();
        state.moveInterval = Math.max(diffSettings.speed * 0.6, state.moveInterval - 1);
      } else {
        state.snake.pop();
      }

      updateEnemies();
      updateObstacles();
    }
  }

  function die(){
    state.gameOver = true;
    state.running = false;
    Audio.playGameOver();
    Renderer.triggerShake(5);
    const playTime = Math.floor((Date.now() - state.startTime)/1000);
    Storage.Stats.addGame(Math.max(0, state.score), state.applesEaten, state.bestCombo, playTime);
    const isHigh = Storage.Leaderboard.isHigh(Math.max(0, state.score));
    Menu.showGameOver(Math.max(0, state.score), state.bestCombo, state.level, isHigh);
  }

  function getState(){ return state; }
  function start(){ state.running = true; Audio.startAmbient(); }
  function pause(){ state.running = false; Audio.stopAmbient(); }
  function resume(){ state.running = true; Audio.startAmbient(); }

  return { init, update, getState, start, pause, resume, COLS, ROWS };
})();