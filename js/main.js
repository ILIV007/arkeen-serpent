/**
 * MAIN ENGINE — Arkeen Serpent
 */
(function(){
  let lastTime = 0;
  let running = false;
  let attractMode = true;

  function init(){
    const theme = Storage.Settings.getOne('theme');
    Renderer.setTheme(theme);
    Renderer.initStars();
    document.body.style.background = Renderer.getTheme().bg;

    // Start in attract mode (game screen visible but not running)
    Menu.show('game');
    Game.init(Storage.Settings.getOne('difficulty'), 'adventure');
    running = true;
    requestAnimationFrame(loop);
  }

  function loop(timestamp){
    if(!running) return;
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    // Handle pause toggle (P or Escape)
    if(Input.consumePause()){
      const gs = Game.getState();
      if(gs && gs.running){
        Game.pause();
        document.getElementById('overlay-pause').classList.remove('hidden');
      } else if(document.getElementById('screen-game').classList.contains('active') &&
                document.getElementById('overlay-start').classList.contains('hidden') &&
                !gs.gameOver){
        Game.resume();
        document.getElementById('overlay-pause').classList.add('hidden');
      }
    }

    // Update game logic
    Game.update(dt);

    // Always render game screen when active
    if(document.getElementById('screen-game').classList.contains('active')){
      Renderer.drawFrame(Game.getState());
      Menu.updateHUD();
    }

    requestAnimationFrame(loop);
  }

  window.addEventListener('load', init);
})();