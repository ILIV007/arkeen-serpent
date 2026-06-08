/**
 * MAIN ENGINE — Arkeen Serpent
 */
(function(){
  let lastTime = 0;
  let running = false;

  function init(){
    const theme = Storage.Settings.getOne('theme');
    Renderer.setTheme(theme);
    document.body.style.background = Renderer.getTheme().bg;
    running = true;
    requestAnimationFrame(loop);
  }

  function loop(timestamp){
    if(!running) return;
    const dt = timestamp - lastTime;
    lastTime = timestamp;

    if(Input.consumePause()){
      if(Game.getState().running){
        Game.pause();
        document.getElementById('overlay-pause').classList.remove('hidden');
      } else if(document.getElementById('screen-game').classList.contains('active') && document.getElementById('overlay-start').classList.contains('hidden')){
        if(!Game.getState().gameOver){
          Game.resume();
          document.getElementById('overlay-pause').classList.add('hidden');
        }
      }
    }

    Game.update(dt);

    if(document.getElementById('screen-game').classList.contains('active')){
      Renderer.drawFrame(Game.getState());
      Menu.updateHUD();
    }

    requestAnimationFrame(loop);
  }

  window.addEventListener('load', init);
})();