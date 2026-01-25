/* ---------- Constants ---------- */
const STORE = 'ttrpgProgressClocks';
const SVG = {
  3:  'assets/clock-3.svg',
  4:  'assets/clock-4.svg',
  5:  'assets/clock-5.svg',
  6:  'assets/clock-6.svg',
  8:  'assets/clock-8.svg',
 10: 'assets/clock-10.svg'
};

/* ---------- State ---------- */
let clocks = JSON.parse(localStorage.getItem(STORE)) || [];
let activeCard = null;

/* ---------- Render ---------- */
function render() {
  const grid = document.getElementById('clockContainer');
  grid.innerHTML = '';

  clocks.sort((a,b)=>a.order-b.order).forEach(c => {
    const card = document.createElement('div');
    card.className = 'clock-card';
    card.tabIndex = 0;
    card.dataset.id = c.id;
    card.style.color = c.colour;

    const img = document.createElement('img');
    img.src = SVG[c.segments];
    img.alt = `${c.segments}-segment clock`;
    img.className = 'clock-svg';
    card.appendChild(img);

    const title = document.createElement('div');
    title.className = 'clock-title';
    title.textContent = c.title ?? '';
    card.appendChild(title);

    const overlay = document.createElement('div');
    overlay.className = 'controls';
    overlay.innerHTML = `
      <div class="control-row">
        <button class="control-btn" data-act="prev">&#9664;</button>
        <button class="control-btn" data-act="next">&#9654;</button>
        <button class="control-btn" data-act="del">&#128465;</button>
      </div>
      <div class="control-row">
        <button class="control-btn" data-act="up">&#8593;</button>
        <button class="control-btn" data-act="down">&#8595;</button>
      </div>`;
    card.appendChild(overlay);

    /* click → toggle overlay */
    card.addEventListener('click', e => {
      if (e.target.closest('.control-btn')) return;
      if (activeCard && activeCard !== card) activeCard.classList.remove('active');
      card.classList.toggle('active');
      activeCard = card.classList.contains('active') ? card : null;
    });

    /* button actions */
    overlay.addEventListener('click', e => {
      const act = e.target.dataset.act;
      if (!act) return;
      const id = card.dataset.id;
      const i = clocks.findIndex(o => o.id === id);
      const cur = clocks[i];

      if (act === 'next' && cur.filled < cur.segments) cur.filled++;
      if (act === 'prev' && cur.filled > 0) cur.filled--;
      if (act === 'del' && confirm('Delete this clock?')) clocks.splice(i,1);
      if (act === 'up' && cur.order > 0) {
        const up = clocks.find(o => o.order === cur.order - 1);
        up.order++; cur.order--;
      }
      if (act === 'down' && cur.order < clocks.length-1) {
        const dn = clocks.find(o => o.order === cur.order + 1);
        dn.order--; cur.order++;
      }

      localStorage.setItem(STORE, JSON.stringify(clocks));
      render();
    });

    grid.appendChild(card);
  });
}

/* ---------- Modal (add new clock) ---------- */
const modal = document.getElementById('modalOverlay');
document.getElementById('addBtn').onclick = () => modal.classList.remove('hidden');
document.getElementById('cancelBtn').onclick = () => modal.classList.add('hidden');

document.getElementById('saveBtn').onclick = () => {
  const seg = document.querySelector('input[name="segments"]:checked')?.value;
  if (!seg) return alert('Choose a segment count');
  const colour = document.getElementById('colorPicker').value;
  const title = document.getElementById('titleInput').value.trim();

  clocks.push({
    id: crypto.randomUUID(),
    segments: +seg,
    colour,
    title,
    filled: 0,
    order: clocks.length
  });
  localStorage.setItem(STORE, JSON.stringify(clocks));
  render();
  modal.classList.add('hidden');
};

/* ---------- Colour suggestions (no conversion needed) ---------- */
document.querySelectorAll('.suggestion').forEach(b =>
  b.addEventListener('click', () =>
    document.getElementById('colorPicker').value = b.dataset.hex));

/* ---------- Keyboard shortcuts (attached to active card) ---------- */
document.addEventListener('keydown', e => {
  if (!activeCard) return;
  const id = activeCard.dataset.id;
  const i = clocks.findIndex(o => o.id === id);
  const cur = clocks[i];

  switch (e.key) {
    case 'ArrowRight': case '+': if (cur.filled < cur.segments) cur.filled++; break;
    case 'ArrowLeft':  case '-': if (cur.filled > 0) cur.filled--; break;
    case 'Delete': case 'Backspace': if (confirm('Delete this clock?')) clocks.splice(i,1); break;
    case 'ArrowUp':   if (cur.order > 0) { const up = clocks.find(o=>o.order===cur.order-1); up.order++; cur.order--; } break;
    case 'ArrowDown': if (cur.order < clocks.length-1) { const dn = clocks.find(o=>o.order===cur.order+1); dn.order--; cur.order++; } break;
    case 'Escape': activeCard.classList.remove('active'); activeCard = null; break;
    default: return;
  }
  localStorage.setItem(STORE, JSON.stringify(clocks));
  render();
});

/* ---------- Service‑worker registration ---------- */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .catch(() => console.warn('SW registration failed'));
}

/* ---------- Initial paint ---------- */
render();
