/**
 * CINEMIND Extension Popup Script
 * Pure Vanilla ES6+ with safe chrome.runtime.lastError handling.
 */

document.addEventListener('DOMContentLoaded', () => {
  const serverTypeEl = document.getElementById('server-type');
  const serverNameEl = document.getElementById('server-name');
  const movieCountEl = document.getElementById('movie-count');
  const statusMsgEl = document.getElementById('status-msg');

  const btnSync = document.getElementById('btn-sync');
  const btnSurprise = document.getElementById('btn-surprise');
  const btnExport = document.getElementById('btn-export');
  const btnOpenSite = document.getElementById('btn-open-site');

  let activeMovies = [];
  let currentServer = null;

  // Query background for current state
  try {
    chrome.runtime.sendMessage({ type: 'CINEMIND_GET_STATE' }, (response) => {
      if (chrome.runtime.lastError) return;

      if (response?.data) {
        const { cinemind_movies = [], cinemind_servers = [] } = response.data;
        activeMovies = Array.isArray(cinemind_movies) ? cinemind_movies : [];

        if (cinemind_servers && cinemind_servers.length > 0) {
          currentServer = cinemind_servers[cinemind_servers.length - 1];
          if (serverTypeEl) serverTypeEl.textContent = `${(currentServer.type || 'SERVER').toUpperCase()} DETECTED`;
          if (serverNameEl) serverNameEl.textContent = currentServer.name || 'Media Server';
        }

        if (movieCountEl) {
          movieCountEl.textContent = String(activeMovies.length);
        }
      }
    });
  } catch (err) {
    console.warn('[CINEMIND] Popup init error:', err);
  }

  // Query active tab to check current server
  try {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError || !tabs || !tabs[0]) return;
      const tab = tabs[0];
      if (tab?.url) {
        const url = tab.url.toLowerCase();
        if (url.includes('dflix.live') || url.includes('172.16.50.')) {
          if (serverTypeEl) serverTypeEl.textContent = 'DFLIX BDIX SERVER DETECTED';
        } else if (url.includes('allsitehub.site')) {
          if (serverTypeEl) serverTypeEl.textContent = 'ALLSITEHUB DIRECTORY DETECTED';
        } else if (url.includes('plex.tv') || url.includes(':32400')) {
          if (serverTypeEl) serverTypeEl.textContent = 'PLEX MEDIA SERVER DETECTED';
        } else if (url.includes(':8096') || url.includes('jellyfin')) {
          if (serverTypeEl) serverTypeEl.textContent = 'JELLYFIN SERVER DETECTED';
        } else if (url.includes('stremio')) {
          if (serverTypeEl) serverTypeEl.textContent = 'STREMIO WEB DETECTED';
        } else if (url.includes('imdb.com')) {
          if (serverTypeEl) serverTypeEl.textContent = 'IMDb MOVIE DIRECTORY';
        } else if (url.includes('letterboxd.com')) {
          if (serverTypeEl) serverTypeEl.textContent = 'LETTERBOXD DIRECTORY';
        }
      }
    });
  } catch (err) {
    console.warn('[CINEMIND] Query active tab error:', err);
  }

  // Sync button
  btnSync?.addEventListener('click', () => {
    if (statusMsgEl) {
      statusMsgEl.textContent = 'Broadcasting sync to open CINEMIND tabs...';
      statusMsgEl.style.color = '#CCFF00';
    }

    try {
      chrome.tabs.query({}, (tabs) => {
        if (chrome.runtime.lastError || !Array.isArray(tabs)) return;
        tabs.forEach((tab) => {
          if (tab && tab.id) {
            chrome.tabs.sendMessage(tab.id, {
              type: 'CINEMIND_EXTENSION_SYNC',
              payload: { movies: activeMovies, server: currentServer }
            }, () => {
              if (chrome.runtime.lastError) { /* ignore disconnected tab */ }
            });
          }
        });
        setTimeout(() => {
          if (statusMsgEl) {
            statusMsgEl.textContent = `✓ Synced ${activeMovies.length} movies to CINEMIND!`;
          }
        }, 400);
      });
    } catch (err) {
      console.warn('[CINEMIND] Sync click error:', err);
    }
  });

  // Surprise button
  btnSurprise?.addEventListener('click', () => {
    if (activeMovies.length === 0) {
      if (statusMsgEl) {
        statusMsgEl.textContent = 'No movies detected yet. Browse a server to sync.';
        statusMsgEl.style.color = '#00F0FF';
      }
      return;
    }
    const pick = activeMovies[Math.floor(Math.random() * activeMovies.length)];
    if (pick.itemUrl) {
      chrome.tabs.create({ url: pick.itemUrl });
    } else {
      if (statusMsgEl) {
        statusMsgEl.textContent = `Tonight's Pick: ${pick.title}!`;
        statusMsgEl.style.color = '#CCFF00';
      }
    }
  });

  // Export JSON
  btnExport?.addEventListener('click', () => {
    try {
      chrome.runtime.sendMessage({ type: 'CINEMIND_EXPORT_JSON' }, (res) => {
        if (chrome.runtime.lastError) return;
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res?.data || { movies: activeMovies }, null, 2));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = `cinemind-extension-library-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        a.remove();
      });
    } catch (err) {
      console.warn('[CINEMIND] Export error:', err);
    }
  });

  // Open site
  btnOpenSite?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000' });
  });
});
