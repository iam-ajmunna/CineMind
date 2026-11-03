/**
 * CINEMIND Content Script
 * Layered server detection, directory parser, Shadow DOM overlay, and website bridge.
 * Pure Vanilla ES6+ (No bundler required).
 */

(function () {
  'use strict';

  // Guard against re-injection
  if (window.__CINEMIND_INJECTED__) return;
  window.__CINEMIND_INJECTED__ = true;

  // Guard against invalid documents (XML, about:blank, etc.)
  if (!document || !document.documentElement) return;
  if (window.location.protocol === 'chrome-extension:' || window.location.protocol === 'about:') return;

  const currentUrl = window.location.href.toLowerCase();
  const currentHost = window.location.hostname.toLowerCase();

  // 1. PAGE CLASSIFICATION
  function classifyPage() {
    // Check if on CINEMIND web application
    if (currentHost === 'localhost' || currentHost === '127.0.0.1' || currentUrl.includes('.run.app')) {
      return { category: 'cinemind_site' };
    }

    // Check media servers
    if (currentUrl.includes('dflix.live') || currentUrl.includes('172.16.50.') || document.title.toLowerCase().includes('dflix')) {
      return { category: 'media_server', type: 'dflix', name: 'DFlix Live (WiFi BDIX)', url: window.location.origin };
    }
    if (currentUrl.includes('allsitehub.site') || document.title.toLowerCase().includes('allsitehub')) {
      return { category: 'media_server', type: 'allsitehub', name: 'AllSiteHub Media Directory', url: window.location.origin };
    }
    if (currentUrl.includes('plex.tv') || currentUrl.includes(':32400') || document.title.toLowerCase().includes('plex')) {
      return { category: 'media_server', type: 'plex', name: document.title.replace('Plex', '').trim() || 'Plex Media Server', url: window.location.origin };
    }
    if (currentUrl.includes(':8096') && document.title.toLowerCase().includes('jellyfin')) {
      return { category: 'media_server', type: 'jellyfin', name: 'Jellyfin Media Server', url: window.location.origin };
    }
    if (currentUrl.includes(':8096') && document.title.toLowerCase().includes('emby')) {
      return { category: 'media_server', type: 'emby', name: 'Emby Media Server', url: window.location.origin };
    }
    if (currentUrl.includes('stremio.com') || currentUrl.includes('app.strem.io')) {
      return { category: 'media_server', type: 'stremio', name: 'Stremio Web', url: window.location.origin };
    }
    if (currentUrl.includes(':8080') || document.title.toLowerCase().includes('kodi') || document.title.toLowerCase().includes('chorus')) {
      return { category: 'media_server', type: 'kodi', name: 'Kodi Media Center', url: window.location.origin };
    }
    if (currentUrl.includes(':7878') || document.title.toLowerCase().includes('radarr')) {
      return { category: 'media_server', type: 'radarr', name: 'Radarr Movie Manager', url: window.location.origin };
    }

    // Check movie directory sites
    if (currentHost.includes('imdb.com')) {
      const isMovieDetail = /\/title\/tt\d+/i.test(currentUrl);
      return { category: 'movie_directory', site: 'imdb', isDetail: isMovieDetail, isList: !isMovieDetail };
    }
    if (currentHost.includes('letterboxd.com')) {
      const isMovieDetail = /\/film\/[^\/]+\/?$/i.test(window.location.pathname);
      return { category: 'movie_directory', site: 'letterboxd', isDetail: isMovieDetail, isList: !isMovieDetail };
    }
    if (currentHost.includes('rottentomatoes.com')) {
      const isMovieDetail = /\/m\/[^\/]+/i.test(currentUrl);
      return { category: 'movie_directory', site: 'rottentomatoes', isDetail: isMovieDetail, isList: !isMovieDetail };
    }
    if (currentHost.includes('themoviedb.org')) {
      const isMovieDetail = /\/movie\/\d+/i.test(currentUrl);
      return { category: 'movie_directory', site: 'tmdb', isDetail: isMovieDetail, isList: !isMovieDetail };
    }

    // Custom learned selector or explicitly marked movie server
    const customLearned = localStorage.getItem('cinemind_learned_selector');
    if (customLearned) {
      return { category: 'media_server', type: 'custom', name: document.title.split(/[-|•]/)[0].trim() || 'Custom Server', url: window.location.origin };
    }

    // Unrelated general website — remain dormant to avoid unwanted noise or errors
    return { category: 'other' };
  }

  const pageInfo = classifyPage();

  // 2. REGISTER RUNTIME MESSAGE LISTENER (Fixes "Receiving end does not exist")
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request) {
      sendResponse({ status: 'ignored' });
      return false;
    }

    if (request.type === 'CINEMIND_EXTENSION_SYNC') {
      // Forward to web app page via window.postMessage
      window.postMessage(request, '*');
      sendResponse({ status: 'ok' });
      return false;
    }

    if (request.type === 'CINEMIND_PING') {
      sendResponse({ status: 'pong', pageInfo });
      return false;
    }

    if (request.type === 'CINEMIND_GET_DOM_MOVIES') {
      const movies = scrapeMoviesFromDOM();
      sendResponse({ status: 'ok', movies });
      return false;
    }

    sendResponse({ status: 'unhandled' });
    return false;
  });

  // 3. IF ON CINEMIND APP: SETUP BRIDGE
  if (pageInfo.category === 'cinemind_site') {
    // Notify the app that the extension is active
    window.postMessage({ type: 'CINEMIND_EXTENSION_READY', version: '1.0.1' }, '*');

    window.addEventListener('message', (event) => {
      if (event.data?.type === 'CINEMIND_PING_EXTENSION') {
        chrome.runtime.sendMessage({ type: 'CINEMIND_GET_STATE' }, (res) => {
          if (chrome.runtime.lastError) return;
          window.postMessage({
            type: 'CINEMIND_PONG_EXTENSION',
            data: res?.data || { cinemind_movies: [], cinemind_servers: [] }
          }, '*');
        });
      }
    });
    return;
  }

  // If page is not a media server or movie directory, do not inject intrusive DOM elements
  if (pageInfo.category === 'other') {
    return;
  }

  // 4. WAIT FOR DOM READY BEFORE INJECTING OVERLAYS
  function onDomReady(fn) {
    if (document.body) {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    }
  }

  // 5. MEDIA SERVER SCRAPER & OVERLAY
  let extractedMovies = [];
  let customSelector = localStorage.getItem('cinemind_learned_selector') || null;

  function scrapeMoviesFromDOM() {
    const movies = [];
    const seenTitles = new Set();

    // Priority: Custom selector if taught
    if (customSelector) {
      try {
        const els = document.querySelectorAll(customSelector);
        els.forEach((el) => {
          const title = el.textContent?.trim();
          if (title && !seenTitles.has(title.toLowerCase())) {
            seenTitles.add(title.toLowerCase());
            const card = el.closest('a, div') || el;
            const img = card.querySelector('img');
            movies.push({
              title,
              posterUrl: img?.src || '',
              itemUrl: card.tagName === 'A' ? card.href : window.location.href,
              serverType: pageInfo.type || 'custom',
              serverName: pageInfo.name || 'Media Server'
            });
          }
        });
        if (movies.length > 0) return movies;
      } catch (e) {
        // Selector error
      }
    }

    // DFlix FTP & WiFi BDIX servers
    if (pageInfo.type === 'dflix') {
      const cards = document.querySelectorAll('.movie-card, .film-item, .card, a:has(img), div.item');
      cards.forEach((card) => {
        const titleEl = card.querySelector('.title, .name, h2, h3, h4, span, p') || card;
        const img = card.querySelector('img');
        const link = card.tagName === 'A' ? card : card.querySelector('a');
        const text = titleEl?.textContent?.trim() || img?.getAttribute('alt')?.trim();
        if (text && text.length > 1 && text.length < 80 && !seenTitles.has(text.toLowerCase())) {
          seenTitles.add(text.toLowerCase());
          movies.push({
            title: text,
            posterUrl: img?.src || '',
            itemUrl: link?.href || window.location.href,
            serverType: 'dflix',
            serverName: 'DFlix Live (WiFi BDIX)'
          });
        }
      });
    }

    // AllSiteHub
    else if (pageInfo.type === 'allsitehub') {
      const items = document.querySelectorAll('article, .post, .entry-title, a:has(img)');
      items.forEach((item) => {
        const titleEl = item.querySelector('.entry-title, .post-title, h2, h3, h4') || item;
        const img = item.querySelector('img');
        const link = item.tagName === 'A' ? item : item.querySelector('a');
        const text = titleEl?.textContent?.trim() || img?.getAttribute('alt')?.trim();
        if (text && text.length > 1 && text.length < 80 && !seenTitles.has(text.toLowerCase())) {
          seenTitles.add(text.toLowerCase());
          movies.push({
            title: text,
            posterUrl: img?.src || '',
            itemUrl: link?.href || window.location.href,
            serverType: 'allsitehub',
            serverName: 'AllSiteHub'
          });
        }
      });
    }

    // Plex
    else if (pageInfo.type === 'plex') {
      const cards = document.querySelectorAll('div[data-testid*="cell-item"], div[class*="MetadataPosterCard-card-"], div[class*="PosterCard-poster-"]');
      cards.forEach((card) => {
        const titleEl = card.querySelector('span[data-testid="cell-item-title"], a[data-testid="cell-item-title"], div[class*="MetadataPosterCard-title-"], span[class*="title-"]');
        const img = card.querySelector('img');
        const link = card.querySelector('a');
        const text = titleEl?.textContent?.trim();
        if (text && !seenTitles.has(text.toLowerCase())) {
          seenTitles.add(text.toLowerCase());
          movies.push({
            title: text,
            posterUrl: img?.src || '',
            itemUrl: link?.href || window.location.href,
            serverType: 'plex',
            serverName: pageInfo.name
          });
        }
      });
    }

    // Jellyfin / Emby
    else if (pageInfo.type === 'jellyfin' || pageInfo.type === 'emby') {
      const cards = document.querySelectorAll('div.card, div[class*="cardImageContainer"], div[class*="itemContainer"]');
      cards.forEach((card) => {
        const titleEl = card.querySelector('div.cardText, div[class*="cardText-first"], h3, .itemName');
        const img = card.querySelector('img') || card.querySelector('div[style*="background-image"]');
        const link = card.querySelector('a') || card.closest('a');
        const text = titleEl?.textContent?.trim();
        if (text && !seenTitles.has(text.toLowerCase())) {
          seenTitles.add(text.toLowerCase());
          let poster = '';
          if (img?.tagName === 'IMG') {
            poster = img.src;
          } else if (img) {
            const bg = img.style?.backgroundImage || '';
            const match = bg.match(/url\(['"]?(.*?)['"]?\)/);
            if (match) poster = match[1];
          }
          movies.push({
            title: text,
            posterUrl: poster,
            itemUrl: link?.href || window.location.href,
            serverType: pageInfo.type,
            serverName: pageInfo.name
          });
        }
      });
    }

    // Movie Directory List Scraper (IMDb lists, Letterboxd lists, Rotten Tomatoes lists)
    else if (pageInfo.category === 'movie_directory') {
      if (pageInfo.site === 'imdb') {
        const items = document.querySelectorAll('.ipc-metadata-list-summary-item, .lister-item, li.ipc-metadata-list__item');
        items.forEach((item) => {
          const titleEl = item.querySelector('h3, .ipc-title__text, .lister-item-header a');
          let text = titleEl?.textContent?.trim() || '';
          text = text.replace(/^\d+[\.\s]+/, ''); // remove "1. ", "2. "
          const yearEl = item.querySelector('.cli-title-metadata-item, .lister-item-year');
          const yearMatch = yearEl?.textContent?.match(/\b(19\d\d|20\d\d)\b/);
          if (text && !seenTitles.has(text.toLowerCase())) {
            seenTitles.add(text.toLowerCase());
            movies.push({
              title: text,
              year: yearMatch ? parseInt(yearMatch[1], 10) : undefined,
              posterUrl: item.querySelector('img')?.src || '',
              itemUrl: item.querySelector('a')?.href || window.location.href,
              serverType: 'imdb_list',
              serverName: 'IMDb Directory'
            });
          }
        });
      } else if (pageInfo.site === 'letterboxd') {
        const posters = document.querySelectorAll('li.poster-container, div.film-poster, li.listitem');
        posters.forEach((p) => {
          const img = p.querySelector('img');
          const text = img?.getAttribute('alt')?.trim() || p.getAttribute('data-film-name');
          if (text && !seenTitles.has(text.toLowerCase())) {
            seenTitles.add(text.toLowerCase());
            movies.push({
              title: text,
              posterUrl: img?.src || '',
              itemUrl: p.querySelector('a')?.href || window.location.href,
              serverType: 'letterboxd_list',
              serverName: 'Letterboxd Directory'
            });
          }
        });
      }
    }

    return movies;
  }

  // 6. MOVIE DETAIL PAGE: INJECT "ON YOUR SERVER" / "NOT ON SERVER" CHIP
  if (pageInfo.category === 'movie_directory' && pageInfo.isDetail) {
    onDomReady(() => {
      let pageTitle = '';
      let pageYear = null;

      if (pageInfo.site === 'imdb') {
        const titleEl = document.querySelector('h1[data-testid="hero__pageTitle"], h1');
        pageTitle = titleEl?.textContent?.trim() || '';
        const yearEl = document.querySelector('a[href*="releaseinfo"], ul.ipc-inline-list li');
        const match = yearEl?.textContent?.match(/\b(19\d\d|20\d\d)\b/);
        if (match) pageYear = parseInt(match[1], 10);
      } else if (pageInfo.site === 'letterboxd') {
        const titleEl = document.querySelector('h1.headline-1, .film-title-wrapper h1');
        pageTitle = titleEl?.textContent?.trim() || '';
        const yearEl = document.querySelector('.releaseyear, a[href*="/films/year/"]');
        const match = yearEl?.textContent?.match(/\b(19\d\d|20\d\d)\b/);
        if (match) pageYear = parseInt(match[1], 10);
      } else if (pageInfo.site === 'rottentomatoes') {
        const titleEl = document.querySelector('h1.scoreboard__title, h1[data-qa="score-panel-title"]');
        pageTitle = titleEl?.textContent?.trim() || '';
      }

      if (!pageTitle) return;

      // Ask background whether this film exists on any user media server
      chrome.runtime.sendMessage({
        type: 'CINEMIND_CHECK_MOVIE_AVAILABILITY',
        payload: { title: pageTitle, year: pageYear }
      }, (res) => {
        if (chrome.runtime.lastError) return;

        const isAvailable = res?.available;
        const matched = res?.movie;

        injectAvailabilityChip(pageTitle, pageYear, isAvailable, matched);
      });
    });

    function injectAvailabilityChip(title, year, isAvailable, matched) {
      if (document.getElementById('cinemind-film-chip')) return;

      const chip = document.createElement('div');
      chip.id = 'cinemind-film-chip';
      chip.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 2147483647;
        background: #07070A;
        border: 1px solid ${isAvailable ? '#CCFF00' : '#00F0FF'};
        box-shadow: 0 0 25px ${isAvailable ? 'rgba(204,255,0,0.35)' : 'rgba(0,240,255,0.35)'};
        border-radius: 9999px;
        padding: 10px 18px;
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: monospace;
        font-size: 12px;
        font-weight: 700;
        color: #FFF;
      `;

      if (isAvailable) {
        chip.innerHTML = `
          <span style="color:#CCFF00;font-size:14px;">✓</span>
          <span>ON YOUR SERVER (<strong style="color:#CCFF00;">${matched?.serverName || 'Plex'}</strong>)</span>
          ${matched?.itemUrl ? `<a href="${matched.itemUrl}" target="_blank" style="background:#CCFF00;color:#000;text-decoration:none;padding:4px 10px;border-radius:6px;font-size:11px;">▶ WATCH NOW</a>` : ''}
        `;
      } else {
        chip.innerHTML = `
          <span style="color:#00F0FF;font-size:14px;">⚡</span>
          <span>NOT ON YOUR SERVER</span>
          <a href="http://localhost:3000" target="_blank" style="background:rgba(0,240,255,0.2);color:#00F0FF;border:1px solid #00F0FF;text-decoration:none;padding:4px 10px;border-radius:6px;font-size:11px;">REQUEST VIA RADARR</a>
        `;
      }

      document.body.appendChild(chip);
    }

    return;
  }

  // 7. INJECT FLOATING OVERLAY ON MEDIA SERVERS & LIST DIRECTORIES
  onDomReady(() => {
    injectShadowOverlay();

    // Debounced dynamic observation
    let scrapeTimeout = null;
    function triggerScrape() {
      clearTimeout(scrapeTimeout);
      scrapeTimeout = setTimeout(() => {
        const fresh = scrapeMoviesFromDOM();
        if (fresh.length > 0) {
          extractedMovies = fresh;
          updateOverlayUI();

          // Safely send to background service worker with error swallowing
          chrome.runtime.sendMessage({
            type: 'CINEMIND_MOVIES_EXTRACTED',
            payload: { server: pageInfo, movies: fresh }
          }, () => {
            if (chrome.runtime.lastError) { /* ignore */ }
          });
        }
      }, 700);
    }

    try {
      const observer = new MutationObserver(() => triggerScrape());
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      }
    } catch (err) {
      // Ignore observer initialization issues
    }

    setTimeout(triggerScrape, 1200);
  });

  function injectShadowOverlay() {
    if (document.getElementById('cinemind-shadow-root')) return;

    const hostDiv = document.createElement('div');
    hostDiv.id = 'cinemind-shadow-root';
    hostDiv.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:2147483647;font-family:sans-serif;';
    if (!document.body) return;
    document.body.appendChild(hostDiv);

    const shadow = hostDiv.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      .badge-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #07070A;
        color: #CCFF00;
        border: 1px solid rgba(204, 255, 0, 0.4);
        border-radius: 9999px;
        padding: 10px 16px;
        font-family: monospace;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 0 20px rgba(204, 255, 0, 0.25);
        transition: all 0.2s ease;
      }
      .badge-btn:hover {
        transform: scale(1.04);
        box-shadow: 0 0 30px rgba(204, 255, 0, 0.45);
      }
      .panel {
        display: none;
        position: absolute;
        bottom: 54px;
        right: 0;
        width: 320px;
        background: rgba(11, 13, 20, 0.96);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(204, 255, 0, 0.3);
        border-radius: 20px;
        padding: 18px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.95);
        color: #E2E8F0;
        animation: fadeIn 0.2s ease;
      }
      .panel.open { display: block; }
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      .title {
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 1px;
        color: #FFF;
        text-transform: uppercase;
      }
      .subtitle {
        font-size: 11px;
        font-family: monospace;
        color: #CCFF00;
      }
      .count-badge {
        background: #141721;
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 10px;
        border-radius: 12px;
        margin-bottom: 12px;
        font-size: 12px;
      }
      .btn {
        width: 100%;
        padding: 10px;
        margin-bottom: 8px;
        border-radius: 10px;
        border: none;
        font-size: 12px;
        font-weight: 700;
        font-family: monospace;
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
      }
      .btn-primary {
        background: #CCFF00;
        color: #000;
      }
      .btn-primary:hover {
        background: #b5e000;
      }
      .btn-secondary {
        background: rgba(255, 255, 255, 0.08);
        color: #FFF;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.15);
      }
      .close-x {
        cursor: pointer;
        color: #94A3B8;
        font-size: 16px;
      }
      .close-x:hover { color: #FFF; }
      .teach-notice {
        font-size: 10px;
        color: #94A3B8;
        line-height: 1.4;
        margin-top: 6px;
      }
    `;
    shadow.appendChild(style);

    const isDirectory = pageInfo.category === 'movie_directory';
    const isAllSiteHub = pageInfo.type === 'allsitehub';

    const container = document.createElement('div');
    container.innerHTML = `
      <div class="panel" id="cinemind-panel">
        <div class="header">
          <div>
            <div class="title">${isDirectory ? 'COLLECT MOVIE LIST' : (isAllSiteHub ? 'ALLSITEHUB BDIX' : 'CINEMIND SYNC')}</div>
            <div class="subtitle" id="cinemind-srv-name">${pageInfo.name || 'Directory'}</div>
          </div>
          <span class="close-x" id="cinemind-close">✕</span>
        </div>

        <div class="count-badge">
          <div>Detected on page: <strong id="cinemind-count" style="color:#CCFF00">0</strong> ${isDirectory ? 'titles' : 'movies'}</div>
          <div style="font-size:10px;color:#94A3B8;margin-top:2px;">Target: ${pageInfo.type || pageInfo.site || 'Media'}</div>
        </div>

        ${isDirectory ? `
          <button class="btn btn-primary" id="cinemind-sync-btn">📥 Collect List for CINEMIND</button>
        ` : `
          <button class="btn btn-primary" id="cinemind-sync-btn">⚡ Sync with CINEMIND Site</button>
          <button class="btn btn-secondary" id="cinemind-surprise-btn">🎲 Surprise Me From Here</button>
        `}
        <button class="btn btn-secondary" id="cinemind-teach-btn">🎯 Teach Page Selector</button>
        <button class="btn btn-secondary" id="cinemind-export-btn">📥 Export JSON</button>

        <div class="teach-notice" id="cinemind-msg">Connected securely. Zero passwords stored.</div>
      </div>

      <button class="badge-btn" id="cinemind-toggle-btn">
        <span style="color:#CCFF00">⚔</span> CINEMIND (<span id="cinemind-mini-count">0</span>)
      </button>
    `;
    shadow.appendChild(container);

    // Event listeners
    const panel = shadow.getElementById('cinemind-panel');
    const toggleBtn = shadow.getElementById('cinemind-toggle-btn');
    const closeBtn = shadow.getElementById('cinemind-close');
    const syncBtn = shadow.getElementById('cinemind-sync-btn');
    const surpriseBtn = shadow.getElementById('cinemind-surprise-btn');
    const teachBtn = shadow.getElementById('cinemind-teach-btn');
    const exportBtn = shadow.getElementById('cinemind-export-btn');
    const msgEl = shadow.getElementById('cinemind-msg');

    toggleBtn?.addEventListener('click', () => panel?.classList.toggle('open'));
    closeBtn?.addEventListener('click', () => panel?.classList.remove('open'));

    syncBtn?.addEventListener('click', () => {
      window.postMessage({
        type: 'CINEMIND_MEDIA_SERVER_SYNC',
        server: pageInfo,
        movies: extractedMovies
      }, '*');

      if (msgEl) {
        msgEl.textContent = `✓ Synced ${extractedMovies.length} titles to CINEMIND!`;
        msgEl.style.color = '#CCFF00';
      }
    });

    surpriseBtn?.addEventListener('click', () => {
      if (extractedMovies.length === 0) return;
      const pick = extractedMovies[Math.floor(Math.random() * extractedMovies.length)];
      if (pick.itemUrl && pick.itemUrl !== window.location.href) {
        window.location.href = pick.itemUrl;
      }
    });

    teachBtn?.addEventListener('click', () => {
      if (msgEl) {
        msgEl.textContent = 'Click on any movie title on this page to teach the selector...';
        msgEl.style.color = '#00F0FF';
      }
      enableSelectorPicker(shadow);
    });

    exportBtn?.addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
        server: pageInfo,
        movies: extractedMovies,
        exportedAt: new Date().toISOString()
      }, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `cinemind-${pageInfo.type || 'export'}.json`;
      a.click();
      a.remove();
    });
  }

  function updateOverlayUI() {
    const root = document.getElementById('cinemind-shadow-root')?.shadowRoot;
    if (!root) return;
    const countEl = root.getElementById('cinemind-count');
    const miniCountEl = root.getElementById('cinemind-mini-count');
    if (countEl) countEl.textContent = String(extractedMovies.length);
    if (miniCountEl) miniCountEl.textContent = String(extractedMovies.length);
  }

  function enableSelectorPicker(shadow) {
    const clickHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const target = e.target;
      if (!target || target.closest('#cinemind-shadow-root')) return;

      let selector = target.tagName.toLowerCase();
      if (target.className && typeof target.className === 'string') {
        const classes = target.className.split(/\s+/).filter(c => c && !c.includes(':')).slice(0, 2);
        if (classes.length > 0) {
          selector = `.${classes.join('.')}`;
        }
      }

      customSelector = selector;
      localStorage.setItem('cinemind_learned_selector', selector);

      const msgEl = shadow.getElementById('cinemind-msg');
      if (msgEl) {
        msgEl.textContent = `✓ Learned selector: "${selector}"! Rescanning...`;
        msgEl.style.color = '#CCFF00';
      }

      document.removeEventListener('click', clickHandler, true);
      const movies = scrapeMoviesFromDOM();
      extractedMovies = movies;
      updateOverlayUI();
    };

    document.addEventListener('click', clickHandler, true);
  }

})();
