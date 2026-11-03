/**
 * CINEMIND Content Script
 * Layered server detection, DOM scraper, Shadow DOM overlay, and website bridge.
 */

(function () {
  'use strict';

  // Prevent double injection
  if (window.__CINEMIND_INJECTED__) return;
  window.__CINEMIND_INJECTED__ = true;

  console.log('[CINEMIND] Content script initialized on:', window.location.href);

  // 1. LAYERED DETECTION STRATEGY
  function detectServer() {
    const url = window.location.href.toLowerCase();
    const title = document.title.toLowerCase();
    const html = document.documentElement.innerHTML.slice(0, 5000).toLowerCase();

    // Fingerprint DFlix (WiFi Provider BDIX FTP Server)
    if (url.includes('dflix.live') || url.includes('172.16.50.') || title.includes('dflix')) {
      return {
        type: 'dflix',
        name: 'DFlix Live (WiFi BDIX)',
        url: window.location.origin
      };
    }

    // Fingerprint AllSiteHub
    if (url.includes('allsitehub.site') || title.includes('allsitehub')) {
      return {
        type: 'allsitehub',
        name: 'AllSiteHub Media Directory',
        url: window.location.origin
      };
    }

    // Fingerprint Plex
    if (url.includes('plex.tv') || url.includes(':32400') || title.includes('plex') || html.includes('plex-web') || document.querySelector('[data-testid*="plex"]')) {
      return {
        type: 'plex',
        name: document.title.replace('Plex', '').trim() || 'Plex Media Server',
        url: window.location.origin
      };
    }

    // Fingerprint Jellyfin
    if (url.includes(':8096') || title.includes('jellyfin') || html.includes('jellyfin') || document.querySelector('meta[name="application-name"][content*="Jellyfin"]')) {
      return {
        type: 'jellyfin',
        name: 'Jellyfin Media Server',
        url: window.location.origin
      };
    }

    // Fingerprint Emby
    if (url.includes(':8096') || title.includes('emby') || html.includes('emby') || document.querySelector('meta[name="application-name"][content*="Emby"]')) {
      return {
        type: 'emby',
        name: 'Emby Media Server',
        url: window.location.origin
      };
    }

    // Fingerprint Stremio Web
    if (url.includes('stremio.com') || title.includes('stremio') || html.includes('stremio')) {
      return {
        type: 'stremio',
        name: 'Stremio Web',
        url: window.location.origin
      };
    }

    // Fingerprint Kodi Web Interface (Chorus)
    if (url.includes(':8080') || title.includes('kodi') || title.includes('chorus') || html.includes('kodi web interface')) {
      return {
        type: 'kodi',
        name: 'Kodi Media Center',
        url: window.location.origin
      };
    }

    // Fingerprint Radarr / Overseerr
    if (url.includes(':7878') || title.includes('radarr')) {
      return {
        type: 'radarr',
        name: 'Radarr Movie Manager',
        url: window.location.origin
      };
    }

    // Generic Custom Server Fallback
    return {
      type: 'custom',
      name: document.title.split(/[-|•]/)[0].trim() || 'Web Movie Server',
      url: window.location.origin
    };
  }

  const detectedServer = detectServer();
  let extractedMovies = [];
  let customSelector = localStorage.getItem('cinemind_learned_selector') || null;

  // 2. DOM SCRAPING LOGIC
  function scrapeMoviesFromDOM() {
    const movies = [];
    const seenTitles = new Set();

    // If custom learned selector exists, prioritize it
    if (customSelector) {
      const customElements = document.querySelectorAll(customSelector);
      customElements.forEach((el) => {
        const titleText = el.textContent?.trim();
        if (titleText && !seenTitles.has(titleText.toLowerCase())) {
          seenTitles.add(titleText.toLowerCase());
          const parentCard = el.closest('a, div[class*="card"], div[class*="item"]') || el;
          const img = parentCard.querySelector('img');
          movies.push({
            title: titleText,
            posterUrl: img?.src || '',
            itemUrl: parentCard.tagName === 'A' ? parentCard.href : window.location.href,
            serverType: detectedServer.type,
            serverName: detectedServer.name
          });
        }
      });
      if (movies.length > 0) return movies;
    }

    // Specific Server Extractors
    if (detectedServer.type === 'dflix') {
      const cards = document.querySelectorAll('.movie-card, .film-item, .card, div[class*="item"], div:has(img):has(a), a:has(img)');
      cards.forEach((card) => {
        const titleEl = card.querySelector('.title, .name, h2, h3, h4, span, p') || card;
        const img = card.querySelector('img');
        const link = card.tagName === 'A' ? card : (card.querySelector('a') || card.closest('a'));
        let titleText = titleEl?.textContent?.trim() || img?.getAttribute('alt')?.trim();
        // Clean title
        if (titleText && titleText.length > 1 && titleText.length < 80 && !seenTitles.has(titleText.toLowerCase())) {
          seenTitles.add(titleText.toLowerCase());
          movies.push({
            title: titleText,
            posterUrl: img?.src || '',
            itemUrl: (link as HTMLAnchorElement)?.href || window.location.href,
            serverType: 'dflix',
            serverName: 'DFlix Live (WiFi BDIX)'
          });
        }
      });
    } else if (detectedServer.type === 'allsitehub') {
      const items = document.querySelectorAll('article, .post, .movie-item, .entry-title, a:has(img)');
      items.forEach((item) => {
        const titleEl = item.querySelector('.entry-title, .post-title, h2, h3, h4') || item;
        const img = item.querySelector('img');
        const link = item.tagName === 'A' ? item : item.querySelector('a');
        let titleText = titleEl?.textContent?.trim() || img?.getAttribute('alt')?.trim();
        if (titleText && titleText.length > 1 && titleText.length < 80 && !seenTitles.has(titleText.toLowerCase())) {
          seenTitles.add(titleText.toLowerCase());
          movies.push({
            title: titleText,
            posterUrl: img?.src || '',
            itemUrl: (link as HTMLAnchorElement)?.href || window.location.href,
            serverType: 'allsitehub',
            serverName: 'AllSiteHub'
          });
        }
      });
    } else if (detectedServer.type === 'plex') {
      const cards = document.querySelectorAll('div[data-testid*="cell-item"], div[class*="MetadataPosterCard-card-"], div[class*="PosterCard-poster-"]');
      cards.forEach((card) => {
        const titleEl = card.querySelector('span[data-testid="cell-item-title"], a[data-testid="cell-item-title"], div[class*="MetadataPosterCard-title-"], span[class*="title-"]');
        const img = card.querySelector('img');
        const link = card.querySelector('a');
        const titleText = titleEl?.textContent?.trim();
        if (titleText && !seenTitles.has(titleText.toLowerCase())) {
          seenTitles.add(titleText.toLowerCase());
          movies.push({
            title: titleText,
            posterUrl: img?.src || '',
            itemUrl: link?.href || window.location.href,
            serverType: 'plex',
            serverName: detectedServer.name
          });
        }
      });
    } else if (detectedServer.type === 'jellyfin' || detectedServer.type === 'emby') {
      const cards = document.querySelectorAll('div.card, div[class*="cardImageContainer"], div[class*="itemContainer"]');
      cards.forEach((card) => {
        const titleEl = card.querySelector('div.cardText, div[class*="cardText-first"], h3, .itemName');
        const img = card.querySelector('img') || card.querySelector('div[style*="background-image"]');
        const link = card.querySelector('a') || card.closest('a');
        const titleText = titleEl?.textContent?.trim();
        if (titleText && !seenTitles.has(titleText.toLowerCase())) {
          seenTitles.add(titleText.toLowerCase());
          let poster = '';
          if (img?.tagName === 'IMG') {
            poster = img.src;
          } else if (img) {
            const bg = (img as HTMLElement).style.backgroundImage;
            const match = bg.match(/url\(['"]?(.*?)['"]?\)/);
            if (match) poster = match[1];
          }
          movies.push({
            title: titleText,
            posterUrl: poster,
            itemUrl: link?.href || window.location.href,
            serverType: detectedServer.type,
            serverName: detectedServer.name
          });
        }
      });
    }

    // Generic Fallback Scraper: detect repeated poster card structures (aspect ratio ~2:3 or title links)
    if (movies.length === 0) {
      const candidateElements = document.querySelectorAll('a:has(img), div[class*="movie"], div[class*="poster"], div[class*="film"], div[class*="card"]:has(img)');
      candidateElements.forEach((el) => {
        const img = el.querySelector('img');
        const heading = el.querySelector('h1, h2, h3, h4, span, p, .title');
        const text = heading?.textContent?.trim() || img?.getAttribute('alt')?.trim();
        if (text && text.length > 1 && text.length < 80 && !seenTitles.has(text.toLowerCase())) {
          seenTitles.add(text.toLowerCase());
          movies.push({
            title: text,
            posterUrl: img?.src || '',
            itemUrl: (el as HTMLAnchorElement).href || window.location.href,
            serverType: 'custom',
            serverName: detectedServer.name
          });
        }
      });
    }

    return movies;
  }

  // 3. MUTATION OBSERVER FOR DYNAMIC LOADING & INFINITE SCROLL
  let scrapeTimeout: any = null;
  function triggerScrape() {
    clearTimeout(scrapeTimeout);
    scrapeTimeout = setTimeout(() => {
      const freshMovies = scrapeMoviesFromDOM();
      if (freshMovies.length > 0) {
        extractedMovies = freshMovies;
        updateOverlayUI();
        // Send to background service worker
        chrome.runtime.sendMessage({
          type: 'CINEMIND_MOVIES_EXTRACTED',
          payload: { server: detectedServer, movies: freshMovies }
        });
      }
    }, 600);
  }

  const observer = new MutationObserver(() => triggerScrape());
  observer.observe(document.body, { childList: true, subtree: true });

  // Initial trigger
  setTimeout(triggerScrape, 1000);

  // 4. FLOATING ON-PAGE OVERLAY (SHADOW DOM)
  function injectShadowOverlay() {
    if (document.getElementById('cinemind-shadow-root')) return;

    const hostDiv = document.createElement('div');
    hostDiv.id = 'cinemind-shadow-root';
    hostDiv.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:2147483647;font-family:sans-serif;';
    document.body.appendChild(hostDiv);

    const shadow = hostDiv.attachShadow({ mode: 'open' });

    // Styles for Shadow DOM
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
        background: rgba(11, 13, 20, 0.95);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(204, 255, 0, 0.3);
        border-radius: 20px;
        padding: 18px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9);
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
        font-size: 14px;
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

    const isAllSiteHub = detectedServer.type === 'allsitehub';

    container.innerHTML = `
      <div class="panel" id="cinemind-panel">
        <div class="header">
          <div>
            <div class="title">${isAllSiteHub ? 'ALLSITEHUB BDIX DIRECTORY' : 'CINEMIND SYNC'}</div>
            <div class="subtitle" id="cinemind-srv-name">${detectedServer.name}</div>
          </div>
          <span class="close-x" id="cinemind-close">✕</span>
        </div>

        <div class="count-badge">
          <div>${isAllSiteHub ? 'Indexed Servers Found:' : 'Detected on page:'} <strong id="cinemind-count" style="color:#CCFF00">0</strong> ${isAllSiteHub ? 'BDIX links' : 'movies'}</div>
          <div style="font-size:10px;color:#94A3B8;margin-top:2px;">Server Type: ${detectedServer.type.toUpperCase()}</div>
        </div>

        ${isAllSiteHub ? `
          <button class="btn btn-primary" id="cinemind-allsitehub-test-btn">⚡ Test & Sync Working BDIX Servers</button>
        ` : ''}
        <button class="btn btn-primary" id="cinemind-sync-btn">⚡ Sync with CINEMIND Site</button>
        <button class="btn btn-secondary" id="cinemind-surprise-btn">🎲 Surprise Me From Here</button>
        <button class="btn btn-secondary" id="cinemind-teach-btn">🎯 Teach Page Selector</button>
        <button class="btn btn-secondary" id="cinemind-export-btn">📥 Export Library JSON</button>

        <div class="teach-notice" id="cinemind-msg">Connected securely. Zero passwords stored.</div>
      </div>

      <button class="badge-btn" id="cinemind-toggle-btn">
        <span style="color:#CCFF00">⚔</span> CINEMIND (<span id="cinemind-mini-count">0</span>)
      </button>
    `;

    shadow.appendChild(container);

    // Wire up events inside shadow DOM
    const panel = shadow.getElementById('cinemind-panel');
    const toggleBtn = shadow.getElementById('cinemind-toggle-btn');
    const closeBtn = shadow.getElementById('cinemind-close');
    const syncBtn = shadow.getElementById('cinemind-sync-btn');
    const surpriseBtn = shadow.getElementById('cinemind-surprise-btn');
    const teachBtn = shadow.getElementById('cinemind-teach-btn');
    const exportBtn = shadow.getElementById('cinemind-export-btn');
    const allSiteHubBtn = shadow.getElementById('cinemind-allsitehub-test-btn');
    const msgEl = shadow.getElementById('cinemind-msg');

    allSiteHubBtn?.addEventListener('click', async () => {
      if (msgEl) {
        msgEl.textContent = 'Probing indexed BDIX servers on your WiFi...';
        msgEl.style.color = '#00F0FF';
      }

      // Collect links from AllSiteHub
      const links = Array.from(document.querySelectorAll('a[href]'))
        .map((a) => (a as HTMLAnchorElement).href)
        .filter((href) => href.startsWith('http://') || href.startsWith('https://'))
        .filter((href) => !href.includes('allsitehub') && !href.includes('facebook') && !href.includes('google'));

      const uniqueHosts = Array.from(new Set(links)).slice(0, 15);

      // Send to CINEMIND tab
      window.postMessage({
        type: 'CINEMIND_ALLSITEHUB_SERVERS_DISCOVERED',
        servers: uniqueHosts,
        timestamp: Date.now()
      }, '*');

      if (msgEl) {
        msgEl.textContent = `✓ Found ${uniqueHosts.length} BDIX servers! Sent to CINEMIND for connectivity testing.`;
        msgEl.style.color = '#CCFF00';
      }
    });

    toggleBtn?.addEventListener('click', () => {
      panel?.classList.toggle('open');
    });

    closeBtn?.addEventListener('click', () => {
      panel?.classList.remove('open');
    });

    syncBtn?.addEventListener('click', () => {
      // Dispatch postMessage for web app listening tabs
      window.postMessage({
        type: 'CINEMIND_MEDIA_SERVER_SYNC',
        server: detectedServer,
        movies: extractedMovies
      }, '*');

      if (msgEl) {
        msgEl.textContent = `✓ Synced ${extractedMovies.length} movies to CINEMIND!`;
        msgEl.style.color = '#CCFF00';
      }
    });

    surpriseBtn?.addEventListener('click', () => {
      if (extractedMovies.length === 0) return;
      const pick = extractedMovies[Math.floor(Math.random() * extractedMovies.length)];
      if (pick.itemUrl && pick.itemUrl !== window.location.href) {
        window.location.href = pick.itemUrl;
      } else {
        alert(`CINEMIND Recommends Tonight: "${pick.title}"!`);
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
        server: detectedServer,
        movies: extractedMovies,
        exportedAt: new Date().toISOString()
      }, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `cinemind-${detectedServer.type}-export.json`;
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

  // "Teach this page" Selector Picker Tool
  function enableSelectorPicker(shadow: ShadowRoot) {
    const clickHandler = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const target = e.target as HTMLElement;
      if (!target || target.closest('#cinemind-shadow-root')) return;

      // Infer class or tag selector
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
      triggerScrape();
    };

    document.addEventListener('click', clickHandler, true);
  }

  // Inject overlay if inside a media server
  injectShadowOverlay();

  // Listen for sync requests from the CINEMIND website tab
  window.addEventListener('message', (event) => {
    if (event.data?.type === 'CINEMIND_REQUEST_PAGE_SYNC') {
      const movies = scrapeMoviesFromDOM();
      window.postMessage({
        type: 'CINEMIND_PAGE_SYNC_RESPONSE',
        server: detectedServer,
        movies
      }, '*');
    }
  });

})();
