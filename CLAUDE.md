# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Offline-first PWA of TTRPG progress clocks (Blades in the Dark style). Vanilla HTML/CSS/JS — no build step, no framework, no dependencies, no tests.

## Running

```bash
npx serve .          # or: python3 -m http.server
```

Opening `index.html` via `file://` works for the UI but not for the service worker or install prompt — use a server when touching PWA behaviour.

CSS is inline in `index.html`'s `<style>` block by design — there is no separate stylesheet, and re-introducing one would add back the render-blocking request it was inlined to remove.

## Architecture — all in `app.js`

- **`PALETTES`** — the single source of colour truth. Each entry supplies `base`/`mid`/`empty`/`glow` in `oklch()`, plus optional behaviour flags `animated` (CSS pulse) and `sweep` (rotating arc overlay). Adding a palette is a one-object edit; the dialog swatches, the card, and the SVG all read from it. The flags are surfaced to CSS as `data-animated` / `data-sweep` attributes on `.clock-card`, the colours as inline `--c-*` properties.
- **Three render paths, and the distinction matters.** `updateClock(id)` patches a single card for ticks — never route a tick through a re-render, because replacing the grid destroys the focused element (a keyboard user could then advance only once) and restarts every CSS transition. `render()` wraps a full rebuild in a View Transition for add/edit/delete. `renderAll()` is the raw rebuild, called directly only by `init()`. All interpolated user text goes through `escHtml()`.
- **Event delegation** — every listener is attached once to `#clock-grid` (or a fixed `#id`) in `initEvents()`, never to rendered cards, precisely because a rebuild destroys them.

State persists as JSON under the `progress-clocks-v1` localStorage key.

**Animation tempo is data.** `renderAll()` and `updateClock()` both emit `--fill` (a percentage, for the underline rule) and `--ratio` (0–1) onto the card. CSS derives `--breath` from `--ratio`, and *every paced animation on a card must read `--breath`* — a hard-coded duration will beat against the others as a clock fills. Both properties are written in two places; keep them together so they can't drift.

**`localStorage` is a trust boundary.** `sanitize()` clamps and coerces on load; without it an unknown palette key throws inside `init()`, leaving a blank page and no in-app recovery. Renaming a palette key is therefore not free — stored clocks reference keys by name, and an unrecognised one falls back to `crimson`. That's cosmetic, not data loss, and there is deliberately no migration map: add one if a rename ever needs to preserve colour for existing installs.

The `#sr-status` live region lives **outside** `#clock-grid` by necessity — inside, a rebuild would destroy it before it could announce.

**Edit mode** is purely a `body.edit-mode` class — CSS reveals the per-card controls and the FAB. Nothing is hidden from the DOM, so the players' view and the GM's view are the same markup.

## Service worker

`sw.js` uses a cache-first strategy for same-origin requests, with `ASSETS` listing the precached files. Bump `CACHE` whenever cached assets change — the `activate` handler deletes every cache whose name doesn't match, and stale clients otherwise keep serving the old bundle. Any new asset file must be added to `ASSETS`. Note the `CACHE` value and the localStorage key are unrelated namespaces that happen to share a prefix; bumping the latter would wipe users' saved clocks.

All paths in `manifest.json`, `sw.js`, and `index.html` are relative (`./`) so the app works when served from a subdirectory such as GitHub Pages. Keep them that way.
