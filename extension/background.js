/**
 * CINEMIND Manifest V3 Background Service Worker
 * Handles cross-tab media server synchronization and storage.
 */

// Initialize storage structure on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('[CINEMIND] Service worker initialized.');
  chrome.storage.local.get(['cinemind_servers', 'cinemind_movies'], (res) => {
    if (!res.cinemind_servers) {
      chrome.storage.local.set({ cinemind_servers: [], cinemind_movies: [] });
    }
  });
});

// Message listener from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CINEMIND_SERVER_DETECTED') {
    handleServerDetected(request.payload, sendResponse);
    return true; // async sendResponse
  }

  if (request.type === 'CINEMIND_MOVIES_EXTRACTED') {
    handleMoviesExtracted(request.payload, sendResponse);
    return true;
  }

  if (request.type === 'CINEMIND_GET_STATE') {
    chrome.storage.local.get(null, (data) => {
      sendResponse({ status: 'ok', data });
    });
    return true;
  }

  if (request.type === 'CINEMIND_EXPORT_JSON') {
    chrome.storage.local.get(['cinemind_movies', 'cinemind_servers'], (data) => {
      sendResponse({ status: 'ok', data });
    });
    return true;
  }
});

// Listen for external messages from the CINEMIND website
chrome.runtime.onMessageExternal?.addListener((request, sender, sendResponse) => {
  if (request.type === 'CINEMIND_PING') {
    sendResponse({ status: 'connected', version: '1.0.0' });
    return true;
  }

  if (request.type === 'CINEMIND_FETCH_SYNCED_MOVIES') {
    chrome.storage.local.get(['cinemind_movies', 'cinemind_servers'], (data) => {
      sendResponse({
        movies: data.cinemind_movies || [],
        servers: data.cinemind_servers || []
      });
    });
    return true;
  }
});

function handleServerDetected(serverInfo, callback) {
  chrome.storage.local.get(['cinemind_servers'], (res) => {
    let servers = res.cinemind_servers || [];
    const existingIndex = servers.findIndex((s) => s.id === serverInfo.id || s.url === serverInfo.url);
    if (existingIndex >= 0) {
      servers[existingIndex] = { ...servers[existingIndex], ...serverInfo, lastSeen: Date.now() };
    } else {
      servers.push({ ...serverInfo, firstSeen: Date.now(), lastSeen: Date.now() });
    }
    chrome.storage.local.set({ cinemind_servers: servers }, () => {
      callback?.({ status: 'ok', servers });
    });
  });
}

function handleMoviesExtracted({ server, movies }, callback) {
  chrome.storage.local.get(['cinemind_movies', 'cinemind_servers'], (res) => {
    let storedMovies = res.cinemind_movies || [];
    const movieMap = new Map();

    // Key existing movies
    for (const m of storedMovies) {
      const key = `${m.title.toLowerCase().trim()}-${m.year || ''}`;
      movieMap.set(key, m);
    }

    // Merge or add new movies
    for (const m of movies) {
      const key = `${m.title.toLowerCase().trim()}-${m.year || ''}`;
      if (!movieMap.has(key)) {
        movieMap.set(key, { ...m, serverType: server.type, serverName: server.name, syncedAt: Date.now() });
      } else {
        const existing = movieMap.get(key);
        movieMap.set(key, { ...existing, ...m, serverType: server.type, serverName: server.name });
      }
    }

    const updatedMovies = Array.from(movieMap.values());

    // Update server movie count
    let servers = res.cinemind_servers || [];
    const sIndex = servers.findIndex((s) => s.id === server.id || s.url === server.url);
    if (sIndex >= 0) {
      servers[sIndex].movieCount = movies.length;
      servers[sIndex].lastSyncedAt = new Date().toISOString();
    }

    chrome.storage.local.set({ cinemind_movies: updatedMovies, cinemind_servers: servers }, () => {
      // Notify all CINEMIND tabs
      broadcastSyncToWebsiteTabs(updatedMovies, servers);
      callback?.({ status: 'ok', count: updatedMovies.length });
    });
  });
}

function broadcastSyncToWebsiteTabs(movies, servers) {
  chrome.tabs.query({}, (tabs) => {
    for (const tab of tabs) {
      if (tab.id && (tab.url?.includes('localhost') || tab.url?.includes('.run.app'))) {
        chrome.tabs.sendMessage(tab.id, {
          type: 'CINEMIND_EXTENSION_SYNC',
          payload: { movies, servers },
        }).catch(() => {});
      }
    }
  });
}
