/**
 * RENDERER — Arkeen Serpent
 */
const Renderer = (function(){
  const COLS = 40, ROWS = 40, PX = 14;
  const cv = document.getElementById('cv');
  const ctx = cv.getContext('2d');
  cv.width = COLS * PX; cv.height = ROWS * PX;
  ctx.imageSmoothingEnabled = false;

  const THEMES = {
    royal:   {bg:'#0a0a1a', tile1:'#12122a', tile2:'#1a1a3a', border:'#2a2030', accent:'#4a3a60', gold:'#c9a840', snakeH:160, snakeS:60, snakeL:45},
    dungeon: {bg:'#0a000a', tile1:'#140014', tile2:'#1a001a', border:'#3a003a', accent:'#6a2060', gold:'#c080ff', snakeH:280, snakeS:50, snakeL:40},
    forest:  {bg:'#000a00', tile1:'#001400', tile2:'#0a1a0a', border:'#1a4a00', accent:'#206020', gold:'#80d040', snakeH:100, snakeS:55, snakeL:40},
    volcano: {bg:'#1a0500', tile1:'#2a0800', tile2:'#3a0a00', border:'#6a2000', accent:'#a04020', gold:'#ff8040', snakeH:15,  snakeS:70, snakeL:45},
    icy:     {bg:'#000a14', tile1:'#00101a', tile2:'#001a2a', border:'#0a3a5a', accent:'#206080', gold:'#80e0ff', snakeH:190, snakeS:60, snakeL:50},
    mystic:  {bg:'#0a0014', tile1:'#14001a', tile2:'#1a002a', border:'#3a0060', accent:'#602080', gold:'#c080ff', snakeH:270, snakeS:55, snakeL:45}
  };

  let currentTheme = 'royal';
  let particles = [];
  let floatingTexts = [];
  let shake = {x:0, y:0, intensity:0};
  let time = 0;

  function setTheme(t){ currentTheme = THEMES[t] ? t : 'royal'; }
  function getTheme(){ return THEMES[currentTheme]; }

  class Particle {
    constructor(x, y, color, speed, life, size){
      this.x = x; this.y = y; this.color = color;
      this.vx = (Math.random()-0.5)*speed; this.vy = (Math.random()-0.5)*speed - 1;
      this.life = life; this.maxLife = life; this.size = size;
    }
    update(){
      this.x += this.vx; this.y += this.vy; this.vy += 0.1;
      this.life--; return this.life > 0;
    }
    draw(ctx){
      const a = this.life / this.maxLife;
      ctx.globalAlpha = a;
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x, this.y, this.size, this.size);
      ctx.globalAlpha = 1;
    }
  }

  function spawnParticles(cx, cy, color, count=8, speed=3){
    for(let i=0;i<count;i++){
      particles.push(new Particle(cx, cy, color, speed, 20+Math.random()*15, 2+Math.random()*2));
    }
  }

  function addFloatingText(x, y, text, color='#f0d080', life=40){
    floatingTexts.push({x, y, text, color, life, maxLife: life, vy: -1});
  }
  function updateFloatingTexts(){
    floatingTexts = floatingTexts.filter(t => {
      t.y += t.vy; t.vy *= 0.95; t.life--;
      return t.life > 0;
    });
  }
  function drawFloatingTexts(){
    floatingTexts.forEach(t => {
      const a = t.life / t.maxLife;
      ctx.globalAlpha = a;
      ctx.fillStyle = t.color;
      ctx.font = 'bold 10px monospace';
      ctx.fillText(t.text, t.x, t.y);
      ctx.globalAlpha = 1;
    });
  }

  function triggerShake(intensity=3){ shake.intensity = intensity; }
  function updateShake(){
    if(shake.intensity > 0){
      shake.x = (Math.random()-0.5)*shake.intensity;
      shake.y = (Math.random()-0.5)*shake.intensity;
      shake.intensity *= 0.9;
      if(shake.intensity < 0.5) shake.intensity = 0;
    } else { shake.x = 0; shake.y = 0; }
  }

  function drawTile(c, r, type){
    const p = getTheme();
    const x = c*PX + shake.x, y = r*PX + shake.y;
    if(type === 'border'){
      ctx.fillStyle = p.border; ctx.fillRect(x, y, PX, PX);
      ctx.fillStyle = p.gold;
      ctx.fillRect(x, y, 2, 2); ctx.fillRect(x+PX-2, y, 2, 2);
      ctx.fillRect(x, y+PX-2, 2, 2); ctx.fillRect(x+PX-2, y+PX-2, 2, 2);
      if((c+r)%4 === 0){
        ctx.fillStyle = 'rgba(255,120,40,0.15)';
        ctx.fillRect(x+2, y+2, PX-4, PX-4);
      }
      return;
    }
    ctx.fillStyle = p.tile1; ctx.fillRect(x, y, PX, PX);
    if((c+r)%2 === 0){ ctx.fillStyle = p.tile2; ctx.fillRect(x+1, y+1, PX-2, PX-2); }
    if(type === 'patternA'){
      ctx.fillStyle = p.gold + '33';
      ctx.fillRect(x+PX/2-1, y+2, 2, PX-4);
      ctx.fillRect(x+2, y+PX/2-1, PX-4, 2);
    } else if(type === 'patternB'){
      ctx.fillStyle = p.accent + '44';
      ctx.fillRect(x+PX/2-1, y+1, 2, 2);
      ctx.fillRect(x+1, y+PX/2-1, 2, 2);
      ctx.fillRect(x+PX-3, y+PX/2-1, 2, 2);
      ctx.fillRect(x+PX/2-1, y+PX-3, 2, 2);
    }
    if((c*3+r*7)%23 === 0){
      ctx.fillStyle = 'rgba(40,80,40,0.2)';
      ctx.fillRect(x+2, y+PX-3, 3, 2);
    }
  }

  function drawBackground(){
    const p = getTheme();
    ctx.fillStyle = p.bg; ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.fillStyle = p.gold + '11';
    for(let i=0;i<20;i++){
      const dx = ((time*10 + i*137) % (COLS*PX));
      const dy = ((time*5 + i*89) % (ROWS*PX));
      ctx.fillRect(dx, dy, 1, 1);
    }
  }

  function drawGrid(tiles){
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++) drawTile(c, r, tiles[r][c]);
  }

  function drawApple(c, r, type='normal'){
    const p = getTheme();
    const x = c*PX + shake.x, y = r*PX + shake.y;
    const pulse = Math.sin(time*4)*0.5 + 0.5;
    const glowColor = type==='golden' ? 'rgba(255,200,40,' : type==='poison' ? 'rgba(128,40,200,' : 'rgba(200,40,40,';
    ctx.fillStyle = glowColor + (0.15 + pulse*0.1) + ')';
    ctx.fillRect(x-2, y-2, PX+4, PX+4);
    if(type === 'golden'){
      ctx.fillStyle = '#e0c020'; ctx.fillRect(x+2, y+2, PX-4, PX-4);
      ctx.fillStyle = '#f0e080'; ctx.fillRect(x+3, y+3, PX-6, PX-6);
      ctx.fillStyle = '#fff'; ctx.fillRect(x+4, y+4, 3, 2);
    } else if(type === 'poison'){
      ctx.fillStyle = '#8040c0'; ctx.fillRect(x+2, y+2, PX-4, PX-4);
      ctx.fillStyle = '#a060e0'; ctx.fillRect(x+3, y+3, PX-6, PX-6);
      ctx.fillStyle = '#40ff40'; ctx.fillRect(x+4, y+4, 2, 2); ctx.fillRect(x+8, y+6, 2, 2);
    } else {
      ctx.fillStyle = '#c02020'; ctx.fillRect(x+2, y+3, PX-4, PX-5);
      ctx.fillStyle = '#e03030'; ctx.fillRect(x+3, y+2, PX-6, PX-4);
      ctx.fillStyle = '#ff6060'; ctx.fillRect(x+3, y+3, 3, 2);
      ctx.fillStyle = '#f0d040'; ctx.fillRect(x+4, y+6, 2, 2); ctx.fillRect(x+8, y+5, 2, 2);
    }
    ctx.fillStyle = type==='poison'?'#40ff40':'#3a6020';
    ctx.fillRect(x+PX/2, y, 1, 3);
  }

  function drawSnake(snake, dir){
    const p = getTheme();
    for(let i=snake.length-1;i>=0;i--){
      const seg = snake[i];
      const x = seg.x*PX + shake.x, y = seg.y*PX + shake.y;
      const t = i / Math.max(snake.length, 1);
      const h = p.snakeH + t*20;
      const s = p.snakeS - t*10;
      const l = p.snakeL - t*12;
      const col = `hsl(${h},${s}%,${l}%)`;
      const dark = `hsl(${h},${s}%,${l-10}%)`;
      ctx.fillStyle = col; ctx.fillRect(x+1, y+1, PX-2, PX-2);
      ctx.fillStyle = dark;
      if(i%2===0){
        ctx.fillRect(x+2, y+2, PX/2-2, PX/2-2);
        ctx.fillRect(x+PX/2, y+PX/2, PX/2-2, PX/2-2);
      } else {
        ctx.fillRect(x+PX/2, y+2, PX/2-2, PX/2-2);
        ctx.fillRect(x+2, y+PX/2, PX/2-2, PX/2-2);
      }
      if(i===0){
        ctx.fillStyle = p.gold;
        ctx.fillRect(x+1, y, PX-2, 1); ctx.fillRect(x+1, y+PX-1, PX-2, 1);
        ctx.fillRect(x, y+1, 1, PX-2); ctx.fillRect(x+PX-1, y+1, 1, PX-2);
        ctx.fillStyle = '#f0c030';
        const ex1 = dir.x===0 ? x+3 : dir.x>0 ? x+PX-5 : x+1;
        const ey1 = dir.y===0 ? y+3 : dir.y>0 ? y+PX-5 : y+1;
        const ex2 = dir.x===0 ? x+PX-6 : ex1;
        const ey2 = dir.y===0 ? y+PX-6 : ey1;
        ctx.fillRect(ex1, ey1, 3, 3); ctx.fillRect(ex2, ey2, 3, 3);
        ctx.fillStyle = '#100'; ctx.fillRect(ex1+1, ey1+1, 1, 1); ctx.fillRect(ex2+1, ey2+1, 1, 1);
        ctx.fillStyle = '#e02020'; ctx.fillRect(x+PX/2-1, y+PX/2-1, 2, 2);
      }
    }
  }

  function drawObstacles(obstacles){
    const p = getTheme();
    obstacles.forEach(o => {
      const x = o.x*PX + shake.x, y = o.y*PX + shake.y;
      ctx.fillStyle = p.border; ctx.fillRect(x+1, y+1, PX-2, PX-2);
      ctx.fillStyle = '#4a4a5a'; ctx.fillRect(x+3, y+3, PX-6, PX-6);
      ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(x+2, y+2, 3, 3);
    });
  }

  function drawEnemies(enemies){
    enemies.forEach(e => {
      const x = e.x*PX + shake.x, y = e.y*PX + shake.y;
      ctx.fillStyle = '#c04040'; ctx.fillRect(x+2, y+2, PX-4, PX-4);
      ctx.fillStyle = '#ff6060'; ctx.fillRect(x+3, y+3, 2, 2);
      ctx.fillRect(x+PX-5, y+3, 2, 2);
    });
  }

  function updateParticles(){ particles = particles.filter(p => p.update()); }
  function drawParticles(){ particles.forEach(p => p.draw(ctx)); }

  function drawFrame(gameState){
    time += 0.016;
    updateShake();
    updateParticles();
    updateFloatingTexts();

    drawBackground();
    drawGrid(gameState.tiles);
    if(gameState.obstacles) drawObstacles(gameState.obstacles);
    if(gameState.enemies) drawEnemies(gameState.enemies);
    if(gameState.apple) drawApple(gameState.apple.x, gameState.apple.y, gameState.apple.type);
    drawSnake(gameState.snake, gameState.dir);
    drawParticles();
    drawFloatingTexts();
  }

  return {
    COLS, ROWS, PX, cv, ctx,
    setTheme, getTheme, drawFrame,
    spawnParticles, addFloatingText, triggerShake,
    THEMES
  };
})();