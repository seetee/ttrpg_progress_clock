# Progress Clocks

[![vibe coded](https://img.shields.io/badge/vibe_coded-%E2%9C%A8-ff69b4?style=flat-square)](https://en.wikipedia.org/wiki/Vibe_coding)
[![coded with Claude](https://img.shields.io/badge/coded_with-Claude_Code-CC785C?style=flat-square&logo=anthropic)](https://claude.ai/code)
[![license: AGPL v3](https://img.shields.io/badge/license-AGPL_v3-blue?style=flat-square)](LICENSE)

A minimal, offline-first PWA for Game Masters running tabletop RPG sessions.

Progress clocks are a tool popularised by *Blades in the Dark*: a circle divided into segments that fills up incrementally as a larger event unfolds — an alarm system tripping, a ritual completing, guards closing in. When the clock is full, something happens.

## Features

- **Tap** a clock to advance it one step
- **Long-press** (hold ~½ second) to undo the last step — a dim flash confirms it
- **Keyboard** — Tab to a clock, then Enter or Space to advance, Backspace to step back
- **Grid view** — all active clocks visible at a glance
- **Escalating tempo** — a clock's animation is a function of how full it is. Empty, it sits near-dormant at a 7-second cycle and doesn't flash at all; at the last segment it pulses and sweeps at 1.7 seconds. Dread you can see from across the table without reading the numbers.
- **6 colour palettes** in OKLCH — Crimson, Venom and Cypher pulse; Ember and Frost sweep; Iron stays still
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
- [npc](https://github.com/seetee/npc) — the session overlay this app's cold-glass surfaces and scanline field are lifted from

## Design

Warm phosphor on cold machined glass, by way of the [npc](https://github.com/seetee/npc) overlay — a bit Ninth World. Surfaces sit at one hue and everything lit sits at another, so the clock palettes read as illuminated rather than painted. Clock names are set in a condensed grotesque and treated as signage: this is an instrument read across a table in dim light, not a document.

## Technical notes

Vanilla HTML, CSS, and JavaScript — no build step, no framework, no dependencies. All colours are defined in `oklch()`.

Ticking a clock patches that one card in place rather than re-rendering the grid, so keyboard focus survives and CSS transitions can actually run. Clocks are `<button>`-role controls inside a real list, with changes announced through a live region.

Uses registered custom properties (`@property`), View Transitions, and `@starting-style` — all Baseline. Animations respect `prefers-reduced-motion`. WCAG AA contrast throughout, verified against the brightest point of the background rather than its average.
