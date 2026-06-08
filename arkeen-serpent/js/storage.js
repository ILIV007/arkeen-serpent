/**
 * STORAGE ENGINE — Arkeen Serpent
 */
const Storage = (function(){
  const PREFIX = 'arkeen_';

  function get(key){ try{ return JSON.parse(localStorage.getItem(PREFIX+key)) }catch(e){ return null } }
  function set(key,val){ try{ localStorage.setItem(PREFIX+key,JSON.stringify(val)) }catch(e){} }
  function def(key,defaultVal){ const v=get(key); if(v===null){set(key,defaultVal);return defaultVal} return v }

  const Leaderboard = {
    get(){ return def('leaderboard',[]) },
    add(name,score){
      const lb=this.get();
      lb.push({name:name.substring(0,8),score,date:new Date().toLocaleDateString()});
      lb.sort((a,b)=>b.score-a.score);
      const trimmed=lb.slice(0,5);
      set('leaderboard',trimmed);
      return trimmed;
    },
    isHigh(score){ const lb=this.get(); return lb.length<5 || score>lb[lb.length-1].score },
    rank(score){ const lb=this.get(); return lb.findIndex(e=>e.score<score)+1 || lb.length+1 }
  };

  const Settings = {
    get(){ return def('settings',{sfx:true,music:true,shake:true,particles:true,difficulty:'normal',theme:'royal'}) },
    set(k,v){ const s=this.get(); s[k]=v; set('settings',s); },
    getOne(k){ return this.get()[k] }
  };

  const Stats = {
    get(){ return def('stats',{gamesPlayed:0,totalApples:0,bestScore:0,bestCombo:0,totalTime:0,totalScore:0}) },
    addGame(score,apples,combo,time){
      const s=this.get();
      s.gamesPlayed++; s.totalApples+=apples; s.totalScore+=score; s.totalTime+=time;
      if(score>s.bestScore) s.bestScore=score;
      if(combo>s.bestCombo) s.bestCombo=combo;
      set('stats',s);
    }
  };

  const Achievements = {
    get(){ return def('achievements',{}) },
    unlock(id){ const a=this.get(); if(!a[id]){ a[id]=true; set('achievements',a); return true } return false },
    has(id){ return !!this.get()[id] }
  };

  return { Leaderboard, Settings, Stats, Achievements };
})();