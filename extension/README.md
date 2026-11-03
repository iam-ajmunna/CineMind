# CINEMIND Companion Browser Extension (Manifest V3)

A zero-password, privacy-first companion extension that detects movies available on whatever media server you are currently browsing (Plex, Jellyfin, Emby, Stremio, Kodi, Radarr, or custom web servers) and synchronizes them with your personal **CINEMIND** suggestion site.

---

## ⚡ Quick Install (Chrome / Edge / Brave / Arc)

1. Open your browser and navigate to the Extensions manager:
   - **Chrome / Brave**: `chrome://extensions`
   - **Edge**: `edge://extensions`
2. Enable **"Developer mode"** via the toggle switch in the top-right corner.
3. Click **"Load unpacked"** (top-left).
4. Select the `extension` folder inside this project directory (`/extension`).
5. Pin the **CINEMIND** extension to your toolbar.

---

## 🚀 How It Works

### 1. Layered Detection Strategy
- **Fingerprinting**: Automatically detects:
  - **DFlix Live** (`dflix.live`, `172.16.50.*`) — Bangladeshi ISP BDIX FTP movie servers
  - **AllSiteHub** (`allsitehub.site`, `www.allsitehub.site`) — Movie & streaming directory
  - **Plex Web** (`plex.tv`, `:32400`)
  - **Jellyfin** (`:8096`)
  - **Emby** (`:8096`)
  - **Stremio Web** (`web.stremio.com`)
  - **Kodi Web** (`:8080`)
  - **Radarr** (`:7878`)
- **Zero-Password Session Scraping**: Uses your active, already-authenticated session. The extension never asks for, transmits, or stores passwords or credentials.
- **Generic DOM Scraper**: For unsupported or custom media servers, an intelligent DOM scraper observes repeated poster patterns and image metadata.
- **"Teach this page" Selector**: If a custom server uses a unique layout, click "Teach Page Selector" in the floating overlay and click any movie title once—the extension permanently learns the selector for that site.

### 2. Floating On-Page Overlay (Shadow DOM)
- Injected inside an isolated **Shadow DOM** so it never interferes with or breaks the host website's styles.
- Shows live detected movie counts, "Surprise Me From This Server", and instant "Sync to CINEMIND".

### 3. Synchronization
- Uses `chrome.runtime` cross-tab messaging + `window.postMessage` bridge.
- **Fallback**: One-click **"Export Library JSON"** from the extension popup or overlay to easily drag-and-drop into CINEMIND on any device.

---

## 🛡️ Privacy Guarantee
- 100% Client-Side. All data stays strictly on your local device.
- Zero analytics, zero remote telemetry, zero password access.
