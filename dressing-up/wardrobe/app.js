/* Xavier's wardrobe — client-side JS
   Loads items.json, renders grid, search, filter, modal detail.
*/
(function () {
  'use strict';

  // ----- Theme -----
  const savedTheme = localStorage.getItem('wardrobe-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('wardrobe-theme', next);
  }
  window.toggleTheme = toggleTheme;

  // ----- Color swatches for modal -----
  const COLOR_HEX = {
    'black': '#1a1a1a', 'charcoal': '#343a40', 'gray': '#6b6f75',
    'navy': '#1f355e', 'dark-indigo': '#2f4a6d', 'medium-blue': '#5e7694',
    'light-blue': '#afc5e6', 'dusty-blue': '#7b95b8', 'petrol': '#3b6b8a',
    'white': '#ffffff', 'soft-white': '#f4f1e8',
    'olive': '#55624a', 'forest': '#2e5347',
    'burgundy': '#6f2333', 'red': '#a83a3a',
    'brown': '#5e3f2c', 'tan': '#a58c6b', 'stone': '#c8b89c',
    'sand': '#d8c89a', 'taupe': '#9b8a76',
    'multicolor': 'linear-gradient(135deg,#1f355e,#6f2333,#55624a)',
    'pattern': 'linear-gradient(45deg,#e3e0d8 25%,#1a1a1a 25%,#1a1a1a 50%,#e3e0d8 50%)',
  };
  function colorStyle(c) {
    const hex = COLOR_HEX[c] || '#999';
    return hex.startsWith('linear-gradient') ? `background: ${hex};` : `background: ${hex};`;
  }
  window.colorStyle = colorStyle;

  // ----- Load data -----
  // Prefer window.WARDROBE_DATA (loaded from items.js — works from file://)
  // Fall back to fetch('items.json') for HTTP-served deployments.
  let DATA = null;
  async function load() {
    if (window.WARDROBE_DATA) {
      DATA = window.WARDROBE_DATA;
    } else {
      try {
        const res = await fetch('items.json');
        DATA = await res.json();
      } catch (e) {
        console.error('Failed to load items. Make sure items.js is included or you are serving over HTTP.', e);
        document.body.insertAdjacentHTML('beforeend', '<div class="empty-state" style="padding:40px;">Failed to load items.</div>');
        return;
      }
    }
    if (window.onWardrobeReady) window.onWardrobeReady(DATA);
  }
  window.WardrobeLoad = load;

  // ----- Render grid -----
  function cardHtml(item) {
    return `
      <div class="card" data-id="${item.id}" tabindex="0" role="button" aria-label="View ${item.id}">
        <img class="photo" src="${item.file}" alt="${item.id}" loading="lazy" />
        <div class="body">
          <div class="title">${humanizeTitle(item)}</div>
          <div class="meta">
            <span class="tier-badge tier-${item.tier}">${item.tier}</span>
            <span class="score">${item.score}/10</span>
            ${item.brand && item.brand !== 'unknown' ? `· ${item.brand}` : ''}
          </div>
        </div>
      </div>`;
  }
  function humanizeTitle(item) {
    // e.g. "dark indigo jeans" or "navy dress shirt"
    const c = (item.color || '').replace(/-/g, ' ');
    const t = (item.subtype || item.type || '').replace(/-/g, ' ');
    return `${c} ${t}`;
  }
  window.cardHtml = cardHtml;
  window.humanizeTitle = humanizeTitle;

  // ----- Filter logic -----
  function matchesFilters(item, state) {
    if (state.tier && item.tier !== state.tier) return false;
    if (state.occasion && !(item.occasion_tags || []).includes(state.occasion)) return false;
    if (state.color && item.color !== state.color) return false;
    if (state.search) {
      const q = state.search.toLowerCase();
      const hay = [
        item.id, item.type, item.subtype, item.color, item.detail, item.brand,
        item.notes, item.description, (item.occasion_tags || []).join(' ')
      ].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }
  window.matchesFilters = matchesFilters;

  // ----- Modal -----
  function openItem(item) {
    const outfits = (DATA && DATA.outfits) || [];
    const pairsHtml = (item.pairs_with || []).map(p => `
      <div class="pair">
        <div class="pair-with">${p.with}</div>
        ${p.colors && p.colors.length ? `<div class="pair-colors">${p.colors.join(' · ')}</div>` : ''}
        ${p.note ? `<div class="pair-note">${p.note}</div>` : ''}
      </div>`).join('');

    const tagsHtml = (item.occasion_tags || []).map(t => `<span class="tag">${t}</span>`).join('');
    const outfitChips = (item.outfit_ids || []).map(n =>
      `<span class="outfit-chip" title="${outfits[n-1] || ''}">#${n}</span>`).join('');
    const html = `
      <div class="modal" role="dialog" aria-modal="true" style="position:relative;">
        <button class="close-btn" onclick="closeModal()" aria-label="Close">&times;</button>
        <div class="photo-pane"><img src="${item.file}" alt="${item.id}" /></div>
        <div class="info-pane">
          <h2>${humanizeTitle(item)}</h2>
          <p class="lead">${item.description || ''}</p>
          <div class="badges">
            <span class="tier-badge tier-${item.tier}">${item.tier} · ${item.score}/10</span>
            <span class="tag color" style="${colorStyle(item.color)}; color: transparent;">${item.color}</span>
            <span class="tag">${item.color}</span>
            ${item.brand && item.brand !== 'unknown' ? `<span class="tag">${item.brand}</span>` : ''}
            <span class="tag">${item.condition}</span>
          </div>
          ${tagsHtml ? `<h3>Wear it for</h3><div class="badges">${tagsHtml}</div>` : ''}
          ${pairsHtml ? `<h3>Pairs with</h3>${pairsHtml}` : ''}
          ${outfitChips ? `<h3>Appears in outfits</h3><div>${outfitChips}</div>` : ''}
          <h3>File</h3>
          <p class="lead" style="font-family: monospace; word-break: break-all;">${item.file}<br><small>orig: ${item.orig}.jpg</small></p>
        </div>
      </div>`;
    let bg = document.getElementById('modal-bg');
    if (!bg) {
      bg = document.createElement('div');
      bg.id = 'modal-bg';
      bg.className = 'modal-bg';
      bg.addEventListener('click', (e) => { if (e.target === bg) closeModal(); });
      document.body.appendChild(bg);
    }
    bg.innerHTML = html;
    bg.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    const bg = document.getElementById('modal-bg');
    if (bg) bg.classList.remove('open');
    document.body.style.overflow = '';
  }
  window.openItem = openItem;
  window.closeModal = closeModal;

  // ----- Renderer used by category pages -----
  function renderGrid(opts) {
    if (!DATA) return;
    const items = DATA.items.filter(opts.filter);
    const state = opts.state || {};
    const filtered = items.filter(i => matchesFilters(i, state));
    const target = document.getElementById('grid');
    if (filtered.length === 0) {
      target.innerHTML = `<div class="empty-state">No items match. Loosen filters.</div>`;
    } else {
      // sort: keepers high → low score; tier order: Keep, Tailor, Replace, Donate
      const tierOrder = { 'Keep': 0, 'Tailor': 1, 'Replace': 2, 'Donate': 3 };
      filtered.sort((a, b) => (tierOrder[a.tier] - tierOrder[b.tier]) || (b.score - a.score));
      target.innerHTML = filtered.map(cardHtml).join('');
      target.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => {
          const id = card.getAttribute('data-id');
          openItem(DATA.items.find(it => it.id === id));
        });
        card.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
          }
        });
      });
    }
    const cnt = document.getElementById('count');
    if (cnt) cnt.textContent = `${filtered.length} of ${items.length} item${items.length !== 1 ? 's' : ''}`;
  }
  window.renderGrid = renderGrid;

  // ----- Generic page setup -----
  // Each category page calls window.setupCategory({ folder: 'pants-jeans' })
  window.setupCategory = function (opts) {
    const folder = opts.folder;
    const state = { search: '', tier: '', occasion: '', color: '' };
    window.onWardrobeReady = function () {
      const search = document.getElementById('search');
      if (search) search.addEventListener('input', (e) => { state.search = e.target.value; render(); });
      document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const key = chip.dataset.filterKey;
          const val = chip.dataset.filterVal;
          if (state[key] === val) {
            state[key] = '';
            chip.classList.remove('active');
          } else {
            // Deactivate siblings
            document.querySelectorAll(`.chip[data-filter-key="${key}"]`).forEach(c => c.classList.remove('active'));
            state[key] = val;
            chip.classList.add('active');
          }
          render();
        });
      });
      // Build occasion chips dynamically from data
      buildOccasionChips(folder, state, render);
      // Build color chips dynamically
      buildColorChips(folder, state, render);
      render();
      // Show summary
      renderSummary(folder);
    };
    function render() {
      renderGrid({ filter: i => i.folder === folder, state });
    }
    load();
  };

  function buildOccasionChips(folder, state, render) {
    const container = document.getElementById('occasion-filters');
    if (!container) return;
    const all = new Set();
    DATA.items.filter(i => i.folder === folder).forEach(i => (i.occasion_tags || []).forEach(t => all.add(t)));
    container.innerHTML = [...all].sort().map(t =>
      `<span class="chip" data-filter-key="occasion" data-filter-val="${t}">${t}</span>`).join('');
    container.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.dataset.filterVal;
        if (state.occasion === val) { state.occasion = ''; chip.classList.remove('active'); }
        else {
          container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
          state.occasion = val; chip.classList.add('active');
        }
        render();
      });
    });
  }
  function buildColorChips(folder, state, render) {
    const container = document.getElementById('color-filters');
    if (!container) return;
    const all = new Set();
    DATA.items.filter(i => i.folder === folder).forEach(i => all.add(i.color));
    container.innerHTML = [...all].sort().map(c =>
      `<span class="chip" data-filter-key="color" data-filter-val="${c}" title="${c}"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;${colorStyle(c)};border:1px solid rgba(0,0,0,.1);vertical-align:middle;margin-right:4px;"></span>${c}</span>`).join('');
    container.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const val = chip.dataset.filterVal;
        if (state.color === val) { state.color = ''; chip.classList.remove('active'); }
        else {
          container.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
          state.color = val; chip.classList.add('active');
        }
        render();
      });
    });
  }
  function renderSummary(folder) {
    const el = document.getElementById('summary');
    if (!el) return;
    const items = DATA.items.filter(i => i.folder === folder);
    const counts = { Keep: 0, Tailor: 0, Replace: 0, Donate: 0 };
    items.forEach(i => counts[i.tier] = (counts[i.tier] || 0) + 1);
    el.innerHTML = `
      <div class="stat"><div class="num">${items.length}</div><div class="lab">Items</div></div>
      <div class="stat"><div class="num" style="color:var(--tier-keep)">${counts.Keep}</div><div class="lab">Keep</div></div>
      <div class="stat"><div class="num" style="color:var(--tier-replace)">${counts.Replace}</div><div class="lab">Replace</div></div>
      <div class="stat"><div class="num" style="color:var(--tier-donate)">${counts.Donate}</div><div class="lab">Donate</div></div>
    `;
  }
  window.renderSummary = renderSummary;

  // ----- Home page support -----
  window.setupHome = function () {
    window.onWardrobeReady = function () {
      const grid = document.getElementById('cat-grid');
      const folders = {};
      DATA.items.forEach(i => { (folders[i.folder] = folders[i.folder] || []).push(i); });
      const order = [
        'shirts-dress', 'shirts-casual', 'pants-jeans', 'pants-trousers',
        'shoes-sneakers', 'shoes-formal', 'shoes-outdoor',
        'shorts', 'swimwear', 'jackets', 'suits', 'group-photos'
      ];
      grid.innerHTML = order.filter(f => folders[f]).map(f => {
        const items = folders[f];
        const keep = items.filter(i => i.tier === 'Keep').length;
        const donate = items.filter(i => i.tier === 'Donate').length;
        const replace = items.filter(i => i.tier === 'Replace').length;
        return `<a href="${f}.html" class="cat-card">
          <span class="name">${f.replace(/-/g, ' ')}</span>
          <span class="count">${items.length} item${items.length !== 1 ? 's' : ''}</span>
          <span class="count"><span class="keepers">${keep} keep</span>${replace ? ` · <span style="color:var(--tier-replace)">${replace} replace</span>` : ''}${donate ? ` · <span class="donate">${donate} donate</span>` : ''}</span>
        </a>`;
      }).join('');

      // Global search across home
      const search = document.getElementById('home-search');
      const results = document.getElementById('home-results');
      if (search) {
        search.addEventListener('input', () => {
          const q = search.value.trim();
          if (!q) { results.innerHTML = ''; return; }
          const matches = DATA.items.filter(i => matchesFilters(i, { search: q }));
          if (matches.length === 0) {
            results.innerHTML = `<div class="empty-state">No items match "${q}"</div>`;
          } else {
            results.innerHTML = `<h2 style="margin-top:24px;">${matches.length} match${matches.length !== 1 ? 'es' : ''}</h2><div class="grid">${matches.slice(0,60).map(cardHtml).join('')}</div>`;
            results.querySelectorAll('.card').forEach(card => {
              card.addEventListener('click', () => openItem(DATA.items.find(it => it.id === card.dataset.id)));
            });
          }
        });
      }
    };
    load();
  };

  // ----- Outfits page -----
  window.setupOutfits = function () {
    window.onWardrobeReady = function () {
      const list = document.getElementById('outfit-list');
      list.innerHTML = DATA.outfits.map((desc, idx) => {
        const num = idx + 1;
        // Find which items belong to this outfit
        const matches = DATA.items.filter(i => (i.outfit_ids || []).includes(num) && i.tier === 'Keep');
        const status = matches.length >= 2 ? 'ready' : (matches.length >= 1 ? 'partial' : 'missing');
        const label = status === 'ready' ? 'BUILD' : (status === 'partial' ? 'PARTIAL' : 'MISSING');
        return `<div class="outfit-row">
          <div class="num">#${num}</div>
          <div class="desc">${desc}</div>
          <div class="status ${status}">${label}</div>
        </div>`;
      }).join('');
    };
    load();
  };

  // ----- Donate page -----
  window.setupDonate = function () {
    window.onWardrobeReady = function () {
      const items = DATA.items.filter(i => i.tier === 'Donate');
      const replace = DATA.items.filter(i => i.tier === 'Replace');
      document.getElementById('donate-grid').innerHTML = items.length === 0 ?
        `<div class="empty-state">Nothing to donate.</div>` :
        items.map(cardHtml).join('');
      document.getElementById('replace-grid').innerHTML = replace.length === 0 ?
        `<div class="empty-state">Nothing in the replace pile.</div>` :
        replace.map(cardHtml).join('');
      document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => openItem(DATA.items.find(it => it.id === card.dataset.id)));
      });
    };
    load();
  };

  // ----- Gap page (40-piece capsule from master doc) -----
  const CAPSULE = [
    "Charcoal crew tee","Navy crew tee","Soft white crew tee","Black performance tee",
    "Navy AIRism/piqué polo","Charcoal knit polo","Dusty blue polo",
    "Light blue oxford shirt","Soft white oxford shirt","Petrol/indigo linen shirt",
    "Pale blue striped shirt","Olive linen/cotton shirt",
    "Off-white short-sleeve resort shirt","Muted blue short-sleeve resort shirt","White dress shirt",
    "Navy unstructured blazer","Charcoal matte vest","Olive or charcoal overshirt",
    "Uniqlo ultralight jacket","Lightweight rain shell",
    "Dark rinse straight jeans","Medium-dark indigo jeans","Charcoal jeans",
    "Olive athletic chinos","Stone athletic chinos","Navy easy/technical chinos","Charcoal tropical-weight trousers",
    "Dark tailored shorts","Sand linen shorts","Navy swim shorts",
    "Kenneth Cole suit jacket","Kenneth Cole suit trousers",
    "On black shoes","On gray shoes","Brown loafer","Black dress shoe",
    "Black belt","Dark brown belt","Burgundy textured tie","Navy textured tie"
  ];
  // Map each capsule slot to a predicate that checks if we own one
  const CAPSULE_PREDICATES = [
    (i) => i.type === 'tee' && i.color === 'charcoal',
    (i) => i.type === 'tee' && i.color === 'navy',
    (i) => i.type === 'tee' && (i.color === 'soft-white' || i.color === 'white'),
    (i) => i.type === 'tee' && i.color === 'black',
    (i) => i.type === 'polo' && i.color === 'navy',
    (i) => i.type === 'polo' && i.color === 'charcoal',
    (i) => i.type === 'polo' && i.color === 'dusty-blue',
    (i) => i.type === 'shirt' && i.subtype === 'oxford' && i.color === 'light-blue',
    (i) => i.type === 'shirt' && (i.subtype === 'oxford' || i.subtype === 'dress-shirt') && (i.color === 'soft-white' || i.color === 'white'),
    (i) => i.type === 'shirt' && i.subtype === 'linen-shirt' && (i.color === 'petrol' || i.color === 'dark-indigo'),
    (i) => i.type === 'shirt' && (i.subtype === 'dress-shirt' || i.subtype === 'oxford') && i.color === 'light-blue' && (i.detail||'').includes('strip'),
    (i) => i.type === 'shirt' && (i.subtype === 'linen-shirt' || i.subtype === 'button-shirt') && i.color === 'olive',
    (i) => i.type === 'shirt' && i.color === 'soft-white' && (i.subtype || '').includes('short'),
    (i) => i.type === 'shirt' && (i.color === 'dusty-blue' || i.color === 'medium-blue') && ((i.detail || '').includes('short') || (i.subtype || '').includes('short')),
    (i) => i.type === 'shirt' && i.subtype === 'dress-shirt' && i.color === 'white',
    (i) => i.type === 'blazer' && i.color === 'navy',
    (i) => i.type === 'vest' && (i.color === 'charcoal' || i.color === 'gray'),
    (i) => (i.type === 'jacket' || i.type === 'shirt') && (i.subtype === 'overshirt') && (i.color === 'olive' || i.color === 'charcoal'),
    (i) => i.type === 'jacket' && (i.subtype === 'puffer' || i.subtype === 'ultralight'),
    (i) => i.type === 'jacket' && i.subtype === 'rain-shell',
    (i) => i.type === 'pants' && i.subtype === 'jeans' && i.color === 'dark-indigo',
    (i) => i.type === 'pants' && i.subtype === 'jeans' && i.color === 'medium-blue',
    (i) => i.type === 'pants' && i.subtype === 'jeans' && i.color === 'charcoal',
    (i) => i.type === 'pants' && i.subtype === 'chino' && i.color === 'olive',
    (i) => i.type === 'pants' && i.subtype === 'chino' && (i.color === 'stone' || i.color === 'sand'),
    (i) => i.type === 'pants' && (i.subtype === 'chino' || i.subtype === 'technical-pant') && i.color === 'navy',
    (i) => i.type === 'pants' && (i.subtype === 'dress-trouser' || i.subtype === 'chino') && i.color === 'charcoal',
    (i) => i.type === 'shorts' && (i.color === 'navy' || i.color === 'charcoal' || i.color === 'black'),
    (i) => i.type === 'shorts' && (i.color === 'sand' || i.color === 'stone'),
    (i) => i.type === 'swimwear' && (i.color === 'navy' || i.color === 'dark-indigo'),
    (i) => i.type === 'suit' && i.subtype === 'suit-jacket',
    (i) => i.type === 'pants' && i.subtype === 'dress-trouser',
    (i) => i.type === 'shoes' && i.subtype === 'sneaker' && i.color === 'black' && (i.brand || '').toLowerCase().includes('on'),
    (i) => i.type === 'shoes' && i.subtype === 'sneaker' && (i.color === 'gray' || i.color === 'white') && (i.brand || '').toLowerCase().includes('on'),
    (i) => i.type === 'shoes' && i.subtype === 'loafer' && i.color === 'brown',
    (i) => i.type === 'shoes' && (i.subtype === 'dress-shoe' || i.subtype === 'derby') && i.color === 'black',
    (i) => i.type === 'accessory' && i.subtype === 'belt' && i.color === 'black',
    (i) => i.type === 'accessory' && i.subtype === 'belt' && i.color === 'brown',
    (i) => i.type === 'accessory' && i.subtype === 'tie' && i.color === 'burgundy',
    (i) => i.type === 'accessory' && i.subtype === 'tie' && i.color === 'navy',
  ];
  window.setupGap = function () {
    window.onWardrobeReady = function () {
      const have = [], need = [];
      CAPSULE.forEach((slot, idx) => {
        const pred = CAPSULE_PREDICATES[idx];
        const found = pred ? DATA.items.find(pred) : null;
        if (found) have.push({ slot, item: found, idx });
        else need.push({ slot, idx });
      });
      document.getElementById('have').innerHTML =
        `<h2>Have <small style="color:var(--muted);font-weight:400;">(${have.length}/40)</small></h2>` +
        (have.length === 0 ? `<div class="empty-state">Nothing yet.</div>` :
          `<div class="grid">${have.map(h => `
            <div class="card" data-id="${h.item.id}">
              <img class="photo" src="${h.item.file}" alt="${h.item.id}" loading="lazy" />
              <div class="body">
                <div class="title" style="font-size:13px;">${h.slot}</div>
                <div class="meta"><span class="tier-badge tier-${h.item.tier}">${h.item.tier}</span> ${h.item.brand !== 'unknown' ? '· ' + h.item.brand : ''}</div>
              </div>
            </div>`).join('')}</div>`);
      document.getElementById('need').innerHTML =
        `<h2>Need <small style="color:var(--muted);font-weight:400;">(${need.length} to buy)</small></h2>` +
        (need.length === 0 ? `<div class="empty-state" style="color:var(--tier-keep);">Capsule complete.</div>` :
          `<div class="cat-grid">${need.map(n => `
            <div class="cat-card" style="cursor:default;">
              <div class="name" style="font-size:15px;text-transform:none;">${n.slot}</div>
            </div>`).join('')}</div>`);
      document.querySelectorAll('#have .card').forEach(card => {
        card.addEventListener('click', () => openItem(DATA.items.find(it => it.id === card.dataset.id)));
      });
    };
    load();
  };

})();
