# 🌌 Arkeen Serpent v1.3

A modern Space Arcade Snake game. Clean architecture, event-driven, zero dependencies.

## Architecture
```
src/
  core/        — state, config, loop (single RAF)
  systems/     — input, audio, storage
  gameplay/    — snake movement, rules engine
  render/      — renderer, particles (visual only)
  ui/          — screens, menu, HUD
  utils/       — events, math
```

## Features
- 🎮 Adventure Mode + 5 Difficulty Levels
- 🌌 6 Space-Themed Realms (Nebula Void default)
- 🕳 Black Hole Pits (warning → open → close)
- ☄ Meteors across screen
- 🔥 Combo System + XP/Level
- 🏆 Local Leaderboard (Top 5, Arcade Style)
- 📜 Statistics
- 🎵 Procedural WebAudio SFX
- 📱 Swipe + Keyboard
- 📦 PWA Ready

## Deploy
Upload to **Cloudflare Pages** → Direct Upload → Deploy.

## Telegram
[t.me/ILIVIR3](https://t.me/ILIVIR3)

## License
MIT — Built with ⚔ by the Arkeen Guild.
