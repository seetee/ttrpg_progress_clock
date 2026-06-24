# Progress Clocks

[![Vibe Coded](https://img.shields.io/badge/vibe-coded-ff69b4?style=flat-square)](https://github.com/topics/vibe-coding)
[![Built with Claude](https://img.shields.io/badge/built%20with-Claude-orange?style=flat-square&logo=anthropic)](https://claude.ai)

A minimal, offline-first PWA for Game Masters running tabletop RPG sessions.

Progress clocks are a tool popularised by *Blades in the Dark*: a circle divided into segments that fills up incrementally as a larger event unfolds — an alarm system tripping, a ritual completing, guards closing in. When the clock is full, something happens.

## Features

- **Tap** a clock to advance it one step
- **Long-press** (hold ~½ second) to undo the last step — a dim flash confirms it
- **Grid view** — all active clocks visible at a glance
- **6 colour palettes** in OKLCH — Crimson, Venom, Arcane (animated), Ember, Frost, Iron
- **Segment presets** matching standard TTRPG dice: d2, d4, d6, d8, d10, d12, d20, or any custom value from 2–20
- **Hidden config** — a discreet pencil icon (bottom-left) toggles edit mode; players only see clocks
- **Screen Wake Lock** — the display stays on during sessions
- **Fully offline** — service worker caches all assets after first load
- **Installable** — add to home screen on any device
- All state saved in `localStorage`; no accounts, no server

## Usage

Open `index.html` in any modern browser, or serve the folder with any static file server:

```bash
npx serve .
# or
python3 -m http.server
```

To edit clocks (add, rename, reset, delete): tap the **✏ pencil icon** bottom-left to enter edit mode. Tap again to hide the controls before showing the screen to your players.

## Inspiration and references

- [Progress Clocks — Blades in the Dark](https://bladesinthedark.com/progress-clocks)
- [VTT Progress Clocks by GM Lazarus](https://gm-lazarus.itch.io/vtt-progress-clocks)
- [Reddit thread on progress clock tools](https://www.reddit.com/r/rpg/comments/1ahefvj/comment/konkouc/)

## Technical notes

Vanilla HTML, CSS, and JavaScript — no build step, no framework, no dependencies. All colours are defined in `oklch()`. Animations respect `prefers-reduced-motion`. WCAG AA contrast throughout.

---

> Vibe coded with [Claude](https://claude.ai)
