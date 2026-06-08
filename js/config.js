/**
 * CONFIG — Arkeen Serpent
 * Central balance & theme settings
 */
const CONFIG = {
  COLS: 40,
  ROWS: 40,
  PX: 14,

  difficulty: {
    easy:     {speed:150, poison:false, obstacle:false, movingObs:false, enemy:false, trap:false, pits:false},
    normal:   {speed:120, poison:true,  obstacle:false, movingObs:false, enemy:false, trap:false, pits:false},
    hard:     {speed:100, poison:true,  obstacle:true,  movingObs:false, enemy:false, trap:false, pits:true},
    expert:   {speed:80,  poison:true,  obstacle:true,  movingObs:true,  enemy:false, trap:false, pits:true},
    nightmare:{speed:60,  poison:true,  obstacle:true,  movingObs:true,  enemy:true,  trap:true, pits:true}
  },

  adventure: {
    poison: 10,
    golden: 20,
    obstacle: 30,
    movingObs: 40,
    pits: 35,
    enemy: 50,
    trap: 75
  },

  themes: {
    space:   {bg:'#050510', tile1:'#0a0a1a', tile2:'#12122a', border:'#1a1a3a', accent:'#3a3a60', gold:'#80a0ff', snakeH:220, snakeS:60, snakeL:50, name:'Nebula Void'},
    dungeon: {bg:'#0a000a', tile1:'#140014', tile2:'#1a001a', border:'#3a003a', accent:'#6a2060', gold:'#c080ff', snakeH:280, snakeS:50, snakeL:40, name:'Dungeon Depths'},
    forest:  {bg:'#000a00', tile1:'#001400', tile2:'#0a1a0a', border:'#1a4a00', accent:'#206020', gold:'#80d040', snakeH:100, snakeS:55, snakeL:40, name:'Forest Quest'},
    volcano: {bg:'#1a0500', tile1:'#2a0800', tile2:'#3a0a00', border:'#6a2000', accent:'#a04020', gold:'#ff8040', snakeH:15,  snakeS:70, snakeL:45, name:'Volcanic Keep'},
    icy:     {bg:'#000a14', tile1:'#00101a', tile2:'#001a2a', border:'#0a3a5a', accent:'#206080', gold:'#80e0ff', snakeH:190, snakeS:60, snakeL:50, name:'Icy Tower'},
    mystic:  {bg:'#0a0014', tile1:'#14001a', tile2:'#1a002a', border:'#3a0060', accent:'#602080', gold:'#c080ff', snakeH:270, snakeS:55, snakeL:45, name:'Mystic Realm'}
  },

  pits: {
    spawnInterval: 600,   // frames between pit spawns
    duration: 500,        // frames pit stays open
    warning: 90,          // frames warning before opening
    maxActive: 3          // max pits at once
  },

  meteors: {
    spawnRate: 0.003,     // chance per frame
    speedMin: 1.5,        // px per frame
    speedMax: 3.5,
    life: 300             // frames
  }
};