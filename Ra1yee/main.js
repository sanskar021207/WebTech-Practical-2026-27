/* GearForge home page — all client-side, no build step. */
(() => {
  'use strict';

  /* ---------------- State ---------------- */
  const state = {
    listings: LISTINGS.slice(),
    cart: new Map(),          // id -> qty
    wishlist: new Set(),      // ids
    filters: { category: 'all', condition: 'all', maxPrice: 1000, sort: 'newest', savedOnly: false, platform: null, brand: null, query: '' }
  };

  try {
    const savedCart = JSON.parse(localStorage.getItem('gf_cart') || '[]');
    savedCart.forEach(([id, qty]) => state.cart.set(id, qty));
    const savedWish = JSON.parse(localStorage.getItem('gf_wishlist') || '[]');
    savedWish.forEach(id => state.wishlist.add(id));
  } catch (e) { /* storage unavailable — continue with empty cart/wishlist */ }

  function persist() {
    try {
      localStorage.setItem('gf_cart', JSON.stringify([...state.cart]));
      localStorage.setItem('gf_wishlist', JSON.stringify([...state.wishlist]));
    } catch (e) { /* ignore */ }
  }

  const byId = id => state.listings.find(p => p.id === id);
  const money = n => '$' + n.toLocaleString('en-US');

  /* ---------------- Part art (inline SVG placeholders) ---------------- */
  function partArt(category) {
    const box = (inner) => `<svg class="art" viewBox="0 0 120 84" role="img" aria-hidden="true">${inner}</svg>`;
    switch (category) {
      case 'cpu': return box(`
        <rect class="an" x="4" y="4" width="112" height="76" rx="6"/>
        <rect class="ad" x="34" y="22" width="52" height="40" rx="3"/>
        <g class="gs" stroke-width="2">
          <path d="M44 12v10M60 12v10M76 12v10M44 62v10M60 62v10M76 62v10"/>
          <path d="M24 32h10M24 42h10M24 52h10M86 32h10M86 42h10M86 52h10"/>
        </g>
        <rect class="ag" x="54" y="36" width="12" height="12" rx="2"/>`);
      case 'gpu': return box(`
        <rect class="an" x="4" y="4" width="112" height="76" rx="6"/>
        <rect class="ab" x="14" y="20" width="92" height="40" rx="5"/>
        <circle class="ap" cx="40" cy="40" r="13"/><circle class="ad" cx="40" cy="40" r="4"/>
        <circle class="ap" cx="80" cy="40" r="13"/><circle class="ad" cx="80" cy="40" r="4"/>
        <rect class="ag" x="14" y="62" width="30" height="7" rx="1.5"/>`);
      case 'mobo': return box(`
        <rect class="an" x="4" y="4" width="112" height="76" rx="6"/>
        <rect class="ab" x="12" y="10" width="96" height="64" rx="4"/>
        <rect class="ad" x="22" y="18" width="24" height="24" rx="2"/>
        <g class="ag"><rect x="52" y="18" width="4" height="48"/><rect x="60" y="18" width="4" height="48"/></g>
        <g class="gs" stroke-width="2"><path d="M74 24h26M74 34h26M74 44h26M22 52h22"/></g>`);
      case 'ram': return box(`
        <rect class="an" x="4" y="4" width="112" height="76" rx="6"/>
        <rect class="ab" x="24" y="14" width="72" height="22" rx="2"/>
        <g class="ap"><rect x="30" y="14" width="4" height="22"/><rect x="40" y="14" width="4" height="22"/><rect x="50" y="14" width="4" height="22"/><rect x="60" y="14" width="4" height="22"/><rect x="70" y="14" width="4" height="22"/><rect x="80" y="14" width="4" height="22"/></g>
        <rect class="ag" x="24" y="40" width="72" height="22" rx="2"/>
        <g class="ap"><rect x="30" y="40" width="4" height="22"/><rect x="40" y="40" width="4" height="22"/><rect x="50" y="40" width="4" height="22"/><rect x="60" y="40" width="4" height="22"/><rect x="70" y="40" width="4" height="22"/><rect x="80" y="40" width="4" height="22"/></g>`);
      case 'storage': return box(`
        <rect class="an" x="4" y="4" width="112" height="76" rx="6"/>
        <rect class="ad" x="18" y="18" width="84" height="48" rx="4"/>
        <circle class="ap" cx="44" cy="42" r="16"/><circle class="ab" cx="44" cy="42" r="4"/>
        <rect class="ag" x="72" y="30" width="18" height="6" rx="1.5"/>
        <rect class="ag" x="72" y="42" width="18" height="6" rx="1.5"/>`);
      case 'psu': return box(`
        <rect class="an" x="4" y="4" width="112" height="76" rx="6"/>
        <rect class="ab" x="16" y="14" width="88" height="56" rx="4"/>
        <circle class="ad" cx="60" cy="42" r="19"/>
        <g class="gs" stroke-width="2"><path d="M60 29v26M47 42h26M50 32l20 20M70 32l-20 20"/></g>
        <path class="gs" stroke-width="3" d="M24 70c0 6 4 8 10 8"/>`);
      case 'case': return box(`
        <rect class="an" x="4" y="4" width="112" height="76" rx="6"/>
        <rect class="ab" x="30" y="10" width="40" height="64" rx="4"/>
        <circle class="ap" cx="50" cy="20" r="3"/>
        <g class="ag"><rect x="38" y="30" width="24" height="3"/><rect x="38" y="37" width="24" height="3"/><rect x="38" y="44" width="24" height="3"/></g>
        <circle class="ad" cx="50" cy="60" r="7"/>`);
      case 'cooler': return box(`
        <rect class="an" x="4" y="4" width="112" height="76" rx="6"/>
        <circle class="ab" cx="60" cy="42" r="30"/>
        <g class="ap">
          <path d="M60 42 L60 16 A26 26 0 0 1 82 30 Z"/>
          <path d="M60 42 L82 30 A26 26 0 0 1 82 54 Z"/>
          <path d="M60 42 L82 54 A26 26 0 0 1 38 54 Z"/>
          <path d="M60 42 L38 54 A26 26 0 0 1 38 30 Z"/>
          <path d="M60 42 L38 30 A26 26 0 0 1 60 16 Z"/>
        </g>
        <circle class="ag" cx="60" cy="42" r="7"/>`);
      default: return box(`<rect class="an" x="4" y="4" width="112" height="76" rx="6"/>`);
    }
  }

  const catName = id => (CATEGORIES.find(c => c.id === id) || {}).name || id;
  const condLabel = c => ({ new: 'New', open: 'Open box', used: 'Used' }[c] || c);

  /* ---------------- Categories ---------------- */
  const catGrid = document.getElementById('catGrid');
  catGrid.innerHTML = CATEGORIES.map(c => `
    <button class="cat-tile" type="button" data-cat="${c.id}">
      <span class="art-wrap">${partArt(c.id)}</span>
      <strong>${c.name}</strong>
      <span>${state.listings.filter(p => p.category === c.id).length} listed</span>
    </button>`).join('');
  catGrid.addEventListener('click', e => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    state.filters.category = btn.dataset.cat;
    renderChips();
    renderGrid();
    document.getElementById('listings').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------------- Category chips ---------------- */
  const catChips = document.getElementById('catChips');
  function renderChips() {
    const chips = [{ id: 'all', name: 'All parts' }, ...CATEGORIES];
    catChips.innerHTML = chips.map(c => `
      <button class="chip" type="button" data-cat="${c.id}" aria-pressed="${state.filters.category === c.id}">${c.name}</button>`).join('');
  }
  catChips.addEventListener('click', e => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    state.filters.category = btn.dataset.cat;
    renderChips();
    renderGrid();
  });

  /* ---------------- Sell-form category options ---------------- */
  document.getElementById('sellCategory').innerHTML =
    CATEGORIES.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  /* ---------------- Filter controls ---------------- */
  const condSel = document.getElementById('condSel');
  const sortSel = document.getElementById('sortSel');
  const priceRange = document.getElementById('priceRange');
  const priceOut = document.getElementById('priceOut');
  const savedOnly = document.getElementById('savedOnly');
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');

  condSel.addEventListener('change', () => { state.filters.condition = condSel.value; renderGrid(); });
  sortSel.addEventListener('change', () => { state.filters.sort = sortSel.value; renderGrid(); });
  priceRange.addEventListener('input', () => {
    state.filters.maxPrice = Number(priceRange.value);
    priceOut.textContent = state.filters.maxPrice >= 1000 ? 'Any price' : money(state.filters.maxPrice);
    renderGrid();
  });
  savedOnly.addEventListener('change', () => { state.filters.savedOnly = savedOnly.checked; renderGrid(); });
  searchForm.addEventListener('submit', e => {
    e.preventDefault();
    state.filters.query = searchInput.value.trim().toLowerCase();
    renderGrid();
    document.getElementById('listings').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  document.getElementById('clearFilters').addEventListener('click', clearAllFilters);
  document.getElementById('emptyReset').addEventListener('click', clearAllFilters);
  function clearAllFilters() {
    state.filters = { category: 'all', condition: 'all', maxPrice: 1000, sort: 'newest', savedOnly: false, platform: null, brand: null, query: '' };
    condSel.value = 'all'; sortSel.value = 'newest'; priceRange.value = 1000; priceOut.textContent = 'Any price';
    savedOnly.checked = false; searchInput.value = '';
    platformPill.hidden = true;
    brandPill.hidden = true;
    renderChips();
    renderGrid();
  }

  /* ---------------- Platform picker ---------------- */
  const pickerResult = document.getElementById('pickerResult');
  const applyPlatform = document.getElementById('applyPlatform');
  const platformPill = document.getElementById('platformPill');
  const platformName = document.getElementById('platformName');
  const brandPill = document.getElementById('brandPill');
  const brandName = document.getElementById('brandName');
  let chosenPlatform = null;

  document.querySelectorAll('input[name="platform"]').forEach(input => {
    input.addEventListener('change', () => {
      chosenPlatform = input.value;
      const info = PLATFORMS[chosenPlatform];
      const count = state.listings.filter(p => p.compat.includes('any') || p.compat.includes(chosenPlatform)).length;
      pickerResult.innerHTML = `
        <p class="picker-hint">${info.label} boards take <strong>${info.memory}</strong>.</p>
        <p class="picker-note">${count} listings currently work with ${info.label}.</p>`;
      applyPlatform.disabled = false;
    });
  });
  applyPlatform.addEventListener('click', () => {
    if (!chosenPlatform) return;
    state.filters.platform = chosenPlatform;
    platformName.textContent = chosenPlatform;
    platformPill.hidden = false;
    renderGrid();
    document.getElementById('listings').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.getElementById('clearPlatform').addEventListener('click', () => {
    state.filters.platform = null;
    platformPill.hidden = true;
    renderGrid();
  });
  document.getElementById('clearBrand').addEventListener('click', () => {
    state.filters.brand = null;
    brandPill.hidden = true;
    renderGrid();
  });

  /* ---------------- Grid rendering ---------------- */
  const grid = document.getElementById('grid');
  const resultCount = document.getElementById('resultCount');
  const emptyState = document.getElementById('emptyState');
  const savedCountEl = document.getElementById('savedCount');
  const clearFiltersBtn = document.getElementById('clearFilters');

  function filteredListings() {
    const f = state.filters;
    return state.listings.filter(p => {
      if (f.category !== 'all' && p.category !== f.category) return false;
      if (f.condition !== 'all' && p.condition !== f.condition) return false;
      if (p.price > f.maxPrice) return false;
      if (f.savedOnly && !state.wishlist.has(p.id)) return false;
      if (f.platform && !(p.compat.includes('any') || p.compat.includes(f.platform))) return false;
      if (f.brand && p.brand !== f.brand) return false;
      if (f.query && !(p.title.toLowerCase().includes(f.query) || p.specs.toLowerCase().includes(f.query))) return false;
      return true;
    }).sort((a, b) => {
      if (f.sort === 'price-asc') return a.price - b.price;
      if (f.sort === 'price-desc') return b.price - a.price;
      return a.added - b.added;
    });
  }

  function cardHTML(p) {
    const saved = state.wishlist.has(p.id);
    const inCart = state.cart.has(p.id);
    const compatText = p.compat.includes('any') ? 'Fits any platform' : 'Works with ' + p.compat.join(', ');
    return `
      <article class="card" data-id="${p.id}">
        <button class="card-media" type="button" data-view="${p.id}" aria-label="View details for ${p.title}">${partArt(p.category)}${p.added <= 2 ? '<span class="flag flag-new">Just listed</span>' : ''}${p.sales >= 200 ? '<span class="flag flag-top">Top seller</span>' : ''}</button>
        <div class="card-body">
          <div class="card-meta">
            <span class="cond cond-${p.condition}">${condLabel(p.condition)}</span>
            <span class="brand-tag">${p.brand}</span>
            <span class="compat">${compatText}</span>
          </div>
          <h3 class="card-title"><button type="button" data-view="${p.id}">${p.title}</button></h3>
          <p class="card-specs">${p.specs}</p>
          <p class="card-seller"><span class="seller"><span class="avatar" aria-hidden="true">${p.seller.charAt(0).toUpperCase()}</span>${p.seller}</span><span>★ ${p.rating} · ${p.sales} sold</span></p>
          <div class="card-foot">
            <span class="price">${money(p.price)}</span>
            <div class="card-actions">
              <button class="heart" type="button" data-wish="${p.id}" aria-pressed="${saved}" aria-label="${saved ? 'Remove from saved' : 'Save for later'}">
                <svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-9.7-9A5.3 5.3 0 0 1 12 6.2 5.3 5.3 0 0 1 21.7 11.5c-2.2 4.4-9.7 9-9.7 9z"/></svg>
              </button>
              <button class="btn btn-primary btn-sm${inCart ? ' is-added' : ''}" type="button" data-add="${p.id}">${inCart ? 'In cart' : 'Add to cart'}</button>
            </div>
          </div>
        </div>
      </article>`;
  }

  function renderGrid() {
    const list = filteredListings();
    grid.innerHTML = list.map(cardHTML).join('');
    emptyState.hidden = list.length !== 0;
    grid.hidden = list.length === 0;
    resultCount.textContent = `${list.length} part${list.length === 1 ? '' : 's'} found`;
    savedCountEl.textContent = state.wishlist.size;
    const f = state.filters;
    const isDefault = f.category === 'all' && f.condition === 'all' && f.maxPrice >= 1000 && !f.savedOnly && !f.platform && !f.brand && !f.query;
    clearFiltersBtn.hidden = isDefault;
  }

  grid.addEventListener('click', e => {
    const view = e.target.closest('[data-view]');
    if (view) { openQuickView(Number(view.dataset.view)); return; }
    const add = e.target.closest('[data-add]');
    if (add) { addToCart(Number(add.dataset.add)); return; }
    const wish = e.target.closest('[data-wish]');
    if (wish) { toggleWishlist(Number(wish.dataset.wish)); return; }
  });

  /* ---------------- Recommendations ---------------- */
  const recRow = document.getElementById('recRow');
  function renderRecommendations() {
    const picks = state.listings.slice().sort((a, b) => (b.rating - a.rating) || (b.sales - a.sales)).slice(0, 8);
    recRow.innerHTML = picks.map(p => `
      <article class="rec-card" data-id="${p.id}">
        <button class="rec-media" type="button" data-view="${p.id}" aria-label="View details for ${p.title}">${partArt(p.category)}</button>
        <div class="rec-body">
          <p class="rec-title">${p.title}</p>
          <p class="rec-rating">★ ${p.rating} · ${catName(p.category)}</p>
          <div class="rec-foot">
            <span class="price">${money(p.price)}</span>
            <button class="rec-add" type="button" data-add="${p.id}" aria-label="Add ${p.title} to cart">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg>
            </button>
          </div>
        </div>
      </article>`).join('');
  }
  recRow.addEventListener('click', e => {
    const view = e.target.closest('[data-view]');
    if (view) { openQuickView(Number(view.dataset.view)); return; }
    const add = e.target.closest('[data-add]');
    if (add) { addToCart(Number(add.dataset.add)); }
  });

  /* ---------------- Latest gadgets ---------------- */
  const latestRow = document.getElementById('latestRow');
  function renderLatest() {
    const picks = state.listings.slice().sort((a, b) => a.added - b.added).slice(0, 8);
    latestRow.innerHTML = picks.map(p => `
      <article class="rec-card" data-id="${p.id}">
        <button class="rec-media" type="button" data-view="${p.id}" aria-label="View details for ${p.title}">${partArt(p.category)}</button>
        <div class="rec-body">
          <p class="rec-title">${p.title}</p>
          <p class="rec-rating">${p.added === 0 ? 'Listed today' : `Listed ${p.added} day${p.added === 1 ? '' : 's'} ago`}</p>
          <div class="rec-foot">
            <span class="price">${money(p.price)}</span>
            <button class="rec-add" type="button" data-add="${p.id}" aria-label="Add ${p.title} to cart">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg>
            </button>
          </div>
        </div>
      </article>`).join('');
  }
  latestRow.addEventListener('click', e => {
    const view = e.target.closest('[data-view]');
    if (view) { openQuickView(Number(view.dataset.view)); return; }
    const add = e.target.closest('[data-add]');
    if (add) { addToCart(Number(add.dataset.add)); }
  });

  /* ---------------- Shop by brand ---------------- */
  const brandGrid = document.getElementById('brandGrid');
  function renderBrands() {
    const counts = new Map();
    state.listings.forEach(p => counts.set(p.brand, (counts.get(p.brand) || 0) + 1));
    const brands = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    brandGrid.innerHTML = brands.map(([brand, count]) => `
      <button class="brand-tile" type="button" data-brand="${brand}">
        <span class="brand-mark-tile">${brand.slice(0, 2).toUpperCase()}</span>
        <strong>${brand}</strong>
        <span>${count} listed</span>
      </button>`).join('');
  }
  brandGrid.addEventListener('click', e => {
    const btn = e.target.closest('[data-brand]');
    if (!btn) return;
    state.filters.brand = btn.dataset.brand;
    brandName.textContent = btn.dataset.brand;
    brandPill.hidden = false;
    renderGrid();
    document.getElementById('listings').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------------- Quick view ---------------- */
  const quickView = document.getElementById('quickView');
  const quickBody = document.getElementById('quickBody');
  function openQuickView(id) {
    const p = byId(id);
    if (!p) return;
    const saved = state.wishlist.has(id);
    const inCart = state.cart.has(id);
    const compatText = p.compat.includes('any') ? 'Fits any current AM5, AM4 or LGA1700 build' : 'Works with ' + p.compat.map(k => PLATFORMS[k] ? PLATFORMS[k].label : k).join(', ');
    quickBody.innerHTML = `
      <div class="qv">
        <div class="qv-art">${partArt(p.category)}</div>
        <div class="qv-info">
          <span class="cond cond-${p.condition}">${condLabel(p.condition)}</span>
          <h3>${p.title}</h3>
          <span class="price price-lg">${money(p.price)}</span>
          <dl class="facts">
            <div><dt>Brand</dt><dd>${p.brand}</dd></div>
            <div><dt>Category</dt><dd>${catName(p.category)}</dd></div>
            <div><dt>Specs</dt><dd>${p.specs}</dd></div>
            <div><dt>Compatibility</dt><dd>${compatText}</dd></div>
            <div><dt>Seller</dt><dd>${p.seller} · ★ ${p.rating} (${p.sales} sales)</dd></div>
          </dl>
          <div class="qv-actions">
            <button class="btn btn-primary${inCart ? ' is-added' : ''}" type="button" data-add="${p.id}">${inCart ? 'In cart' : 'Add to cart'}</button>
            <button class="btn btn-ghost-dark heart-btn" type="button" data-wish="${p.id}" aria-pressed="${saved}">
              <svg viewBox="0 0 24 24"><path d="M12 20.5s-7.5-4.6-9.7-9A5.3 5.3 0 0 1 12 6.2 5.3 5.3 0 0 1 21.7 11.5c-2.2 4.4-9.7 9-9.7 9z"/></svg>
              ${saved ? 'Saved' : 'Save for later'}
            </button>
          </div>
        </div>
      </div>`;
    showDialog(quickView);
  }
  quickBody.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) { addToCart(Number(add.dataset.add)); openQuickView(Number(add.dataset.add)); return; }
    const wish = e.target.closest('[data-wish]');
    if (wish) { toggleWishlist(Number(wish.dataset.wish)); openQuickView(Number(wish.dataset.wish)); }
  });

  /* ---------------- Cart ---------------- */
  const cartDrawer = document.getElementById('cartDrawer');
  const cartList = document.getElementById('cartList');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartFooter = document.getElementById('cartFooter');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartCount = document.getElementById('cartCount');

  function addToCart(id) {
    state.cart.set(id, (state.cart.get(id) || 0) + 1);
    persist();
    renderCart();
    renderGrid();
    const p = byId(id);
    showToast(`Added ${p.title} to cart`);
  }
  function setQty(id, qty) {
    if (qty <= 0) { state.cart.delete(id); } else { state.cart.set(id, qty); }
    persist();
    renderCart();
    renderGrid();
  }
  function removeFromCart(id) { setQty(id, 0); }

  function renderCart() {
    const items = [...state.cart.entries()].map(([id, qty]) => ({ p: byId(id), qty })).filter(x => x.p);
    const totalQty = items.reduce((n, x) => n + x.qty, 0);
    cartCount.textContent = totalQty;
    cartCount.hidden = totalQty === 0;
    cartEmpty.hidden = items.length !== 0;
    cartFooter.hidden = items.length === 0;

    cartList.innerHTML = items.map(({ p, qty }) => `
      <li class="cart-item" data-id="${p.id}">
        <span class="cart-thumb">${partArt(p.category)}</span>
        <div>
          <p class="cart-title">${p.title}</p>
          <p class="cart-sub">${condLabel(p.condition)} · ${money(p.price)} each</p>
          <div class="qty" role="group" aria-label="Quantity for ${p.title}">
            <button class="btn btn-ghost-dark btn-sm" type="button" data-qty="-1" aria-label="Decrease quantity">−</button>
            <span aria-live="polite">${qty}</span>
            <button class="btn btn-ghost-dark btn-sm" type="button" data-qty="1" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <div style="display:grid;gap:.5rem;justify-items:end;">
          <span class="price">${money(p.price * qty)}</span>
          <button class="link-btn" type="button" data-remove>Remove</button>
        </div>
      </li>`).join('');

    const subtotal = items.reduce((n, x) => n + x.p.price * x.qty, 0);
    cartSubtotal.textContent = money(subtotal);
  }
  cartList.addEventListener('click', e => {
    const item = e.target.closest('.cart-item');
    if (!item) return;
    const id = Number(item.dataset.id);
    const qtyBtn = e.target.closest('[data-qty]');
    if (qtyBtn) { setQty(id, (state.cart.get(id) || 0) + Number(qtyBtn.dataset.qty)); return; }
    if (e.target.closest('[data-remove]')) { removeFromCart(id); showToast('Removed from cart'); }
  });

  document.getElementById('openCart').addEventListener('click', () => showDialog(cartDrawer));
  document.getElementById('checkoutBtn').addEventListener('click', () => {
    document.getElementById('checkoutNote').hidden = false;
  });

  /* ---------------- Wishlist ---------------- */
  function toggleWishlist(id) {
    const p = byId(id);
    if (state.wishlist.has(id)) { state.wishlist.delete(id); showToast(`Removed ${p.title} from saved`); }
    else { state.wishlist.add(id); showToast(`Saved ${p.title}`); }
    persist();
    renderGrid();
  }

  /* ---------------- Sell form ---------------- */
  const sellDialog = document.getElementById('sellDialog');
  const sellForm = document.getElementById('sellForm');
  document.querySelectorAll('[data-open-sell]').forEach(btn => btn.addEventListener('click', () => showDialog(sellDialog)));
  sellForm.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(sellForm);
    const compatVal = data.get('compat');
    const newListing = {
      id: Date.now(),
      title: String(data.get('title')).trim(),
      category: data.get('category'),
      condition: data.get('condition'),
      price: Math.max(1, Number(data.get('price')) || 1),
      specs: String(data.get('specs') || '').trim() || 'No additional specs listed',
      seller: String(data.get('seller') || '').trim() || 'you',
      brand: String(data.get('brand') || '').trim() || 'Unbranded',
      rating: 5.0,
      sales: 0,
      compat: compatVal === 'any' ? ['any'] : [compatVal],
      added: 0
    };
    state.listings.unshift(newListing);
    sellForm.reset();
    closeDialog(sellDialog);
    renderRecommendations();
    renderLatest();
    renderBrands();
    state.filters.category = newListing.category;
    renderChips();
    renderGrid();
    showToast('Your listing is live');
    document.getElementById('listings').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------------- Dialog helpers ---------------- */
  function showDialog(dialog) {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }
  function closeDialog(dialog) { dialog.close ? dialog.close() : dialog.removeAttribute('open'); }
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('click', e => { if (e.target === dialog) closeDialog(dialog); });
    dialog.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeDialog(dialog); });
  });

  /* ---------------- Toasts ---------------- */
  const toasts = document.getElementById('toasts');
  function showToast(msg) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    toasts.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  /* ---------------- Social links (demo) ---------------- */
  document.querySelectorAll('[data-social]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      showToast(`${a.dataset.social} link is a placeholder in this demo`);
    });
  });

  /* ---------------- Mobile nav ---------------- */
  const menuBtn = document.getElementById('menuBtn');
  const navBar = document.getElementById('navBar');
  menuBtn.addEventListener('click', () => {
    const open = navBar.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', String(open));
  });
  navBar.addEventListener('click', e => {
    if (e.target.closest('a')) { navBar.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  });

  /* ---------------- Visual polish ---------------- */
  const siteHeader = document.querySelector('.site-header');
  const toTop = document.getElementById('toTop');
  const navLinks = document.querySelectorAll('#navBar .nav a');
  const secCat = document.getElementById('categories');
  const secHow = document.getElementById('how');
  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    if (siteHeader) siteHeader.classList.toggle('is-scrolled', y > 8);
    if (toTop) toTop.hidden = y < 700;
    const inParts = !!(secCat && secHow) && secCat.getBoundingClientRect().top < 160 && secHow.getBoundingClientRect().top > 160;
    navLinks.forEach(a => {
      const h = a.getAttribute('href');
      const on = (h === '#top' && !inParts) || (h === '#categories' && inParts);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.querySelectorAll('[data-socket]').forEach(btn => btn.addEventListener('click', () => {
    const radio = document.querySelector(`input[name="platform"][value="${btn.dataset.socket}"]`);
    if (!radio) return;
    radio.checked = true;
    radio.dispatchEvent(new Event('change'));
    document.getElementById('quickmatch').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }));
  onScroll();

  /* ---------------- Init ---------------- */
  document.getElementById('year').textContent = new Date().getFullYear();
  renderChips();
  renderGrid();
  renderRecommendations();
  renderLatest();
  renderBrands();
  renderCart();
})();
