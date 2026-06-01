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

  // Generate a short reason explaining why an item is Replace/Donate
  function reasonForTier(item) {
    if (item.tier !== 'Replace' && item.tier !== 'Donate') return null;
    const t = item.type, st = item.subtype, c = item.color;
    const d = (item.detail || '').toLowerCase();
    const brand = (item.brand || '').toLowerCase();

    // Performance / fishing shirts
    if (st === 'fishing-shirt' || d.includes('performance') || brand.includes('columbia')) {
      return "Technical performance fabric reads too outdoorsy for founder/client settings. Keep it for hiking, fishing, and travel days — then replace with a proper linen or oxford for daily wear.";
    }
    // Loud patterns on shirts
    if ((d.includes('plaid') || d.includes('windowpane')) && (t === 'shirt' || t === 'shorts')) {
      return "Plaid pattern fights the mature-founder direction. Solids in the system palette do the same job without the weekend-dad signal.";
    }
    if (d.includes('graphic') || d.includes('logo')) {
      return "Big front graphic / logo undermines the authority signal. Solids in the system palette read more intentional and let your face do the work.";
    }
    // Surf prints / board shorts with loud designs
    if (st === 'board-shorts' && (d.includes('floral') || d.includes('angular'))) {
      return "Loud surf-brand prints push the look into 'tropical vacation cosplay'. Replace with a solid navy or charcoal mid-thigh swim short — Costa Rica, not Miami cosplay.";
    }
    // Hiking shoes
    if (t === 'shoes' && d.includes('hiking')) {
      return "Hiking silhouettes read outdoor-utility, not sporty-authority. Keep them on the trail; for daily wear use On sneakers or the brown loafer.";
    }
    // Running shoes
    if (t === 'shoes' && d.includes('running')) {
      return "Running shoes look performance-day, not street-day. Reserve for actual workouts; daily wear should be On or loafers.";
    }
    // Sandals / flip-flops / crocs / water shoes / terry slippers
    if (st === 'sandal') {
      return "Utility footwear — pool, shower, hotel room. Not a wardrobe piece, just function. Donate the duplicates you don't use.";
    }
    // Varsity bomber / camo event jacket
    if (st === 'varsity') {
      return "Collegiate varsity bomber fights the mature founder image. Donate — the navy unstructured blazer on your buy list does this slot properly.";
    }
    if (st === 'windbreaker' || d.includes('camo')) {
      return "Branded event/camo windbreaker reads like swag, not personal style. Donate — replace the layering function with a clean charcoal vest or olive overshirt.";
    }
    // Skechers / cheap sneakers
    if (t === 'shoes' && st === 'sneaker' && brand.includes('skechers')) {
      return "Cheap-mesh silhouette undermines the rest of the kit. Replace with another On pair or a minimal leather sneaker.";
    }
    // Caterpillar workwear sneakers
    if (t === 'shoes' && brand.includes('caterpillar')) {
      return "Workwear-rugged sneaker competes with the clean sporty-authority look. Replace with a minimal leather sneaker or another On.";
    }
    // Off-palette colors on tops
    if (c === 'red' && t === 'shirt') {
      return "Coral/red is off the system palette. Replace with burgundy for warmth, or olive/charcoal for more daily versatility.";
    }
    // Black H&M chino as daily wear
    if (t === 'pants' && c === 'black' && st === 'chino') {
      return "Black chinos read 'office uniform' rather than founder. Replace with olive or stone athletic chinos — same versatility, far more intentional.";
    }
    // Medium-blue jeans (lighter wash)
    if (t === 'pants' && st === 'jeans' && c === 'medium-blue') {
      return "Lighter wash jeans lack the authority of dark indigo. Keep for casual/weekend; replace by adding dark-rinse and charcoal pairs as the daily anchors.";
    }
    // Athletic / training shorts that read gym-only
    if (t === 'shorts' && st === 'athletic-short') {
      return "Athletic training shorts read 'just left the gym'. Reserve for workouts; for daily summer wear use tailored chino/hybrid shorts in solids.";
    }
    // Cargo / drawstring cotton shorts (casual but visible-wear)
    if (t === 'shorts' && (st === 'cargo-short' || st === 'cotton-short')) {
      return "Drawstring / cargo casual shorts feel adolescent. Replace with flat-front tailored shorts (navy, charcoal, sand) for a cleaner adult silhouette.";
    }
    // Hotel-branded / event-branded items in general
    if (d.includes('logo-patch')) {
      return "Brand patch / logo treatment turns the piece into corporate signage. Donate or wear strictly around the house.";
    }
    // Generic fallbacks based on fit_for_system
    if (item.fit_for_system === 'hard-no') {
      return "Doesn't match the system — donate. The piece fights against the sporty-authority direction the rest of the wardrobe is built around.";
    }
    if (item.fit_for_system === 'weak') {
      return "Off the system but serviceable. Wear what's left of its useful life, then replace with the equivalent capsule item.";
    }
    return null;
  }
  window.reasonForTier = reasonForTier;

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
    const reason = reasonForTier(item);
    const reasonHtml = reason
      ? `<h3>Why ${item.tier.toLowerCase()}</h3><div class="reason tier-${item.tier}">${reason}</div>`
      : '';
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
          ${reasonHtml}
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

  // Map description keywords -> sample file (for outfit visualization).
  // Order matters: more specific phrases first.
  const PIECE_KEYWORDS = [
    // Tops — oxfords / dress shirts
    ['light blue oxford', 'light-blue-oxford.svg'],
    ['light blue dress shirt', 'light-blue-oxford.svg'],
    ['air blue oxford', 'light-blue-oxford.svg'],
    ['air blue shirt', 'light-blue-oxford.svg'],
    ['pale blue stripe', 'pale-blue-striped-shirt.svg'],
    ['light blue shirt', 'light-blue-oxford.svg'],
    ['white oxford', 'soft-white-oxford.svg'],
    ['white shirt', 'white-dress-shirt.svg'],
    ['white dress shirt', 'white-dress-shirt.svg'],
    ['petrol linen', 'petrol-linen-shirt.svg'],
    ['petrol polo', 'petrol-linen-shirt.svg'],
    ['petrol shirt', 'petrol-linen-shirt.svg'],
    // Polos
    ['navy airism polo', 'navy-pique-polo.svg'],
    ['navy knit polo', 'navy-pique-polo.svg'],
    ['navy polo', 'navy-pique-polo.svg'],
    ['charcoal knit polo', 'charcoal-knit-polo.svg'],
    ['charcoal polo', 'charcoal-knit-polo.svg'],
    ['dusty blue polo', 'dusty-blue-polo.svg'],
    ['black performance polo', 'black-performance-tee.svg'],
    ['knit polo', 'charcoal-knit-polo.svg'],
    // Tees
    ['black tee', 'black-performance-tee.svg'],
    ['charcoal tee', 'charcoal-crew-tee.svg'],
    ['soft white tee', 'soft-white-crew-tee.svg'],
    ['white tee', 'soft-white-crew-tee.svg'],
    ['fitted tee', 'black-performance-tee.svg'],
    // Resort / linen shirts
    ['open blue linen', 'muted-blue-resort-shirt.svg'],
    ['blue linen shirt', 'muted-blue-resort-shirt.svg'],
    ['open linen shirt', 'off-white-resort-shirt.svg'],
    ['olive overshirt', 'olive-overshirt.svg'],
    ['muted blue overshirt', 'muted-blue-resort-shirt.svg'],
    // Bottoms — jeans
    ['dark rinse jeans', 'charcoal-jeans.svg'],
    ['dark indigo jeans', 'charcoal-jeans.svg'],
    ['dark indigo', 'charcoal-jeans.svg'],
    ['charcoal jeans', 'charcoal-jeans.svg'],
    ['medium-dark indigo', 'charcoal-jeans.svg'],
    ['dark jeans', 'charcoal-jeans.svg'],
    // Chinos / pants
    ['olive chino', 'olive-athletic-chinos.svg'],
    ['stone chino', 'stone-athletic-chinos.svg'],
    ['navy chino', 'navy-technical-chinos.svg'],
    ['navy easy pant', 'navy-technical-chinos.svg'],
    ['charcoal trouser', 'charcoal-tropical-trousers.svg'],
    // Shorts
    ['sand shorts', 'sand-linen-shorts.svg'],
    ['tailored shorts', 'dark-tailored-shorts.svg'],
    ['tailored sand shorts', 'sand-linen-shorts.svg'],
    ['dark tailored shorts', 'dark-tailored-shorts.svg'],
    ['navy swim short', 'navy-swim-shorts.svg'],
    // Layers
    ['navy blazer', 'navy-unstructured-blazer.svg'],
    ['matte charcoal vest', 'charcoal-vest.svg'],
    ['charcoal vest', 'charcoal-vest.svg'],
    ['matte vest', 'charcoal-vest.svg'],
    // Ties
    ['burgundy tie', 'burgundy-tie.svg'],
    ['burgundy textured tie', 'burgundy-tie.svg'],
    ['navy tie', 'navy-tie.svg'],
    ['navy/burgundy stripe tie', 'burgundy-tie.svg'],
    ['navy/burgundy stripe', 'burgundy-tie.svg'],
    // Black shirt fallback
    ['black shirt', 'white-dress-shirt.svg'],
  ];

  // Build the piece list for one outfit:
  // For each "slot" in the description, prefer the user's own item; fall back to a sample.
  function outfitPieces(num, desc) {
    const lower = desc.toLowerCase();
    const taggedOwn = DATA.items.filter(i => (i.outfit_ids || []).includes(num) && i.tier === 'Keep');

    const slots = []; // each: { keyword, sample, ownPriority }
    const matchedKeywords = new Set();
    for (const [kw, sample] of PIECE_KEYWORDS) {
      if (lower.includes(kw) && !matchedKeywords.has(sample)) {
        slots.push({ keyword: kw, sample });
        matchedKeywords.add(sample);
      }
    }

    // For each slot, try to find an own item that matches the keyword;
    // otherwise use the sample.
    const pieces = [];
    const usedOwnIds = new Set();
    for (const slot of slots) {
      let own = null;
      const kw = slot.keyword;
      // Match heuristics: by item color + type, derived from the keyword
      own = taggedOwn.find(i => {
        if (usedOwnIds.has(i.id)) return false;
        const h = (i.color + ' ' + (i.subtype||'') + ' ' + (i.detail||'') + ' ' + i.type).toLowerCase();
        // crude keyword token match: requires the main color/word in keyword
        return kw.split(' ').filter(w => w.length > 2).every(w => h.includes(w));
      });
      if (own) {
        usedOwnIds.add(own.id);
        pieces.push({ src: own.file, label: humanizeTitle(own), own: true, id: own.id });
      } else {
        pieces.push({ src: 'samples/' + slot.sample, label: kw, own: false, slotName: kw });
      }
    }

    // Outfit-specific shoe handling — descriptions reference "On" or "loafer"
    const hasOn = /\bon\b/.test(lower) || lower.includes('on shoes');
    const hasLoafer = lower.includes('loafer');
    const hasDressShoe = lower.includes('dress shoe') || lower.includes('black shoe');
    if (hasLoafer) {
      const brown = DATA.items.find(i => i.tier === 'Keep' && i.subtype === 'loafer' && i.color === 'brown');
      if (brown && !usedOwnIds.has(brown.id)) {
        pieces.push({ src: brown.file, label: humanizeTitle(brown), own: true, id: brown.id });
        usedOwnIds.add(brown.id);
      }
    }
    if (hasOn) {
      // Pick the appropriate On color from desc
      let onColor = 'black';
      if (lower.includes('gray on')) onColor = 'gray';
      else if (lower.includes('white on')) onColor = 'white';
      const on = DATA.items.find(i =>
        i.tier === 'Keep' && i.subtype === 'sneaker' &&
        (i.brand || '').toLowerCase().includes('on') &&
        i.color === onColor
      );
      if (on && !usedOwnIds.has(on.id)) {
        pieces.push({ src: on.file, label: humanizeTitle(on), own: true, id: on.id });
        usedOwnIds.add(on.id);
      }
    }
    if (hasDressShoe) {
      const dressShoe = DATA.items.find(i =>
        i.tier === 'Keep' && i.type === 'shoes' &&
        (i.subtype === 'dress-shoe' || (i.subtype === 'loafer' && i.color === 'black'))
      );
      if (dressShoe && !usedOwnIds.has(dressShoe.id)) {
        pieces.push({ src: dressShoe.file, label: humanizeTitle(dressShoe), own: true, id: dressShoe.id });
        usedOwnIds.add(dressShoe.id);
      }
    }
    // Suit handling — use the suit jacket photo
    if (lower.includes('suit')) {
      const suit = DATA.items.find(i => i.tier === 'Keep' && i.type === 'suit');
      if (suit && !usedOwnIds.has(suit.id)) {
        pieces.push({ src: suit.file, label: humanizeTitle(suit), own: true, id: suit.id });
        usedOwnIds.add(suit.id);
      }
    }

    return pieces;
  }
  window.outfitPieces = outfitPieces;

  // ----- Outfits page -----
  window.setupOutfits = function () {
    window.onWardrobeReady = function () {
      const list = document.getElementById('outfit-list');
      list.innerHTML = DATA.outfits.map((desc, idx) => {
        const num = idx + 1;
        const pieces = outfitPieces(num, desc);
        const ownCount = pieces.filter(p => p.own).length;
        const totalPieces = pieces.length;
        const status = ownCount >= totalPieces - 1 && totalPieces >= 2 ? 'ready'
                     : (ownCount >= 1 ? 'partial' : 'missing');
        const label = status === 'ready' ? 'BUILD' : (status === 'partial' ? 'PARTIAL' : 'MISSING');
        const piecesHtml = pieces.length === 0 ? '' : `
          <div class="outfit-pieces">
            ${pieces.map(p => {
              const buyHref = 'https://www.google.com/search?tbm=shop&gl=us&hl=en&q=' + encodeURIComponent('men ' + p.label);
              const labelHtml = p.own
                ? `<span class="piece-label">${p.label}</span>`
                : `<a class="piece-label buy-link" href="${buyHref}" target="_blank" rel="noopener" title="Shop ${p.label} on Google (US)" onclick="event.stopPropagation();">${p.label}</a>`;
              return `
              <div class="outfit-piece ${p.own ? 'own' : 'sample'}" ${p.id ? `data-id="${p.id}"` : ''} title="${p.label}">
                <img src="${p.src}" alt="${p.label}" loading="lazy" />
                ${labelHtml}
              </div>`;
            }).join('')}
          </div>`;
        return `<div class="outfit-row">
          <div class="outfit-head">
            <div class="num">#${num}</div>
            <div class="desc">${desc}</div>
            <div class="status ${status}">${label}</div>
          </div>
          ${piecesHtml}
        </div>`;
      }).join('');
      list.querySelectorAll('.outfit-piece.own[data-id]').forEach(el => {
        el.addEventListener('click', () => {
          const item = DATA.items.find(it => it.id === el.dataset.id);
          if (item) openItem(item);
        });
      });
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

  // ----- Compatibility scoring for pants × shirts -----
  function scoreShirtPants(shirt, pants) {
    // returns { score: 'strong'|'medium'|'weak'|'no', note: '' }
    const sc = shirt.color, pc = pants.color, sst = shirt.subtype, pst = pants.subtype;
    const sd = (shirt.detail || '').toLowerCase();
    const isPerformance = sst === 'fishing-shirt' || sd.includes('performance') || (shirt.brand || '').toLowerCase().includes('columbia');

    // Performance/fishing shirts — outdoor only
    if (isPerformance) {
      if (pst === 'technical-pant') return { score: 'medium', note: 'Outdoor/travel pairing' };
      if (pst === 'jeans' && pc === 'dark-indigo') return { score: 'weak', note: 'PFG shirts read too outdoorsy' };
      return { score: 'weak', note: 'Performance shirt — outdoor settings only' };
    }

    // Loud patterns - downgrade
    if (sd.includes('plaid') || sd.includes('graphic') || sd.includes('logo')) {
      if (pst === 'jeans') return { score: 'weak', note: 'Loud pattern dilutes the system' };
      return { score: 'weak' };
    }

    // Technical pant — only with tees/performance
    if (pst === 'technical-pant') {
      return { score: 'weak', note: 'Technical pant works best with tees' };
    }

    // Black dress trouser — formal pairings
    if (pst === 'dress-trouser') {
      if (sst === 'dress-shirt' || sst === 'oxford') {
        if (sc === 'white' || sc === 'light-blue') return { score: 'strong', note: 'Formal — with suit or open collar' };
        if (sc === 'black') return { score: 'strong', note: 'Evening / going-out' };
        if (sc === 'navy' || sc === 'charcoal') return { score: 'medium', note: 'Evening, mature' };
        if (sc === 'medium-blue') return { score: 'medium' };
        return { score: 'medium' };
      }
      if (sst === 'button-shirt' && sc === 'charcoal') return { score: 'medium', note: 'Evening' };
      if (sst === 'button-shirt' && sc === 'burgundy') return { score: 'medium', note: 'Evening, masculine' };
      return { score: 'weak', note: 'Dress trouser wants a dress shirt' };
    }

    // Black H&M chino — quasi-formal
    if (pst === 'chino' && pc === 'black') {
      if (sst === 'dress-shirt' || sst === 'oxford') {
        if (sc === 'white' || sc === 'light-blue') return { score: 'medium', note: 'Business-casual' };
        return { score: 'medium' };
      }
      return { score: 'weak' };
    }

    // Dark-indigo jeans — main anchor
    if (pst === 'jeans' && pc === 'dark-indigo') {
      if (sst === 'dress-shirt' || sst === 'oxford') {
        if (sc === 'light-blue') return { score: 'strong', note: 'Your strongest blue + denim template' };
        if (sc === 'white') return { score: 'strong', note: 'Clean founder uniform' };
        if (sc === 'medium-blue' || sc === 'petrol') return { score: 'strong', note: 'Mature blue layering' };
        if (sc === 'navy') return { score: 'strong', note: 'Evening authority' };
        if (sc === 'charcoal') return { score: 'strong', note: 'Sharp daytime' };
        if (sc === 'black') return { score: 'medium', note: 'Evening only — never daytime' };
        if (sc === 'dusty-blue') return { score: 'medium' };
        return { score: 'medium' };
      }
      if (sst === 'button-shirt') {
        if (sc === 'burgundy') return { score: 'strong', note: 'Evening / going-out' };
        if (sc === 'olive') return { score: 'strong', note: 'Founder-casual daily' };
        if (sc === 'navy') return { score: 'strong', note: 'Solid daily authority' };
        if (sc === 'charcoal') return { score: 'strong', note: 'Strong evening template' };
        if (sc === 'stone' || sc === 'sand') return { score: 'medium', note: 'Keep top light, bottom dark' };
        if (sc === 'gray' || sc === 'tan') return { score: 'medium' };
        if (sc === 'red') return { score: 'weak', note: 'Coral/red off the palette' };
        return { score: 'medium' };
      }
      if (sst === 'linen-shirt') {
        if (sc === 'stone' || sc === 'sand') return { score: 'medium', note: 'Resort / island vibe' };
        return { score: 'medium' };
      }
      return { score: 'medium' };
    }

    // Medium-blue jeans — more casual
    if (pst === 'jeans' && pc === 'medium-blue') {
      if (sst === 'dress-shirt' || sst === 'oxford') {
        if (sc === 'white' || sc === 'soft-white') return { score: 'medium', note: 'Casual daily' };
        if (sc === 'light-blue' || sc === 'dusty-blue' || sc === 'medium-blue') return { score: 'weak', note: 'Too much blue' };
        if (sc === 'navy') return { score: 'medium' };
        if (sc === 'charcoal' || sc === 'black') return { score: 'medium', note: 'Casual evening' };
        return { score: 'medium' };
      }
      if (sst === 'button-shirt') {
        if (sc === 'burgundy' || sc === 'olive' || sc === 'navy' || sc === 'charcoal') return { score: 'medium', note: 'Casual daily' };
        return { score: 'weak' };
      }
      if (sst === 'linen-shirt') return { score: 'medium', note: 'Casual / weekend' };
      return { score: 'weak' };
    }

    return { score: 'weak' };
  }
  window.scoreShirtPants = scoreShirtPants;

  // ----- Combinations page -----
  window.setupCombinations = function () {
    const state = { view: 'list', score: 'strong' };
    window.onWardrobeReady = function () {
      const pants = DATA.items.filter(i =>
        i.tier === 'Keep' && (i.type === 'pants')
      );
      const shirts = DATA.items.filter(i =>
        i.tier === 'Keep' && i.type === 'shirt' &&
        ['dress-shirt', 'oxford', 'button-shirt', 'linen-shirt'].includes(i.subtype)
      );

      // Pre-compute all combos with scores
      const combos = [];
      pants.forEach(p => {
        shirts.forEach(s => {
          const result = scoreShirtPants(s, p);
          combos.push({ pants: p, shirt: s, ...result });
        });
      });

      function filterCombos() {
        if (state.score === 'strong') return combos.filter(c => c.score === 'strong');
        if (state.score === 'all-keep') return combos.filter(c => c.score === 'strong' || c.score === 'medium');
        return combos.filter(c => c.score !== 'no');
      }

      function renderList() {
        const list = filterCombos();
        const order = { 'strong': 0, 'medium': 1, 'weak': 2 };
        list.sort((a, b) => order[a.score] - order[b.score]);
        if (list.length === 0) {
          return `<div class="empty-state">No combinations at this filter.</div>`;
        }
        return list.map(c => `
          <div class="combo-row">
            <div class="combo-piece" data-id="${c.shirt.id}">
              <img src="${c.shirt.file}" alt="${c.shirt.id}" loading="lazy" />
              <span class="label">${humanizeTitle(c.shirt)}</span>
            </div>
            <div class="combo-piece" data-id="${c.pants.id}">
              <img src="${c.pants.file}" alt="${c.pants.id}" loading="lazy" />
              <span class="label">${humanizeTitle(c.pants)}</span>
            </div>
            <div class="combo-info">
              <div class="title">${humanizeTitle(c.shirt)} + ${humanizeTitle(c.pants)}</div>
              ${c.note ? `<div class="note">${c.note}</div>` : ''}
            </div>
            <div class="combo-score ${c.score}">${c.score.toUpperCase()}</div>
          </div>
        `).join('');
      }

      function renderMatrix() {
        // shirts as columns, pants as rows
        const list = filterCombos();
        const usedShirtIds = new Set(list.map(c => c.shirt.id));
        const usedPantIds = new Set(list.map(c => c.pants.id));
        const visShirts = shirts.filter(s => state.score === 'all' || usedShirtIds.has(s.id));
        const visPants = pants.filter(p => state.score === 'all' || usedPantIds.has(p.id));
        let html = `<div class="matrix-wrap"><table class="matrix"><thead><tr><th class="corner"></th>`;
        visShirts.forEach(s => {
          html += `<th class="head-shirt" title="${humanizeTitle(s)}"><img src="${s.file}" alt="${s.id}" loading="lazy"/></th>`;
        });
        html += `</tr></thead><tbody>`;
        visPants.forEach(p => {
          html += `<tr><th class="head-pants" title="${humanizeTitle(p)}"><img src="${p.file}" alt="${p.id}" loading="lazy"/></th>`;
          visShirts.forEach(s => {
            const r = scoreShirtPants(s, p);
            const symbol = r.score === 'strong' ? '★' : r.score === 'medium' ? '◐' : r.score === 'weak' ? '·' : '';
            const tooltip = `${humanizeTitle(s)} + ${humanizeTitle(p)}${r.note ? ' — ' + r.note : ''}`;
            html += `<td><div class="cell ${r.score}" title="${tooltip}" data-shirt="${s.id}" data-pants="${p.id}">${symbol}</div></td>`;
          });
          html += `</tr>`;
        });
        html += `</tbody></table></div>`;
        html += `<p class="page-intro" style="font-size:13px;margin-top:8px;">★ strong · ◐ medium · · weak · empty = not recommended. Hover for details, tap to open the item.</p>`;
        return html;
      }

      function render() {
        const el = document.getElementById('combo-content');
        el.innerHTML = state.view === 'list' ? renderList() : renderMatrix();
        // Wire interactions
        el.querySelectorAll('.combo-piece').forEach(p => {
          p.addEventListener('click', () => openItem(DATA.items.find(it => it.id === p.dataset.id)));
        });
        el.querySelectorAll('.matrix .cell').forEach(c => {
          c.addEventListener('click', () => {
            const sid = c.dataset.shirt, pid = c.dataset.pants;
            const shirt = DATA.items.find(it => it.id === sid);
            const pants = DATA.items.find(it => it.id === pid);
            // Show shirt first; user can navigate
            if (shirt) openItem(shirt);
          });
        });
      }

      document.querySelectorAll('#view-toggle button').forEach(b => {
        b.addEventListener('click', () => {
          document.querySelectorAll('#view-toggle button').forEach(x => x.classList.remove('active'));
          b.classList.add('active');
          state.view = b.dataset.view;
          render();
        });
      });
      document.querySelectorAll('#score-toggle button').forEach(b => {
        b.addEventListener('click', () => {
          document.querySelectorAll('#score-toggle button').forEach(x => x.classList.remove('active'));
          b.classList.add('active');
          state.score = b.dataset.score;
          render();
        });
      });
      render();
    };
    load();
  };

  // Mapping: capsule slot -> { sample filename, search query, primary buy URL }
  const SLOT_SAMPLES = {
    'Charcoal crew tee': { file: 'charcoal-crew-tee.svg', q: 'charcoal gray men crew neck t-shirt' },
    'Navy crew tee': { file: 'navy-crew-tee.svg', q: 'navy blue men crew neck t-shirt' },
    'Soft white crew tee': { file: 'soft-white-crew-tee.svg', q: 'white men crew neck t-shirt' },
    'Black performance tee': { file: 'black-performance-tee.svg', q: 'black men performance athletic t-shirt' },
    'Navy AIRism/piqué polo': { file: 'navy-pique-polo.svg', q: 'navy blue men pique polo shirt' },
    'Charcoal knit polo': { file: 'charcoal-knit-polo.svg', q: 'charcoal gray men knit polo' },
    'Dusty blue polo': { file: 'dusty-blue-polo.svg', q: 'dusty blue men polo shirt' },
    'Navy unstructured blazer': { file: 'navy-unstructured-blazer.svg', q: 'navy unstructured linen blazer men' },
    'Charcoal matte vest': { file: 'charcoal-vest.svg', q: 'charcoal gray men casual vest' },
    'Olive or charcoal overshirt': { file: 'olive-overshirt.svg', q: 'olive green men overshirt shacket' },
    'Uniqlo ultralight jacket': { file: 'ultralight-jacket.svg', q: 'Uniqlo ultralight down jacket men navy' },
    'Lightweight rain shell': { file: 'rain-shell.svg', q: 'lightweight rain shell jacket men navy' },
    'Charcoal jeans': { file: 'charcoal-jeans.svg', q: 'charcoal gray men jeans slim straight' },
    'Olive athletic chinos': { file: 'olive-athletic-chinos.svg', q: 'olive green men athletic chinos' },
    'Stone athletic chinos': { file: 'stone-athletic-chinos.svg', q: 'stone beige men athletic chinos' },
    'Navy easy/technical chinos': { file: 'navy-technical-chinos.svg', q: 'navy men technical easy chinos' },
    'Charcoal tropical-weight trousers': { file: 'charcoal-tropical-trousers.svg', q: 'charcoal tropical wool trousers men' },
    'Dark tailored shorts': { file: 'dark-tailored-shorts.svg', q: 'navy men tailored flat front shorts' },
    'Sand linen shorts': { file: 'sand-linen-shorts.svg', q: 'sand beige linen shorts men' },
    'Navy swim shorts': { file: 'navy-swim-shorts.svg', q: 'navy blue solid swim shorts men' },
    'Burgundy textured tie': { file: 'burgundy-tie.svg', q: 'burgundy textured silk tie men' },
    'Navy textured tie': { file: 'navy-tie.svg', q: 'navy textured silk tie men' },
    'Black belt': { file: 'black-belt.svg', q: 'black leather dress belt men' },
    'Dark brown belt': { file: 'dark-brown-belt.svg', q: 'dark brown leather dress belt men' },
    'Light blue oxford shirt': { file: 'light-blue-oxford.svg', q: 'light blue men oxford button down shirt' },
    'Soft white oxford shirt': { file: 'soft-white-oxford.svg', q: 'white men oxford button down shirt' },
    'Petrol/indigo linen shirt': { file: 'petrol-linen-shirt.svg', q: 'petrol indigo linen shirt men' },
    'Pale blue striped shirt': { file: 'pale-blue-striped-shirt.svg', q: 'light blue striped dress shirt men' },
    'Olive linen/cotton shirt': { file: 'olive-linen-shirt.svg', q: 'olive green linen shirt men' },
    'Off-white short-sleeve resort shirt': { file: 'off-white-resort-shirt.svg', q: 'off white short sleeve resort camp shirt men' },
    'Muted blue short-sleeve resort shirt': { file: 'muted-blue-resort-shirt.svg', q: 'dusty blue short sleeve resort camp shirt men' },
    'White dress shirt': { file: 'white-dress-shirt.svg', q: 'white poplin dress shirt men' },
  };

  function buyUrl(slot) {
    const meta = SLOT_SAMPLES[slot];
    const q = meta ? meta.q : slot;
    return 'https://www.google.com/search?tbm=shop&q=' + encodeURIComponent(q);
  }
  function imageSearchUrl(slot) {
    const meta = SLOT_SAMPLES[slot];
    const q = meta ? meta.q : slot;
    return 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(q);
  }
  function shortenSlot(slot) {
    // Trim long slot names for the small label
    return slot.replace(/\(.*?\)/g, '').replace(/\/.*$/, '').trim();
  }
  window.buyUrl = buyUrl;
  window.imageSearchUrl = imageSearchUrl;

  // ----- Potential page -----
  // For each missing capsule slot, show which outfits it unlocks
  // and what existing pieces it pairs with.
  window.setupPotential = function () {
    window.onWardrobeReady = function () {
      // Identify missing slots
      const missing = [];
      CAPSULE.forEach((slot, idx) => {
        const pred = CAPSULE_PREDICATES[idx];
        if (!pred || !DATA.items.some(pred)) missing.push({ slot, idx });
      });

      // Build hypothetical item per missing slot for compatibility checks
      const HYPOTHETICAL = {
        'Charcoal crew tee': { type:'tee', subtype:'tee', color:'charcoal' },
        'Navy crew tee': { type:'tee', subtype:'tee', color:'navy' },
        'Soft white crew tee': { type:'tee', subtype:'tee', color:'soft-white' },
        'Black performance tee': { type:'tee', subtype:'tee', color:'black' },
        'Navy AIRism/piqué polo': { type:'polo', subtype:'polo-pique', color:'navy' },
        'Charcoal knit polo': { type:'polo', subtype:'polo-knit', color:'charcoal' },
        'Dusty blue polo': { type:'polo', subtype:'polo-pique', color:'dusty-blue' },
        'Navy unstructured blazer': { type:'blazer', subtype:'blazer', color:'navy' },
        'Charcoal matte vest': { type:'vest', subtype:'vest', color:'charcoal' },
        'Olive or charcoal overshirt': { type:'jacket', subtype:'overshirt', color:'olive' },
        'Uniqlo ultralight jacket': { type:'jacket', subtype:'ultralight', color:'navy' },
        'Lightweight rain shell': { type:'jacket', subtype:'rain-shell', color:'navy' },
        'Charcoal jeans': { type:'pants', subtype:'jeans', color:'charcoal' },
        'Olive athletic chinos': { type:'pants', subtype:'chino', color:'olive' },
        'Stone athletic chinos': { type:'pants', subtype:'chino', color:'stone' },
        'Navy easy/technical chinos': { type:'pants', subtype:'chino', color:'navy' },
        'Charcoal tropical-weight trousers': { type:'pants', subtype:'dress-trouser', color:'charcoal' },
        'Dark tailored shorts': { type:'shorts', subtype:'chino-short', color:'navy' },
        'Sand linen shorts': { type:'shorts', subtype:'chino-short', color:'sand' },
        'Navy swim shorts': { type:'swimwear', subtype:'swim-shorts', color:'navy' },
        'Burgundy textured tie': { type:'accessory', subtype:'tie', color:'burgundy' },
        'Navy textured tie': { type:'accessory', subtype:'tie', color:'navy' },
        'Black belt': { type:'accessory', subtype:'belt', color:'black' },
        'Dark brown belt': { type:'accessory', subtype:'belt', color:'brown' },
        'Light blue oxford shirt': { type:'shirt', subtype:'oxford', color:'light-blue' },
        'Soft white oxford shirt': { type:'shirt', subtype:'oxford', color:'soft-white' },
        'Petrol/indigo linen shirt': { type:'shirt', subtype:'linen-shirt', color:'petrol' },
        'Pale blue striped shirt': { type:'shirt', subtype:'dress-shirt', color:'light-blue', detail:'striped' },
        'Olive linen/cotton shirt': { type:'shirt', subtype:'linen-shirt', color:'olive' },
        'Off-white short-sleeve resort shirt': { type:'shirt', subtype:'linen-shirt', color:'soft-white' },
        'Muted blue short-sleeve resort shirt': { type:'shirt', subtype:'linen-shirt', color:'dusty-blue' },
        'White dress shirt': { type:'shirt', subtype:'dress-shirt', color:'white' },
      };

      // For each missing item, find existing pieces that combine well
      const cards = missing.map(m => {
        const hyp = HYPOTHETICAL[m.slot];
        if (!hyp) return null;
        const unlocked = [];

        if (hyp.type === 'shirt') {
          // Pair with existing pants
          DATA.items.filter(i => i.tier === 'Keep' && i.type === 'pants').forEach(p => {
            const r = scoreShirtPants(hyp, p);
            if (r.score === 'strong') {
              unlocked.push({
                desc: `${m.slot} + ${humanizeTitle(p)}${r.note ? ' — ' + r.note : ''}`,
                pieces: [p],
                placeholder: m.slot,
              });
            }
          });
        } else if (hyp.type === 'pants') {
          // Pair with existing shirts
          DATA.items.filter(i => i.tier === 'Keep' && i.type === 'shirt').forEach(s => {
            const r = scoreShirtPants(s, hyp);
            if (r.score === 'strong') {
              unlocked.push({
                desc: `${humanizeTitle(s)} + ${m.slot}${r.note ? ' — ' + r.note : ''}`,
                pieces: [s],
                placeholder: m.slot,
              });
            }
          });
        } else if (hyp.type === 'blazer' || hyp.type === 'vest' || hyp.type === 'jacket') {
          // Layering — show with strongest shirts + jeans
          const shirts = DATA.items.filter(i =>
            i.tier === 'Keep' && i.type === 'shirt' &&
            ['light-blue','white','soft-white','navy'].includes(i.color)
          ).slice(0,3);
          const pants = DATA.items.find(i =>
            i.tier === 'Keep' && i.type === 'pants' && i.subtype === 'jeans' && i.color === 'dark-indigo'
          );
          shirts.forEach(s => {
            if (pants) unlocked.push({
              desc: `${m.slot} + ${humanizeTitle(s)} + ${humanizeTitle(pants)}`,
              pieces: [s, pants],
              placeholder: m.slot,
            });
          });
        } else if (hyp.type === 'polo' || hyp.type === 'tee') {
          // Pair with jeans + sneakers
          const pants = DATA.items.filter(i =>
            i.tier === 'Keep' && i.type === 'pants' && i.subtype === 'jeans'
          ).slice(0, 2);
          const shoes = DATA.items.find(i =>
            i.tier === 'Keep' && i.type === 'shoes' && i.subtype === 'sneaker' && (i.brand||'').toLowerCase().includes('on')
          );
          pants.forEach(p => {
            const pieces = [p];
            if (shoes) pieces.push(shoes);
            unlocked.push({
              desc: `${m.slot} + ${humanizeTitle(p)}${shoes ? ' + ' + humanizeTitle(shoes) : ''}`,
              pieces,
              placeholder: m.slot,
            });
          });
        } else if (hyp.subtype === 'tie') {
          // Pair with suit jacket + dress shirts
          const suit = DATA.items.find(i => i.tier === 'Keep' && i.type === 'suit');
          const shirts = DATA.items.filter(i =>
            i.tier === 'Keep' && i.type === 'shirt' &&
            (i.subtype === 'dress-shirt' || i.subtype === 'oxford') &&
            (i.color === 'white' || i.color === 'light-blue')
          ).slice(0, 2);
          shirts.forEach(s => {
            const pieces = [s];
            if (suit) pieces.push(suit);
            unlocked.push({
              desc: `${m.slot} + ${humanizeTitle(s)}${suit ? ' + suit' : ''}`,
              pieces,
              placeholder: m.slot,
            });
          });
        }

        return { slot: m.slot, unlocked: unlocked.slice(0, 6), buyHint: buyHintFor(m.slot) };
      }).filter(Boolean);

      // Sort cards: most unlock potential first
      cards.sort((a, b) => b.unlocked.length - a.unlocked.length);

      function placeholderHtml(slot) {
        const meta = SLOT_SAMPLES[slot];
        const short = shortenSlot(slot);
        const sample = meta && meta.file ? `samples/${meta.file}` : '';
        const buyHref = buyUrl(slot);
        const imgHref = imageSearchUrl(slot);
        return `
          <div class="placeholder">
            <a class="box" href="${imgHref}" target="_blank" rel="noopener" title="View samples on Google Images">
              ${sample ? `<img src="${sample}" alt="${slot} sample" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{textContent:'BUY'}))"/>` : 'BUY'}
            </a>
            <a class="buy-label" href="${buyHref}" target="_blank" rel="noopener" title="Shop ${slot}">${short}</a>
          </div>`;
      }

      const html = cards.length === 0 ? `<div class="empty-state">Capsule complete — nothing to dream about.</div>` :
        cards.map(c => `
          <div class="potential-card">
            <h3><span class="slot">NEED</span><a href="${buyUrl(c.slot)}" target="_blank" rel="noopener" title="Shop for ${c.slot}">${c.slot}</a></h3>
            ${c.buyHint ? `<div class="stores">${c.buyHint}</div>` : ''}
            ${c.unlocked.length === 0 ?
              `<div class="empty-state" style="padding:20px;">No new outfits unlocked yet — needs additional purchases.</div>` :
              `<div style="color:var(--muted);font-size:13px;margin-bottom:6px;">Unlocks ${c.unlocked.length} outfit${c.unlocked.length !== 1 ? 's' : ''}:</div>` +
              c.unlocked.map(u => `
                <div class="unlocked-outfit">
                  <div class="desc">${u.desc}</div>
                  <div class="pieces">
                    ${u.pieces.map(p => `<img src="${p.file}" alt="${p.id}" title="${humanizeTitle(p)}" loading="lazy"/>`).join('')}
                    ${placeholderHtml(u.placeholder)}
                  </div>
                </div>`).join('')
            }
          </div>
        `).join('');

      document.getElementById('potential-content').innerHTML = html;
    };
    load();
  };

  function buyHintFor(slot) {
    const HINTS = {
      'Navy unstructured blazer': 'Nordstrom Rack ($100–160) · Zara ($140–230) · Massimo Dutti ($320)',
      'Charcoal knit polo': 'Uniqlo AIRism ($29) · J.Crew Factory · H&M',
      'Navy AIRism/piqué polo': 'Uniqlo ($29) · Banana Republic Factory · J.Crew Factory',
      'Dusty blue polo': 'Uniqlo · J.Crew Factory',
      'Light blue oxford shirt': 'Uniqlo ($49) · Gap Factory · J.Crew Factory',
      'Soft white oxford shirt': 'Uniqlo · Gap Factory',
      'Petrol/indigo linen shirt': 'Zara · Massimo Dutti · Uniqlo Premium Linen ($49)',
      'Olive linen/cotton shirt': 'Uniqlo · Zara · Old Navy',
      'Burgundy textured tie': 'Macy\'s ($30–70)',
      'Navy textured tie': 'Macy\'s ($30–70)',
      'Charcoal jeans': 'Uniqlo · Gap Factory · BR Factory',
      'Olive athletic chinos': 'Banana Republic Factory athletic chino ($60–70)',
      'Stone athletic chinos': 'Banana Republic Factory athletic chino ($60–70)',
      'Charcoal matte vest': 'Uniqlo · Zara',
      'Olive or charcoal overshirt': 'Zara · Uniqlo · Massimo Dutti',
      'Uniqlo ultralight jacket': 'Uniqlo Ultra Light Down Vest/Jacket',
      'Charcoal crew tee': 'Uniqlo Supima · Banana Republic Factory · H&M',
      'Navy crew tee': 'Uniqlo Supima · BR Factory · H&M',
      'Soft white crew tee': 'Uniqlo Supima · BR Factory',
      'Black performance tee': 'Uniqlo AIRism · Lululemon',
      'Charcoal tropical-weight trousers': 'Banana Republic · Uniqlo Smart Pants',
      'Navy easy/technical chinos': 'Banana Republic Factory · Uniqlo',
      'Dark tailored shorts': 'Uniqlo · H&M · BR Factory',
      'Sand linen shorts': 'H&M ($29–39) · Uniqlo · Zara',
      'Navy swim shorts': 'H&M · Uniqlo',
      'White dress shirt': 'Uniqlo · Zara · Macy\'s',
      'Pale blue striped shirt': 'Uniqlo · Zara · Gap',
      'Off-white short-sleeve resort shirt': 'H&M · Zara · Uniqlo Linen',
      'Muted blue short-sleeve resort shirt': 'H&M · Zara · Uniqlo Linen',
      'Black belt': 'Amazon · Macy\'s · Nordstrom Rack',
      'Dark brown belt': 'Amazon · Macy\'s · Nordstrom Rack',
      'Lightweight rain shell': 'Uniqlo · Columbia · Amazon',
    };
    return HINTS[slot] || '';
  }


  // Mobile nav: click to open submenus
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.site-nav .nav-group .nav-label').forEach(function (label) {
      label.addEventListener('click', function (e) {
        if (window.matchMedia && window.matchMedia('(max-width: 720px)').matches) {
          e.preventDefault();
          var group = label.parentElement;
          group.classList.toggle('open');
        }
      });
    });
  });

})();
