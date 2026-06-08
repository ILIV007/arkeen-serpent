# Arkeen Serpent

A modern Space Arcade Snake game. Clean architecture, event-driven, zero dependencies.

```
src/
  core/        — state, config, loop (single RAF)
  systems/     — input, audio, storage
  gameplay/    — snake movement, rules engine
  render/      — renderer, particles (visual only)
  ui/          — screens, menu, HUD
  utils/       — events, math

```

Upload to **Cloudflare Pages** → Direct Upload → Deploy.

MIT — Built with ⚔ by the Arkeen Guild.
