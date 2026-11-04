/**
 * CINEMIND Manifest V3 Background Service Worker
 * Robust cross-tab media server synchronization and storage.
 * Designed to eliminate all "Unchecked runtime.lastError" and "Message channel closed" errors.
 */

// Initialize storage structure on install
chrome.runtime.onInstalled.addListener(() => {
  try {
    chrome.storage.local.get(['cinemind_servers', 'cinemind_movies'], (res) => {
      if (chrome.runtime.lastError) return;
      const updates = {};
      if (!Array.isArray(res?.cinemind_servers)) updates.cinemind_servers = [];
      if (!Array.isArray(res?.cinemind_movies)) updates.cinemind_movies = [];
      if (Object.keys(updates).length > 0) {
        chrome.storage.local.set(updates, () => {
          if (chrome.runtime.lastError) { /* ignore */ }
        });
      }
    });
  } catch (err) {
    // Ignore init error
  }
});

// Helper for safe responses in MV3
function createSafeResponder(sendResponse) {
  let responded = false;
  return (data) => {
    if (responded) return;
    responded = true;
    try {
      sendResponse(data);
    } catch (e) {
      // Message port was already closed by caller
    }
  };
}

// Message listener from content script or popup
chrome.runtime.onMessage.addListener((request, sender, rawSendResponse) => {
  if (!request || typeof request !== 'object') {
    rawSendResponse({ status: 'ignored' });
    return false;
  }

  const sendResponse = createSafeResponder(rawSendResponse);

  try {
    if (request.type === 'CINEMIND_SERVER_DETECTED') {
      handleServerDetected(request.payload, sendResponse);
      return true; // async response
    }

    if (request.type === 'CINEMIND_MOVIES_EXTRACTED') {
      handleMoviesExtracted(request.payload, sendResponse);
      return true; // async response
    }

    if (request.type === 'CINEMIND_GET_STATE') {
      chrome.storage.local.get(['cinemind_movies', 'cinemind_servers'], (data) => {
        if (chrome.runtime.lastError) {
          sendResponse({ status: 'error', data: { cinemind_movies: [], cinemind_servers: [] } });
          return;
        }
        sendResponse({
          status: 'ok',
          data: {
            cinemind_movies: Array.isArray(data?.cinemind_movies) ? data.cinemind_movies : [],
            cinemind_servers: Array.isArray(data?.cinemind_servers) ? data.cinemind_servers : []
          }
        });
      });
      return true; // async response
    }

    if (request.type === 'CINEMIND_CHECK_MOVIE_AVAILABILITY') {
      const queryTitle = String(request.payload?.title || '').toLowerCase().trim();
      const queryYear = Number(request.payload?.year) || 0;

      chrome.storage.local.get(['cinemind_movies'], (data) => {
        if (chrome.runtime.lastError) {
          sendResponse({ available: false, movie: null });
          return;
        }
        const movies = Array.isArray(data?.cinemind_movies) ? data.cinemind_movies : [];
        const match = movies.find((m) => {
          if (!m || !m.title) return false;
          const cleanMTitle = String(m.title).toLowerCase().trim();
          if (cleanMTitle === queryTitle) return true;
          if (queryTitle.length > 4 && (cleanMTitle.includes(queryTitle) || queryTitle.includes(cleanMTitle))) {
            return true;
          }
          return false;
        });

        sendResponse({
          available: !!match,
          movie: match || null
        });
      });
      return true; // async response
    }

    if (request.type === 'CINEMIND_EXPORT_JSON') {
      chrome.storage.local.get(['cinemind_movies', 'cinemind_servers'], (data) => {
        if (chrome.runtime.lastError) {
          sendResponse({ status: 'error' });
          return;
        }
        sendResponse({ status: 'ok', data });
      });
      return true; // async response
    }

    sendResponse({ status: 'unhandled' });
    return false;
  } catch (err) {
    sendResponse({ status: 'error', message: String(err) });
    return false;
  }
});

function handleServerDetected(serverInfo, callback) {
  if (!serverInfo || typeof serverInfo !== 'object') {
    callback({ status: 'error', message: 'Invalid serverInfo' });
    return;
  }

  chrome.storage.local.get(['cinemind_servers'], (res) => {
    if (chrome.runtime.lastError) {
      callback({ status: 'error' });
      return;
    }

    let servers = Array.isArray(res?.cinemind_servers) ? [...res.cinemind_servers] : [];
    const targetId = serverInfo.id || serverInfo.url || 'custom';
    const existingIndex = servers.findIndex((s) => s && (s.id === targetId || (s.url && s.url === serverInfo.url)));

    if (existingIndex >= 0) {
      servers[existingIndex] = {
        ...servers[existingIndex],
        ...serverInfo,
        lastSeen: Date.now()
      };
    } else {
      servers.push({
        id: targetId,
        name: serverInfo.name || 'Web Media Server',
        type: serverInfo.type || 'custom',
        url: serverInfo.url || '',
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        movieCount: 0
      });
    }

    chrome.storage.local.set({ cinemind_servers: servers }, () => {
      if (chrome.runtime.lastError) {
        callback({ status: 'error' });
        return;
      }
      callback({ status: 'ok', servers });
    });
  });
}

function handleMoviesExtracted(payload, callback) {
  if (!payload || typeof payload !== 'object') {
    callback({ status: 'error', message: 'Invalid payload' });
    return;
  }

  const server = payload.server || { type: 'custom', name: 'Media Server', url: '' };
  const incomingMovies = Array.isArray(payload.movies) ? payload.movies : [];

  chrome.storage.local.get(['cinemind_movies', 'cinemind_servers'], (res) => {
    if (chrome.runtime.lastError) {
      callback({ status: 'error' });
      return;
    }

    let storedMovies = Array.isArray(res?.cinemind_movies) ? res.cinemind_movies : [];
    const movieMap = new Map();

    for (const m of storedMovies) {
      if (!m || !m.title) continue;
      const key = `${String(m.title).toLowerCase().trim()}-${m.year || ''}`;
      movieMap.set(key, m);
    }

    for (const m of incomingMovies) {
      if (!m || !m.title) continue;
      const key = `${String(m.title).toLowerCase().trim()}-${m.year || ''}`;
      const existing = movieMap.get(key);

      if (!existing) {
        movieMap.set(key, {
          title: String(m.title).trim(),
          year: Number(m.year) || null,
          posterUrl: m.posterUrl || '',
          itemUrl: m.itemUrl || '',
          serverType: server.type || 'custom',
          serverName: server.name || 'Media Server',
          syncedAt: Date.now()
        });
      } else {
        movieMap.set(key, {
          ...existing,
          ...m,
          serverType: server.type || existing.serverType || 'custom',
          serverName: server.name || existing.serverName || 'Media Server'
        });
      }
    }

    const updatedMovies = Array.from(movieMap.values());

    let servers = Array.isArray(res?.cinemind_servers) ? [...res.cinemind_servers] : [];
    const targetId = server.id || server.url || 'custom';
    const sIndex = servers.findIndex((s) => s && (s.id === targetId || (s.url && s.url === server.url)));

    if (sIndex >= 0) {
      servers[sIndex] = {
        ...servers[sIndex],
        movieCount: updatedMovies.filter((m) => m.serverType === server.type).length || incomingMovies.length,
        lastSyncedAt: new Date().toISOString()
      };
    } else {
      servers.push({
        id: targetId,
        name: server.name || 'Media Server',
        type: server.type || 'custom',
        url: server.url || '',
        movieCount: incomingMovies.length,
        lastSyncedAt: new Date().toISOString()
      });
    }

    chrome.storage.local.set({ cinemind_movies: updatedMovies, cinemind_servers: servers }, () => {
      if (chrome.runtime.lastError) {
        callback({ status: 'error' });
        return;
      }
      broadcastSyncToWebsiteTabs(updatedMovies, servers);
      callback({ status: 'ok', count: updatedMovies.length });
    });
  });
}

function broadcastSyncToWebsiteTabs(movies, servers) {
  try {
    chrome.tabs.query({}, (tabs) => {
      if (chrome.runtime.lastError || !Array.isArray(tabs)) return;

      for (const tab of tabs) {
        if (!tab || !tab.id || !tab.url) continue;
        const tabUrl = tab.url.toLowerCase();

        // Only send to valid web HTTP/HTTPS pages running CINEMIND
        if (
          (tabUrl.startsWith('http://') || tabUrl.startsWith('https://')) &&
          (tabUrl.includes('localhost') || tabUrl.includes('127.0.0.1') || tabUrl.includes('.run.app'))
        ) {
          try {
            chrome.tabs.sendMessage(
              tab.id,
              {
                type: 'CINEMIND_EXTENSION_SYNC',
                payload: { movies, servers }
              },
              () => {
                if (chrome.runtime.lastError) {
                  // Tab not ready or closed, harmless
                }
              }
            );
          } catch (e) {
            // Harmless
          }
        }
      }
    });
  } catch (err) {
    // Ignore broadcast errors
  }
}
