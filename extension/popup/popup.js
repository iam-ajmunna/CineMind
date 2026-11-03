/**
 * CINEMIND Extension Popup Script
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
  chrome.runtime.sendMessage({ type: 'CINEMIND_GET_STATE' }, (response) => {
    if (response?.data) {
      const { cinemind_movies = [], cinemind_servers = [] } = response.data;
      activeMovies = cinemind_movies;

      if (cinemind_servers.length > 0) {
        currentServer = cinemind_servers[cinemind_servers.length - 1];
        if (serverTypeEl) serverTypeEl.textContent = `${currentServer.type.toUpperCase()} DETECTED`;
        if (serverNameEl) serverNameEl.textContent = currentServer.name;
      }

      if (movieCountEl) {
        movieCountEl.textContent = String(activeMovies.length);
      }
    }
  });

  // Query active tab to check if user is on a media server right now
  chrome.tabs?.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (tab?.url) {
      const url = tab.url.toLowerCase();
      if (url.includes('plex.tv') || url.includes(':32400')) {
        if (serverTypeEl) serverTypeEl.textContent = 'PLEX MEDIA SERVER DETECTED';
      } else if (url.includes(':8096') || url.includes('jellyfin')) {
        if (serverTypeEl) serverTypeEl.textContent = 'JELLYFIN SERVER DETECTED';
      } else if (url.includes('stremio')) {
        if (serverTypeEl) serverTypeEl.textContent = 'STREMIO WEB DETECTED';
      }
    }
  });

  // Sync button
  btnSync?.addEventListener('click', () => {
    if (statusMsgEl) {
      statusMsgEl.textContent = 'Broadcasting sync to open CINEMIND tabs...';
      statusMsgEl.style.color = '#CCFF00';
    }

    // Ping all tabs
    chrome.tabs?.query({}, (tabs) => {
      let notified = 0;
      tabs.forEach((tab) => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, {
            type: 'CINEMIND_EXTENSION_SYNC',
            payload: { movies: activeMovies, server: currentServer }
          }).catch(() => {});
          notified++;
        }
      });
      setTimeout(() => {
        if (statusMsgEl) {
          statusMsgEl.textContent = `✓ Synced ${activeMovies.length} movies to CINEMIND!`;
        }
      }, 500);
    });
  });

  // Surprise button
  btnSurprise?.addEventListener('click', () => {
    if (activeMovies.length === 0) {
      alert('No movies detected yet. Browse your Plex, Jellyfin, or media server tab to sync.');
      return;
    }
    const pick = activeMovies[Math.floor(Math.random() * activeMovies.length)];
    if (pick.itemUrl) {
      chrome.tabs.create({ url: pick.itemUrl });
    } else {
      alert(`Tonight's Pick: ${pick.title} (${pick.year || 'Cinema'})!`);
    }
  });

  // Export JSON
  btnExport?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'CINEMIND_EXPORT_JSON' }, (res) => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res?.data || { movies: activeMovies }, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `cinemind-extension-library-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      a.remove();
    });
  });

  // Open site
  btnOpenSite?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'http://localhost:3000' });
  });
});
