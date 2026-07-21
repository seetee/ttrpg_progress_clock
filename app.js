'use strict';

// ── Palettes ──────────────────────────────────────────────────────────────────
const PALETTES = {
  crimson: {
    label:    'Crimson',
    base:     'oklch(62% 0.230 14)',
    mid:      'oklch(76% 0.210 20)',
    empty:    'oklch(23% 0.052 14)',
    glow:     'oklch(62% 0.230 14 / 0.55)',
    animated: true,
  },
  venom: {
    label:    'Venom',
    base:     'oklch(60% 0.210 142)',
    mid:      'oklch(73% 0.185 132)',
    empty:    'oklch(21% 0.050 142)',
    glow:     'oklch(60% 0.210 142 / 0.55)',
    animated: true,
  },
  arcane: {
    label:    'Arcane',
    base:     'oklch(58% 0.270 302)',
    mid:      'oklch(72% 0.230 290)',
    empty:    'oklch(20% 0.060 302)',
    glow:     'oklch(58% 0.270 302 / 0.55)',
    animated: true,
  },
  ember: {
    label:    'Ember',
    base:     'oklch(68% 0.210 38)',
    mid:      'oklch(80% 0.185 52)',
    empty:    'oklch(24% 0.050 38)',
    glow:     'oklch(68% 0.210 38 / 0.55)',
    sweep:    true,
  },
  frost: {
    label:    'Frost',
    base:     'oklch(76% 0.110 195)',
    mid:      'oklch(88% 0.070 195)',
    empty:    'oklch(23% 0.035 210)',
    glow:     'oklch(76% 0.110 195 / 0.50)',
    sweep:    true,
  },
  iron: {
    label:    'Iron',
    base:     'oklch(65% 0.018 80)',
    mid:      'oklch(78% 0.012 80)',
    empty:    'oklch(24% 0.012 80)',
    glow:     'oklch(65% 0.018 80 / 0.35)',
  },
};

const SEGMENT_PRESETS = [2, 4, 6, 8, 10, 12, 20];

// ── State ─────────────────────────────────────────────────────────────────────
let clocks    = [];
let editMode  = false;
let editingId = null;

// ── Persistence ───────────────────────────────────────────────────────────────
function save() {
  try { localStorage.setItem('progress-clocks-v1', JSON.stringify(clocks)); } catch {}
}

function load() {
  try { clocks = JSON.parse(localStorage.getItem('progress-clocks-v1') || '[]'); }
  catch { clocks = []; }
}

// ── SVG clock rendering ───────────────────────────────────────────────────────
const CX = 50, CY = 50, OR = 46, IR = 28;

function polar(r, deg) {
  const rad = (deg - 90) * (Math.PI / 180);
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function arcPath(startDeg, endDeg) {
  const s  = polar(OR, startDeg);
  const e  = polar(OR, endDeg);
  const si = polar(IR, endDeg);
  const ei = polar(IR, startDeg);
  const lg = (endDeg - startDeg > 180) ? 1 : 0;
  return [
    `M${fmt(s.x)} ${fmt(s.y)}`,
    `A${OR} ${OR} 0 ${lg} 1 ${fmt(e.x)} ${fmt(e.y)}`,
    `L${fmt(si.x)} ${fmt(si.y)}`,
    `A${IR} ${IR} 0 ${lg} 0 ${fmt(ei.x)} ${fmt(ei.y)}`,
    'Z',
  ].join(' ');
}

function fmt(n) { return Math.round(n * 1000) / 1000; }

function clockSVG(clock) {
  const { segments, filled, palette: palKey } = clock;
  const pal  = PALETTES[palKey];
  // Small gap between segments, proportionally smaller for low counts
  const GAP  = Math.max(1.5, Math.min(4, 360 / segments * 0.09));
  const span = 360 / segments;

  let paths = '';
  for (let i = 0; i < segments; i++) {
    const start   = i * span + GAP / 2;
    const end     = (i + 1) * span - GAP / 2;
    const cls     = i < filled ? 'seg-f' : 'seg-e';
    paths += `<path d="${arcPath(start, end)}" class="${cls}"/>`;
  }

  const done = filled === segments;
  const vars = `--c-base:${pal.base};--c-mid:${pal.mid};--c-empty:${pal.empty};--c-glow:${pal.glow}`;
  const sweep = pal.sweep
    ? `<circle class="sweep-arc" cx="${CX}" cy="${CY}" r="${(OR + IR) / 2}" fill="none" stroke="var(--c-mid)" stroke-width="${OR - IR}" stroke-dasharray="28 ${Math.PI * (OR + IR) - 28}" stroke-linecap="round" opacity="0.38"/>`
    : '';

  return `<svg class="clock-svg"
     viewBox="0 0 100 100"
     role="img"
     aria-label="${filled} of ${segments} segments filled"
     tabindex="0"
     style="${vars}">${
       done ? `<circle class="complete-ring" cx="${CX}" cy="${CY}" r="48"/>` : ''
     }${paths}${sweep}<circle class="clock-center" cx="${CX}" cy="${CY}" r="${IR - 5}"/><text class="clock-text" x="${CX}" y="${CY}">${filled}/${segments}</text></svg>`;
}

// ── Rendering ─────────────────────────────────────────────────────────────────
function renderAll() {
  const grid  = document.getElementById('clock-grid');
  const empty = document.getElementById('empty-state');

  empty.hidden = clocks.length > 0;

  grid.innerHTML = clocks.map(c => {
    const pal  = PALETTES[c.palette];
    const done = c.filled === c.segments;
    return `<article
        class="clock-card${done ? ' is-complete' : ''}"
        data-id="${c.id}"
        data-animated="${pal.animated || false}"
        data-sweep="${pal.sweep || false}"
        style="--c-glow:${pal.glow};--c-base:${pal.base};--c-empty:${pal.empty};--fill:${fmt(c.filled / c.segments * 100)}%"
      >${clockSVG(c)}<h2 class="clock-name">${escHtml(c.name)}</h2><div class="card-controls" role="group" aria-label="Controls for ${escHtml(c.name)}"><button class="btn-icon btn-reset" data-action="reset" aria-label="Reset ${escHtml(c.name)}" title="Reset"><svg viewBox="0 0 24 24" width="17" height="17"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg></button><button class="btn-icon btn-edit" data-action="edit" aria-label="Edit ${escHtml(c.name)}" title="Edit"><svg viewBox="0 0 24 24" width="17" height="17"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg></button><button class="btn-icon btn-delete" data-action="delete" aria-label="Delete ${escHtml(c.name)}" title="Delete"><svg viewBox="0 0 24 24" width="17" height="17"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg></button></div></article>`;
  }).join('');
}

function escHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// ── Edit mode ─────────────────────────────────────────────────────────────────
function applyEditMode() {
  document.body.classList.toggle('edit-mode', editMode);
  const btn = document.getElementById('edit-toggle');
  btn.setAttribute('aria-pressed', String(editMode));
}

// ── Clock interaction: tap = advance, long-press = decrement ──────────────────
let pressTimer  = null;
let pressActive = false;
let pressSvg    = null;

function advance(id) {
  const c = clocks.find(c => c.id === id);
  if (!c || c.filled >= c.segments) return;
  c.filled++;
  save();
  renderAll();
  if (navigator.vibrate) navigator.vibrate(30);
}

function decrement(id) {
  const c = clocks.find(c => c.id === id);
  if (!c || c.filled <= 0) return;
  c.filled--;
  save();
  renderAll();
  if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
}

function pointerDown(e, id, svg) {
  pressActive = true;
  pressSvg    = svg;
  pressTimer  = setTimeout(() => {
    if (!pressActive) return;
    pressActive = false;
    // Flash then decrement
    svg.classList.add('dec-flash');
    svg.addEventListener('animationend', () => svg.classList.remove('dec-flash'), { once: true });
    decrement(id);
  }, 520);
}

function pointerUp(id) {
  if (!pressActive) return;
  clearTimeout(pressTimer);
  pressActive = false;
  advance(id);
}

function pointerCancel() {
  clearTimeout(pressTimer);
  pressTimer  = null;
  pressActive = false;
}

// ── Card action buttons ───────────────────────────────────────────────────────
function handleCardAction(action, id) {
  if (action === 'delete') {
    if (!confirm('Delete this clock?')) return;
    clocks = clocks.filter(c => c.id !== id);
    save();
    renderAll();
  }
  if (action === 'reset') {
    const c = clocks.find(c => c.id === id);
    if (c) { c.filled = 0; save(); renderAll(); }
  }
  if (action === 'edit') {
    editingId = id;
    openDialog(clocks.find(c => c.id === id));
  }
}

// ── Dialog ────────────────────────────────────────────────────────────────────
function buildDialogStatics() {
  // Segment chips
  const chips = document.getElementById('segment-chips');
  chips.innerHTML = SEGMENT_PRESETS.map((n, i) => `
    <label class="chip">
      <input type="radio" name="segments" value="${n}"${i === 2 ? ' checked' : ''}>
      <span>${n}</span>
    </label>`).join('') + `
    <label class="chip">
      <input type="radio" name="segments" value="custom">
      <span>Custom</span>
    </label>`;

  chips.addEventListener('change', e => {
    const custom = document.getElementById('f-custom');
    const isCustom = e.target.value === 'custom';
    custom.hidden = !isCustom;
    if (isCustom) custom.focus();
  });

  // Palette options
  const pgrid = document.getElementById('palette-grid');
  pgrid.innerHTML = Object.entries(PALETTES).map(([key, p], i) => `
    <label class="palette-option"${p.animated ? ' data-animated' : ''}
           style="--c-base:${p.base};--c-mid:${p.mid};--c-empty:${p.empty};--c-glow:${p.glow}">
      <input type="radio" name="palette" value="${key}"${i === 0 ? ' checked' : ''}>
      <span class="palette-swatch" aria-hidden="true"></span>
      <span class="palette-label">${p.label}</span>
    </label>`).join('');
}

function openDialog(clock = null) {
  const dialog  = document.getElementById('clock-dialog');
  const heading = document.getElementById('dialog-heading');
  const submit  = document.getElementById('dialog-submit');
  const form    = document.getElementById('clock-form');
  const custom  = document.getElementById('f-custom');

  if (clock) {
    heading.textContent = 'Edit Clock';
    submit.textContent  = 'Save';
    form.elements['name'].value = clock.name;
    const presetVal = SEGMENT_PRESETS.includes(clock.segments) ? String(clock.segments) : 'custom';
    const presetRadio = form.querySelector(`input[name="segments"][value="${presetVal}"]`);
    if (presetRadio) presetRadio.checked = true;
    custom.hidden = presetVal !== 'custom';
    if (presetVal === 'custom') custom.value = clock.segments;
    const palRadio = form.querySelector(`input[name="palette"][value="${clock.palette}"]`);
    if (palRadio) palRadio.checked = true;
  } else {
    heading.textContent = 'Add Clock';
    submit.textContent  = 'Add Clock';
    form.reset();
    // Restore default checked state after reset
    const def = form.querySelector('input[name="segments"][value="6"]');
    if (def) def.checked = true;
    const defPal = form.querySelector('input[name="palette"][value="crimson"]');
    if (defPal) defPal.checked = true;
    custom.hidden = true;
  }

  dialog.showModal();
  setTimeout(() => form.elements['name'].focus(), 50);
}

function handleDialogSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('clock-form');
  const name = form.elements['name'].value.trim();
  if (!name) { form.elements['name'].reportValidity(); return; }

  const checkedSeg = form.querySelector('input[name="segments"]:checked');
  if (!checkedSeg) return; // shouldn't happen, but guard anyway
  const segRaw = checkedSeg.value;
  let segments;
  if (segRaw === 'custom') {
    const custom = document.getElementById('f-custom');
    segments = parseInt(custom.value, 10);
    if (!segments || segments < 2 || segments > 20) {
      custom.setCustomValidity('Enter a number from 2 to 20');
      custom.reportValidity();
      custom.setCustomValidity('');
      return;
    }
  } else {
    segments = parseInt(segRaw, 10);
    if (!segments) return;
  }

  const palette = (form.querySelector('input[name="palette"]:checked') || {}).value || 'crimson';

  if (editingId) {
    const c = clocks.find(c => c.id === editingId);
    if (c) {
      c.name    = name;
      c.palette = palette;
      if (c.segments !== segments) {
        c.segments = segments;
        c.filled   = Math.min(c.filled, segments);
      }
    }
    editingId = null;
  } else {
    clocks.push({ id: crypto.randomUUID(), name, segments, filled: 0, palette });
  }

  save();
  renderAll();
  document.getElementById('clock-dialog').close();
}

// ── Wake Lock (keep screen on) ────────────────────────────────────────────────
async function acquireWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try {
    await navigator.wakeLock.request('screen');
  } catch { /* silently fail */ }
}

// ── Event wiring ──────────────────────────────────────────────────────────────
function initEvents() {
  const grid = document.getElementById('clock-grid');

  // Pointer events — delegated to grid
  grid.addEventListener('pointerdown', e => {
    const svg = e.target.closest('.clock-svg');
    if (!svg) return;
    const card = svg.closest('.clock-card');
    if (!card) return;
    svg.setPointerCapture(e.pointerId);
    e.preventDefault(); // prevent scroll/zoom during long-press
    pointerDown(e, card.dataset.id, svg);
  });

  grid.addEventListener('pointerup', e => {
    const svg = e.target.closest('.clock-svg');
    if (!svg) return;
    const card = svg.closest('.clock-card');
    if (!card) return;
    pointerUp(card.dataset.id);
  });

  grid.addEventListener('pointercancel', pointerCancel);

  // Keyboard: Enter/Space on focused SVG = advance; Backspace = decrement
  grid.addEventListener('keydown', e => {
    const svg = e.target.closest('.clock-svg');
    if (!svg) return;
    const card = svg.closest('.clock-card');
    if (!card) return;
    const id = card.dataset.id;
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); advance(id); }
    if (e.key === 'Backspace')               { e.preventDefault(); decrement(id); }
  });

  // Prevent context menu from interrupting long-press on touch
  grid.addEventListener('contextmenu', e => {
    if (e.target.closest('.clock-svg')) e.preventDefault();
  });

  // Card action buttons (reset / edit / delete)
  grid.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const card = btn.closest('.clock-card');
    if (!card) return;
    handleCardAction(btn.dataset.action, card.dataset.id);
  });

  // Edit toggle
  document.getElementById('edit-toggle').addEventListener('click', () => {
    editMode = !editMode;
    applyEditMode();
  });

  // FAB
  document.getElementById('add-btn').addEventListener('click', () => {
    editingId = null;
    openDialog();
  });

  // Dialog
  document.getElementById('clock-form').addEventListener('submit', handleDialogSubmit);
  document.getElementById('dialog-cancel').addEventListener('click', () => {
    editingId = null;
    document.getElementById('clock-dialog').close();
  });

  // Close dialog on backdrop click
  document.getElementById('clock-dialog').addEventListener('click', e => {
    if (e.target === e.currentTarget) {
      editingId = null;
      e.currentTarget.close();
    }
  });

  // Re-acquire wake lock when tab becomes visible
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') acquireWakeLock();
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────
function init() {
  load();
  buildDialogStatics();
  renderAll();
  applyEditMode();
  initEvents();
  acquireWakeLock();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

document.addEventListener('DOMContentLoaded', init);
