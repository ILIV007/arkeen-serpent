/**
 * INPUT ENGINE — Arkeen Serpent
 */
const Input = (function(){
  const state = { dir: {x:1,y:0}, nextDir: {x:1,y:0}, paused: false, menuBack: false };
  let touchStart = null;
  const SWIPE_THRESHOLD = 30;

  const KEYS = {
    ArrowUp: {x:0,y:-1}, ArrowDown: {x:0,y:1}, ArrowLeft: {x:-1,y:0}, ArrowRight: {x:1,y:0},
    w: {x:0,y:-1}, s: {x:0,y:1}, a: {x:-1,y:0}, d: {x:1,y:0},
    W: {x:0,y:-1}, S: {x:0,y:1}, A: {x:-1,y:0}, D: {x:1,y:0}
  };

  function setDir(d){
    if(d.x === -state.dir.x && d.y === -state.dir.y) return;
    state.nextDir = {x: d.x, y: d.y};
  }

  document.addEventListener('keydown', e => {
    if(KEYS[e.key]){ e.preventDefault(); setDir(KEYS[e.key]); }
    if(e.key === 'p' || e.key === 'P' || e.key === 'Escape'){ state.paused = true; }
  });

  const canvasWrap = document.getElementById('canvas-wrap') || document.body;
  canvasWrap.addEventListener('touchstart', e => {
    if(e.touches.length === 1){ touchStart = {x: e.touches[0].clientX, y: e.touches[0].clientY}; }
  }, {passive: false});

  canvasWrap.addEventListener('touchmove', e => { e.preventDefault(); }, {passive: false});

  canvasWrap.addEventListener('touchend', e => {
    if(!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    const absX = Math.abs(dx), absY = Math.abs(dy);
    if(Math.max(absX, absY) > SWIPE_THRESHOLD){
      if(absX > absY) setDir({x: dx > 0 ? 1 : -1, y: 0});
      else setDir({x: 0, y: dy > 0 ? 1 : -1});
    }
    touchStart = null;
  });

  function reset(){ state.dir = {x:1,y:0}; state.nextDir = {x:1,y:0}; state.paused = false; state.menuBack = false; }
  function consumePause(){ const p = state.paused; state.paused = false; return p; }
  function getDir(){ state.dir = state.nextDir; return state.dir; }
  function getNextDir(){ return state.nextDir; }

  return { reset, consumePause, getDir, getNextDir, setDir };
})();