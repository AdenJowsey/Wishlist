(() => {
  'use strict';

  const dataset = window.WISHLIST_DATA || {};
  const items = Array.isArray(dataset.items) ? dataset.items : [];
  const inspiration = Array.isArray(dataset.inspiration) ? dataset.inspiration : [];
  const currency = typeof dataset.currency === 'string' ? dataset.currency : 'NZD';
  const $ = (id) => document.getElementById(id);

  const icons = {
    book: '<path d="M12 6.5c-3.5-2-7.2-2.1-10-1v15c3-1.1 6.5-1.1 10 1 3.5-2.1 7-2.1 10-1v-15c-3-1.1-6.5-1-10 1Z"/><path d="M12 6.5v15"/>',
    puzzle: '<path d="M9.5 3H4a1 1 0 0 0-1 1v5.5a2.5 2.5 0 1 1 0 5V20a1 1 0 0 0 1 1h5.5a2.5 2.5 0 1 1 5 0H20a1 1 0 0 0 1-1v-5.5a2.5 2.5 0 1 1 0-5V4a1 1 0 0 0-1-1h-5.5a2.5 2.5 0 1 1-5 0Z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2.3 4.7-4.7 2.3 2.3-4.7 4.7-2.3Z"/>',
    lamp: '<path d="m6 13 4-9h4l4 9H6ZM12 13v7M8 20h8"/><path d="M4 13h16"/>',
    headphones: '<path d="M3.5 14v-3a8.5 8.5 0 1 1 17 0v3"/><rect x="2.5" y="13" width="5" height="8" rx="2"/><rect x="16.5" y="13" width="5" height="8" rx="2"/>',
    sparkle: '<path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8L12 2Z"/>',
    gift: '<rect x="3" y="9" width="18" height="12" rx="1.5"/><path d="M2 9h20M12 9v12M12 9c-3-5-7-5-7-2 0 2 2 2 7 2ZM12 9c3-5 7-5 7-2 0 2-2 2-7 2Z"/>',
    coffee: '<path d="M5 7h12v9a6 6 0 0 1-12 0V7ZM17 8h2a3 3 0 0 1 0 6h-2M4 22h15M8 2v3M13 2v3"/>',
    generic: '<path d="m12 2 2.6 7.4L22 12l-7.4 2.6L12 22l-2.6-7.4L2 12l7.4-2.6L12 2Z"/>'
  };

  const categoryAppearance = {
    'Books & learning': { style: 'sage', symbol: 'book' },
    'Hobbies & games': { style: 'peach', symbol: 'puzzle' },
    'Experiences': { style: 'lavender', symbol: 'compass' },
    'Home & living': { style: 'butter', symbol: 'lamp' },
    'Tech': { style: 'blue', symbol: 'headphones' },
    'Everyday favourites': { style: 'rose', symbol: 'sparkle' }
  };
  inspiration.forEach((entry) => {
    if (entry?.category && entry?.style) {
      categoryAppearance[entry.category] = { style: entry.style, symbol: entry.symbol || 'generic' };
    }
  });

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
  }

  function safeLink(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
      const url = new URL(value.trim(), document.baseURI);
      return (url.protocol === 'http:' || url.protocol === 'https:') ? url.href : '';
    } catch { return ''; }
  }

  function safeImage(value) {
    if (typeof value !== 'string' || !value.trim()) return '';
    const trimmed = value.trim();
    if (trimmed.startsWith('//')) return '';
    try {
      const url = new URL(trimmed, document.baseURI);
      return (['http:', 'https:'].includes(url.protocol)) ? url.href : '';
    } catch { return ''; }
  }

  function icon(symbol, className = '') {
    return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[symbol] || icons.generic}</svg>`;
  }

  function money(value) {
    if (value === null || value === undefined || value === '' || !Number.isFinite(Number(value)) || Number(value) < 0) return 'Unknown';
    try {
      return new Intl.NumberFormat('en-NZ', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(value));
    } catch { return `$${Number(value).toFixed(0)}`; }
  }

  function normalizedPrice(item) {
    return item.price === null || item.price === undefined || item.price === '' || !Number.isFinite(Number(item.price)) || Number(item.price) < 0
      ? null : Number(item.price);
  }

  function normalizedStars(item) {
    const rating = Number(item.stars);
    return [1, 2, 3].includes(rating) ? rating : 1;
  }

  function renderInspiration() {
    const root = $('inspiration-grid');
    if (!root) return;
    if (!inspiration.length) {
      root.innerHTML = '<p class="content-empty">Add inspiration ideas in <code>data.js</code>.</p>';
      return;
    }
    root.innerHTML = inspiration.map((item, index) => {
      const style = /^[a-z-]+$/.test(item.style || '') ? item.style : 'sage';
      const examples = Array.isArray(item.examples) ? item.examples.slice(0, 3) : [];
      return `<article class="inspiration-card tone-${style}">
        <div class="inspiration-card-top"><span>${escapeHtml(item.number || String(index + 1).padStart(2, '0'))} / IDEA</span><span class="inspiration-icon">${icon(item.symbol, 'idea-icon')}</span></div>
        <div class="inspiration-card-content"><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div>
        <div class="idea-tags">${examples.map((example) => `<span>${escapeHtml(example)}</span>`).join('')}</div>
      </article>`;
    }).join('');
  }

  const VIEW_STORAGE_KEY = 'aden-wishlist-view';
  function savedView() {
    try { return window.localStorage.getItem(VIEW_STORAGE_KEY) === 'list' ? 'list' : 'cards'; }
    catch { return 'cards'; }
  }

  const state = { query: '', category: 'all', price: 'all', stars: 'all', sort: 'priority', view: savedView() };

  function setView(view) {
    state.view = view === 'list' ? 'list' : 'cards';
    $('wishlist-grid').dataset.view = state.view;
    document.querySelectorAll('[data-view].view-option').forEach((button) => {
      const selected = button.dataset.view === state.view;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    try { window.localStorage.setItem(VIEW_STORAGE_KEY, state.view); } catch { /* Storage may be unavailable. */ }
  }

  function displayPriceRange(price) {
    if (state.price === 'all') return true;
    if (state.price === 'unknown') return price === null;
    if (price === null) return false;
    if (state.price === 'under-20') return price < 20;
    if (state.price === '20-50') return price >= 20 && price <= 50;
    if (state.price === '50-100') return price >= 50 && price <= 100;
    if (state.price === '100-300') return price >= 100 && price <= 300;
    if (state.price === '300-plus') return price > 300;
    return true;
  }

  function relevantItems() {
    const filtered = items.filter((item) => {
      const phrase = [item.name, item.category, item.note].join(' ').toLocaleLowerCase();
      return (!state.query || phrase.includes(state.query))
        && (state.category === 'all' || item.category === state.category)
        && displayPriceRange(normalizedPrice(item))
        && (state.stars === 'all' || normalizedStars(item) === Number(state.stars));
    });
    filtered.sort((a, b) => {
      const left = normalizedPrice(a);
      const right = normalizedPrice(b);
      const nameOrder = String(a.name).localeCompare(String(b.name));
      if (state.sort === 'name') return nameOrder;
      if (state.sort === 'price-low') return (left ?? Infinity) - (right ?? Infinity) || nameOrder;
      if (state.sort === 'price-high') return (right ?? -Infinity) - (left ?? -Infinity) || nameOrder;
      return normalizedStars(b) - normalizedStars(a) || (left ?? Infinity) - (right ?? Infinity) || nameOrder;
    });
    return filtered;
  }

  function itemCard(item, position) {
    const appearance = categoryAppearance[item.category] || { style: 'sage', symbol: 'gift' };
    const style = /^[a-z-]+$/.test(appearance.style) ? appearance.style : 'sage';
    const rating = normalizedStars(item);
    const image = safeImage(item.image);
    const url = safeLink(item.url);
    const visual = image
      ? `<img src="${escapeHtml(image)}" alt="" loading="lazy" />`
      : `<div class="item-placeholder">${icon(appearance.symbol, 'item-placeholder-icon')}<span class="placeholder-sun"></span><span class="placeholder-curve"></span></div>`;
    const cta = url
      ? `<a class="item-link" href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" aria-label="View ${escapeHtml(item.name)} in a new tab">View item <span aria-hidden="true">↗</span></a>`
      : '<span class="item-no-link">No link added yet</span>';
    return `<article class="wish-card" style="--card-index:${Math.min(position, 10)}">
      <div class="wish-image tone-${style}">${visual}<span class="wish-rank" aria-label="Priority: ${rating} out of 3 stars">${'★'.repeat(rating)}<span class="unfilled-stars">${'★'.repeat(3 - rating)}</span></span></div>
      <div class="wish-body"><span class="wish-category">${escapeHtml(item.category || 'Other')}</span><h3>${escapeHtml(item.name)}</h3><p class="wish-note">${escapeHtml(item.note || '')}</p>
      <div class="wish-card-footer"><strong class="wish-price">${escapeHtml(money(normalizedPrice(item)))}</strong>${cta}</div></div>
    </article>`;
  }

  function hasFilters() {
    return Boolean(state.query || state.category !== 'all' || state.price !== 'all' || state.stars !== 'all');
  }

  function renderItems() {
    const results = relevantItems();
    $('wishlist-grid').innerHTML = results.map(itemCard).join('');
    $('wishlist-grid').hidden = results.length === 0;
    $('empty-state').hidden = results.length > 0;
    $('results-count').textContent = `${results.length} ${results.length === 1 ? 'item' : 'items'} ${hasFilters() ? 'found' : 'on the list'}`;
    $('clear-filters').hidden = !hasFilters();
    document.querySelectorAll('[data-stars]').forEach((button) => {
      const active = button.dataset.stars === state.stars;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    // Remote photos are entirely optional. If one fails, keep a tidy graphic placeholder.
    $('wishlist-grid').querySelectorAll('.wish-image img').forEach((img) => {
      img.addEventListener('error', () => {
        const placeholder = document.createElement('div');
        placeholder.className = 'item-placeholder image-fallback';
        placeholder.innerHTML = icon('gift', 'item-placeholder-icon');
        img.replaceWith(placeholder);
      }, { once: true });
    });
  }

  function resetFilters() {
    Object.assign(state, { query: '', category: 'all', price: 'all', stars: 'all', sort: 'priority' });
    $('search-input').value = '';
    $('category-filter').value = 'all';
    $('price-filter').value = 'all';
    $('sort-select').value = 'priority';
    renderItems();
  }

  function init() {
    renderInspiration();
    const categories = [...new Set(items.map((item) => item.category).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    $('category-filter').insertAdjacentHTML('beforeend', categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join(''));
    $('search-input').addEventListener('input', (event) => { state.query = event.target.value.trim().toLocaleLowerCase(); renderItems(); });
    $('category-filter').addEventListener('change', (event) => { state.category = event.target.value; renderItems(); });
    $('price-filter').addEventListener('change', (event) => { state.price = event.target.value; renderItems(); });
    $('sort-select').addEventListener('change', (event) => { state.sort = event.target.value; renderItems(); });
    document.querySelectorAll('.view-option[data-view]').forEach((button) => {
      button.addEventListener('click', () => setView(button.dataset.view));
    });
    setView(state.view);
    document.querySelectorAll('[data-stars]').forEach((button) => button.addEventListener('click', () => {
      state.stars = state.stars === button.dataset.stars ? 'all' : button.dataset.stars;
      renderItems();
    }));
    $('clear-filters').addEventListener('click', resetFilters);
    $('empty-reset').addEventListener('click', resetFilters);
    $('year').textContent = window.WISHLIST_DATA.lastUpdated;
    renderItems();
  }

  init();
})();
