import React, { useState, useEffect } from 'react';
import { ServerConnection, MovieItem } from '../types';
import {
  Download,
  Upload,
  Check,
  RefreshCw,
  FolderArchive,
  Layers,
  Server,
  X,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Radio,
  Zap,
  Activity,
  Wifi,
  Globe,
  Plus
} from 'lucide-react';
import { soundEffects } from '../utils/sound';
import {
  ALLSITEHUB_SERVERS_DIRECTORY,
  probeServerHealth,
  convertToConnections,
  ServerHealthResult
} from '../utils/serverChecker';

interface ExtensionBridgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  servers: ServerConnection[];
  onImportLibrary: (movies: MovieItem[], server: ServerConnection) => void;
  onLoadDemoServers: () => void;
  soundEnabled?: boolean;
}

export const ExtensionBridgeModal: React.FC<ExtensionBridgeModalProps> = ({
  isOpen,
  onClose,
  servers,
  onImportLibrary,
  onLoadDemoServers,
  soundEnabled = false,
}) => {
  const [activeTab, setActiveTab] = useState<'allsitehub' | 'servers' | 'install' | 'import'>('allsitehub');
  const [importJson, setImportJson] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isSimulatingSync, setIsSimulatingSync] = useState(false);

  // AllSiteHub Inspector State
  const [serverHealth, setServerHealth] = useState<ServerHealthResult[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [customServerUrl, setCustomServerUrl] = useState('');
  const [customServerName, setCustomServerName] = useState('');

  // Initial populate of AllSiteHub server health list
  useEffect(() => {
    if (serverHealth.length === 0) {
      setServerHealth(
        ALLSITEHUB_SERVERS_DIRECTORY.map((s) => ({
          serverId: s.id,
          name: s.name,
          url: s.url,
          status: s.id === 'srv-dflix' ? 'online' : 'checking',
          latencyMs: s.id === 'srv-dflix' ? 12 : undefined,
          ispPeering: s.ispPeering,
          category: s.category,
        }))
      );
    }
  }, []);

  const handleRunServerHealthScan = async () => {
    soundEffects.bladeSlash(soundEnabled);
    setIsScanning(true);
    setImportStatus(null);

    const updatedResults: ServerHealthResult[] = [];
    for (const serverDef of ALLSITEHUB_SERVERS_DIRECTORY) {
      const res = await probeServerHealth(serverDef, 1800);
      updatedResults.push(res);
      setServerHealth([...updatedResults]);
    }

    setIsScanning(false);
    const onlineCount = updatedResults.filter((r) => r.status === 'online').length;
    setImportStatus(`Scan complete! ${onlineCount} of ${updatedResults.length} servers are active on your WiFi connection.`);
    soundEffects.cinematicHit(soundEnabled);
  };

  const handleIntegrateWorkingServers = () => {
    soundEffects.bladeSlash(soundEnabled);
    const onlineList = serverHealth.filter((s) => s.status === 'online');
    if (onlineList.length === 0) {
      setImportStatus('No online servers found. Try scanning or adding your WiFi server IP directly.');
      return;
    }

    const { servers: newServers, movies: newMovies } = convertToConnections(onlineList);
    newServers.forEach((srv) => {
      const serverMovies = newMovies.filter((m) => m.serverName === srv.name);
      onImportLibrary(serverMovies, srv);
    });

    setImportStatus(`✓ Integrated ${newServers.length} active servers and ${newMovies.length} movies into your CINEMIND library!`);
    soundEffects.cinematicHit(soundEnabled);
  };

  if (!isOpen) return null;

  const handleSimulateSync = () => {
    soundEffects.bladeSlash(soundEnabled);
    setIsSimulatingSync(true);
    setTimeout(() => {
      onLoadDemoServers();
      setIsSimulatingSync(false);
      setImportStatus('Successfully synced 265 movies across Plex, Jellyfin, and Emby!');
      soundEffects.cinematicHit(soundEnabled);
    }, 900);
  };

  const handleImportJson = () => {
    try {
      const parsed = JSON.parse(importJson);
      const movies = Array.isArray(parsed) ? parsed : parsed.movies || [];
      if (!Array.isArray(movies) || movies.length === 0) {
        setImportStatus('Error: JSON must contain an array of movie objects.');
        return;
      }
      const newServer: ServerConnection = {
        id: `srv-custom-${Date.now()}`,
        name: parsed.serverName || 'Custom Imported Server',
        type: 'custom',
        url: parsed.serverUrl || 'http://localhost',
        movieCount: movies.length,
        lastSyncedAt: new Date().toISOString(),
        isActive: true,
      };
      onImportLibrary(movies, newServer);
      setImportStatus(`Successfully imported ${movies.length} movies!`);
      setImportJson('');
      soundEffects.cinematicHit(soundEnabled);
    } catch (err: any) {
      setImportStatus(`JSON Parse Error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl glass-panel rounded-3xl border border-white/20 shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Blade Highlight */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent" />

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-display uppercase tracking-wider text-white">
                  CINEMIND Companion Extension
                </h2>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono-code bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/30">
                  <Radio className="w-2.5 h-2.5 animate-pulse" /> Manifest V3 Ready
                </span>
              </div>
              <p className="text-xs font-mono-code text-zinc-400">
                Automatic zero-auth movie detection for Plex, Jellyfin, Emby, Stremio & Custom Servers
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-[#07070A]/80 px-6 gap-2 pt-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              setActiveTab('allsitehub');
            }}
            className={`pb-3 px-3 text-xs font-mono-code uppercase transition-all border-b-2 flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'allsitehub'
                ? 'border-[#CCFF00] text-[#CCFF00] font-bold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-[#CCFF00]" />
            AllSiteHub BDIX Inspector
          </button>
          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              setActiveTab('servers');
            }}
            className={`pb-3 px-3 text-xs font-mono-code uppercase transition-all border-b-2 flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'servers'
                ? 'border-[#CCFF00] text-[#CCFF00] font-bold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Active Servers ({servers.length})
          </button>
          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              setActiveTab('install');
            }}
            className={`pb-3 px-3 text-xs font-mono-code uppercase transition-all border-b-2 flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'install'
                ? 'border-[#CCFF00] text-[#CCFF00] font-bold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Install Extension
          </button>
          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              setActiveTab('import');
            }}
            className={`pb-3 px-3 text-xs font-mono-code uppercase transition-all border-b-2 flex items-center gap-1.5 flex-shrink-0 ${
              activeTab === 'import'
                ? 'border-[#CCFF00] text-[#CCFF00] font-bold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Manual JSON Sync
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'allsitehub' && (
            <div className="space-y-6">
              {/* Header Explainer Box */}
              <div className="p-4 rounded-2xl bg-[#0B0D14] border border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono-code text-[#00F0FF] uppercase tracking-wider mb-1">
                      <Globe className="w-3.5 h-3.5" />
                      AllSiteHub Server Directory & Health Inspector
                    </div>
                    <h3 className="text-sm font-semibold text-white">
                      Discover & Test Which BDIX Movie Servers Work on Your WiFi
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                      AllSiteHub indexes media servers across Bangladesh. Because access depends on your WiFi provider's BDIX peering routing, test each server below to see which ones are reachable right now, then integrate them with 1-click.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={handleRunServerHealthScan}
                      disabled={isScanning}
                      className="px-4 py-2.5 bg-[#CCFF00] hover:bg-[#b5e000] text-black font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                      {isScanning ? 'Testing Ping...' : 'Test All Servers'}
                    </button>
                    <button
                      onClick={handleIntegrateWorkingServers}
                      className="px-4 py-2.5 bg-[#141721] hover:bg-[#1f2433] text-[#CCFF00] border border-[#CCFF00]/40 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Integrate Working
                    </button>
                  </div>
                </div>

                {importStatus && (
                  <div className="p-3 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 text-xs font-mono-code text-[#CCFF00]">
                    {importStatus}
                  </div>
                )}
              </div>

              {/* Server Probe Results Grid */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono-code text-zinc-400 px-1">
                  <span>Indexed Servers from AllSiteHub ({serverHealth.length})</span>
                  <span className="text-[#CCFF00]">
                    {serverHealth.filter((s) => s.status === 'online').length} Responsive
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {serverHealth.map((srv) => (
                    <div
                      key={srv.serverId}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        srv.status === 'online'
                          ? 'bg-[#0B0D14] border-[#CCFF00]/40 shadow-[0_0_15px_rgba(204,255,0,0.08)]'
                          : 'bg-[#07070A] border-white/5 opacity-70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-semibold text-white">{srv.name}</h4>
                            <span className="text-[10px] font-mono-code px-1.5 py-0.2 rounded bg-white/5 text-zinc-400">
                              {srv.category}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono-code text-zinc-500 mt-0.5">
                            {srv.url}
                          </div>
                          <div className="text-[10px] text-zinc-400 mt-1">
                            {srv.ispPeering}
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="text-right flex-shrink-0">
                          {srv.status === 'online' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono-code bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/30 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
                              {srv.latencyMs ? `${srv.latencyMs}ms` : 'Online'}
                            </span>
                          ) : srv.status === 'checking' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono-code bg-white/5 text-zinc-400 border border-white/10">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                              Testing
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono-code bg-red-950/40 text-red-400 border border-red-900/40">
                              Offline on ISP
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quick direct visit button */}
                      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                        <a
                          href={srv.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-mono-code text-zinc-400 hover:text-white flex items-center gap-1"
                        >
                          Visit Server Directly <ExternalLink className="w-3 h-3" />
                        </a>
                        {srv.status === 'online' && (
                          <span className="text-[10px] font-mono-code text-[#CCFF00]">
                            ✓ Peering Active
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'install' && (
            <div className="space-y-6">
              {/* Simulation Quick-Action Card */}
              <div className="p-4 rounded-2xl bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#CCFF00]" />
                    Instant Demo Mode Available
                  </h4>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    Want to test right now? Click to simulate an active extension sync from your media servers.
                  </p>
                </div>
                <button
                  onClick={handleSimulateSync}
                  disabled={isSimulatingSync}
                  className="px-4 py-2.5 bg-[#CCFF00] hover:bg-[#b5e000] text-black font-semibold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition-all flex-shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingSync ? 'animate-spin' : ''}`} />
                  {isSimulatingSync ? 'Syncing...' : 'Simulate Extension Sync'}
                </button>
              </div>

              {/* Install Steps */}
              <div className="space-y-4">
                <h3 className="text-sm font-mono-code uppercase text-[#CCFF00] tracking-wider">
                  How to Load the Extension in Chrome / Edge / Brave
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-4 rounded-2xl bg-[#0B0D14] border border-white/5 space-y-2">
                    <div className="text-2xl font-display text-[#CCFF00]">01</div>
                    <div className="text-xs font-semibold text-white">Locate Extension Folder</div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      All extension source files are delivered in the <code className="text-[#CCFF00]">/extension</code> directory of this applet (Manifest V3, background worker, popup, and content scripts).
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0B0D14] border border-white/5 space-y-2">
                    <div className="text-2xl font-display text-[#CCFF00]">02</div>
                    <div className="text-xs font-semibold text-white">Enable Developer Mode</div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Navigate to <code className="text-[#00F0FF]">chrome://extensions</code> in your browser and toggle on <strong>"Developer mode"</strong> in the top-right corner.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#0B0D14] border border-white/5 space-y-2">
                    <div className="text-2xl font-display text-[#CCFF00]">03</div>
                    <div className="text-xs font-semibold text-white">Click "Load Unpacked"</div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Select the unpacked <code className="text-[#CCFF00]">extension</code> folder. When you visit Plex, Jellyfin, or any movie server, CINEMIND will automatically detect available films!
                    </p>
                  </div>
                </div>
              </div>

              {/* Privacy Guarantee Note */}
              <div className="p-4 rounded-2xl bg-[#07070A] border border-white/10 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#CCFF00] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-zinc-300 leading-relaxed">
                  <strong className="text-white">Strict Privacy Architecture:</strong> The extension NEVER asks for or stores passwords. It queries already-authenticated local session endpoints (like Plex Web or Jellyfin Web) inside your browser. All data remains stored exclusively on your device.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'servers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-code uppercase text-zinc-400">
                  Detected Media Servers
                </span>
                <button
                  onClick={handleSimulateSync}
                  className="text-xs font-mono-code text-[#CCFF00] hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Rescan Now
                </button>
              </div>

              <div className="space-y-3">
                {servers.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-4 rounded-2xl bg-[#0B0D14] border border-white/10 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white/5 text-[#CCFF00]">
                        <Server className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white">{srv.name}</h4>
                          <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 rounded bg-white/5 text-[#00F0FF]">
                            {srv.type}
                          </span>
                        </div>
                        <div className="text-xs font-mono-code text-zinc-500 mt-0.5">
                          {srv.url} • {srv.movieCount} movies synced
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono-code text-[#CCFF00] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
                        Connected
                      </span>
                      <div className="text-[10px] font-mono-code text-zinc-500 mt-1">
                        {new Date(srv.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-300">
                If browser extension direct sync is blocked or if you are running on an isolated environment, you can export your library as JSON from the extension popup and paste it below:
              </p>

              <textarea
                rows={6}
                placeholder='Paste library JSON: [{"title": "Inception", "year": 2010, "serverType": "plex"}, ...]'
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                className="w-full bg-[#07070A] border border-white/15 rounded-xl p-3 text-xs font-mono-code text-white placeholder-zinc-600 focus:outline-none focus:border-[#CCFF00]"
              />

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleImportJson}
                  className="px-5 py-2.5 bg-[#CCFF00] hover:bg-[#b5e000] text-black font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Import JSON Payload
                </button>
              </div>

              {importStatus && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono-code text-[#CCFF00]">
                  {importStatus}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
