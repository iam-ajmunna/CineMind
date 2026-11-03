/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  MovieItem,
  TasteProfile,
  ServerConnection,
  AppSettings,
  WatchStatus
} from './types';
import {
  AppStorage,
  DEFAULT_TASTE,
  INITIAL_MOVIES,
  INITIAL_GAPS,
  INITIAL_SERVERS
} from './utils/db';
import { rankMoviesByTaste } from './utils/matching';
import { soundEffects } from './utils/sound';

import { Header } from './components/Header';
import { HeroThreeCanvas } from './components/HeroThreeCanvas';
import { TonightHero } from './components/TonightHero';
import { TasteRadar } from './components/TasteRadar';
import { MyLibrary } from './components/MyLibrary';
import { GapsView } from './components/GapsView';
import { WatchHistory } from './components/WatchHistory';

import { MovieDetailModal } from './components/MovieDetailModal';
import { NaturalSearchModal } from './components/NaturalSearchModal';
import { ExtensionBridgeModal } from './components/ExtensionBridgeModal';
import { SettingsModal } from './components/SettingsModal';
import { ShortcutsModal } from './components/ShortcutsModal';

import {
  Sparkles,
  Server,
  Play,
  ArrowRight,
  Shield,
  Layers,
  Compass,
  Film
} from 'lucide-react';

export default function App() {
  // Application State
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [gaps, setGaps] = useState<MovieItem[]>([]);
  const [taste, setTaste] = useState<TasteProfile>(DEFAULT_TASTE);
  const [servers, setServers] = useState<ServerConnection[]>(INITIAL_SERVERS);
  const [settings, setSettings] = useState<AppSettings>(AppStorage.getSettings());

  // UI Navigation & Modals
  const [currentTab, setCurrentTab] = useState<'tonight' | 'library' | 'gaps' | 'taste' | 'history'>('tonight');
  const [showHeroIntro, setShowHeroIntro] = useState<boolean>(true);
  const [selectedMovie, setSelectedMovie] = useState<MovieItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isExtensionOpen, setIsExtensionOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);

  // Initialize data from local storage
  useEffect(() => {
    const loadedTaste = AppStorage.getTaste();
    const loadedSettings = AppStorage.getSettings();
    const loadedServers = AppStorage.getServers();
    const loadedMovies = AppStorage.getMovies();
    const loadedGaps = AppStorage.getGaps();

    setTaste(loadedTaste);
    setSettings(loadedSettings);
    setServers(loadedServers);
    setMovies(rankMoviesByTaste(loadedMovies, loadedTaste));
    setGaps(rankMoviesByTaste(loadedGaps, loadedTaste));
  }, []);

  // Listen for live messages from the browser extension via window.postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CINEMIND_ALLSITEHUB_SERVERS_DISCOVERED') {
        soundEffects.cinematicHit(settings.soundEnabled);
        setIsExtensionOpen(true);
        return;
      }

      if (event.data?.type === 'CINEMIND_MEDIA_SERVER_SYNC' || event.data?.type === 'CINEMIND_PAGE_SYNC_RESPONSE') {
        const { server, movies: incomingMovies } = event.data;
        if (!incomingMovies || !Array.isArray(incomingMovies)) return;

        soundEffects.cinematicHit(settings.soundEnabled);

        // Merge incoming server movies
        setMovies((prevMovies) => {
          const movieMap = new Map<string, MovieItem>();
          prevMovies.forEach((m) => movieMap.set(`${m.title.toLowerCase()}-${m.year}`, m));

          incomingMovies.forEach((raw: any) => {
            const key = `${raw.title.toLowerCase()}-${raw.year || 2024}`;
            if (!movieMap.has(key)) {
              movieMap.set(key, {
                id: `ext-${raw.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${raw.year || 'item'}`,
                title: raw.title,
                year: raw.year || 2024,
                overview: raw.overview || `Detected on ${server?.name || 'media server'}.`,
                posterUrl: raw.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
                serverType: server?.type || 'custom',
                serverName: server?.name || 'Media Server',
                itemUrl: raw.itemUrl,
                streamUrl: raw.itemUrl,
                addedAt: new Date().toISOString(),
                genres: raw.genres || ['Cinema'],
                directors: raw.directors || [],
                cast: raw.cast || [],
                runtime: raw.runtime || 110,
                rating: raw.rating || 7.5,
                status: 'unseen',
                matchScore: 85,
              });
            }
          });

          const updated = Array.from(movieMap.values());
          const reRanked = rankMoviesByTaste(updated, taste);
          AppStorage.saveMovies(reRanked);
          return reRanked;
        });

        // Add or update server
        if (server) {
          setServers((prevServers) => {
            const srvMap = new Map<string, ServerConnection>();
            prevServers.forEach((s) => srvMap.set(s.id, s));
            const srvId = server.id || `srv-${server.type}-${server.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
            srvMap.set(srvId, {
              id: srvId,
              name: server.name || 'Web Media Server',
              type: server.type || 'custom',
              url: server.url || window.location.origin,
              movieCount: incomingMovies.length,
              lastSyncedAt: new Date().toISOString(),
              isActive: true,
            });
            const updatedServers = Array.from(srvMap.values());
            AppStorage.saveServers(updatedServers);
            return updatedServers;
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [taste, settings.soundEnabled]);

  // Handle Taste Profile Changes (re-ranks all movies live)
  const handleTasteChange = (newTaste: TasteProfile) => {
    setTaste(newTaste);
    AppStorage.saveTaste(newTaste);
    setMovies((prev) => {
      const reRanked = rankMoviesByTaste(prev, newTaste);
      AppStorage.saveMovies(reRanked);
      return reRanked;
    });
    setGaps((prev) => {
      const reRankedGaps = rankMoviesByTaste(prev, newTaste);
      AppStorage.saveGaps(reRankedGaps);
      return reRankedGaps;
    });
  };

  // Movie Status Updates (Seen, Saved, Not Interested)
  const handleUpdateStatus = (movieId: string, status: WatchStatus) => {
    setMovies((prev) => {
      const updated = prev.map((m) => (m.id === movieId ? { ...m, status } : m));
      AppStorage.saveMovies(updated);
      return updated;
    });
    if (selectedMovie?.id === movieId) {
      setSelectedMovie((prev) => (prev ? { ...prev, status } : null));
    }
  };

  // Movie Rating Updates
  const handleUpdateRating = (movieId: string, rating: number) => {
    setMovies((prev) => {
      const updated = prev.map((m) =>
        m.id === movieId ? { ...m, userRating: rating, status: 'seen' as WatchStatus } : m
      );
      AppStorage.saveMovies(updated);
      return updated;
    });
    if (selectedMovie?.id === movieId) {
      setSelectedMovie((prev) => (prev ? { ...prev, userRating: rating, status: 'seen' } : null));
    }
  };

  // Add Movie to Library (e.g. from Gaps or AI search)
  const handleAddToLibrary = (movie: MovieItem) => {
    soundEffects.cinematicHit(settings.soundEnabled);
    setMovies((prev) => {
      const exists = prev.some((m) => m.title.toLowerCase() === movie.title.toLowerCase());
      if (exists) return prev;
      const updated = [movie, ...prev];
      const reRanked = rankMoviesByTaste(updated, taste);
      AppStorage.saveMovies(reRanked);
      return reRanked;
    });
    // Remove from gaps
    setGaps((prev) => {
      const updated = prev.filter((g) => g.title.toLowerCase() !== movie.title.toLowerCase());
      AppStorage.saveGaps(updated);
      return updated;
    });
  };

  // Dismiss a Gap
  const handleDismissGap = (movieId: string) => {
    setGaps((prev) => {
      const updated = prev.filter((g) => g.id !== movieId);
      AppStorage.saveGaps(updated);
      return updated;
    });
  };

  // Load Demo Media Servers (Plex, Jellyfin, Emby, Stremio)
  const handleLoadDemoServers = () => {
    setServers(INITIAL_SERVERS);
    AppStorage.saveServers(INITIAL_SERVERS);
    const reRanked = rankMoviesByTaste(INITIAL_MOVIES, taste);
    setMovies(reRanked);
    AppStorage.saveMovies(reRanked);
    const reRankedGaps = rankMoviesByTaste(INITIAL_GAPS, taste);
    setGaps(reRankedGaps);
    AppStorage.saveGaps(reRankedGaps);
  };

  // Reset Everything to clean state
  const handleResetAll = () => {
    AppStorage.resetAll();
    setTaste(DEFAULT_TASTE);
    setServers(INITIAL_SERVERS);
    const reRanked = rankMoviesByTaste(INITIAL_MOVIES, DEFAULT_TASTE);
    setMovies(reRanked);
    const reRankedGaps = rankMoviesByTaste(INITIAL_GAPS, DEFAULT_TASTE);
    setGaps(reRankedGaps);
  };

  // Restore All Data from JSON backup
  const handleRestoreAll = (data: any) => {
    if (data.taste) {
      setTaste(data.taste);
      AppStorage.saveTaste(data.taste);
    }
    if (data.servers) {
      setServers(data.servers);
      AppStorage.saveServers(data.servers);
    }
    if (data.movies) {
      const reRanked = rankMoviesByTaste(data.movies, data.taste || taste);
      setMovies(reRanked);
      AppStorage.saveMovies(reRanked);
    }
    if (data.gaps) {
      setGaps(data.gaps);
      AppStorage.saveGaps(data.gaps);
    }
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs/textareas
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName) ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      if (e.key === '/') {
        e.preventDefault();
        soundEffects.whoosh(settings.soundEnabled);
        setIsSearchOpen(true);
      } else if (e.key.toLowerCase() === 't') {
        setCurrentTab('tonight');
      } else if (e.key.toLowerCase() === 'l') {
        setCurrentTab('library');
      } else if (e.key.toLowerCase() === 'g') {
        setCurrentTab('gaps');
      } else if (e.key.toLowerCase() === 'p') {
        setCurrentTab('taste');
      } else if (e.key.toLowerCase() === 'h') {
        setCurrentTab('history');
      } else if (e.key.toLowerCase() === 'm') {
        setSettings((prev) => {
          const next = { ...prev, soundEnabled: !prev.soundEnabled };
          AppStorage.saveSettings(next);
          soundEffects.click(next.soundEnabled);
          return next;
        });
      } else if (e.key === 'Escape') {
        setSelectedMovie(null);
        setIsSearchOpen(false);
        setIsExtensionOpen(false);
        setIsSettingsOpen(false);
        setIsShortcutsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.soundEnabled]);

  return (
    <div className="min-h-screen bg-[#07070A] text-[#E2E8F0] relative overflow-x-hidden selection:bg-[#CCFF00] selection:text-black">
      {/* Three.js / WebGL Cinematic Background */}
      <HeroThreeCanvas reducedMotion={settings.reducedMotion} />

      {/* Global Film Grain & Scanline Overlays */}
      <div className="fixed inset-0 pointer-events-none film-grain z-10 opacity-70" aria-hidden="true" />
      <div className="fixed inset-0 pointer-events-none scanlines z-10 opacity-40" aria-hidden="true" />

      {/* Header Bar */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setShowHeroIntro(false);
        }}
        libraryCount={movies.length}
        gapsCount={gaps.length}
        serverCount={servers.length}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => {
          const next = { ...settings, soundEnabled: !settings.soundEnabled };
          setSettings(next);
          AppStorage.saveSettings(next);
          soundEffects.click(next.soundEnabled);
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenExtension={() => setIsExtensionOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Main Page Content Body */}
      <main className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Full-Screen Landing Hero Poster Wall Reveal Banner (Dismissible on click) */}
        {showHeroIntro && currentTab === 'tonight' && (
          <div className="relative mb-10 p-8 sm:p-12 rounded-3xl glass-panel border border-white/15 overflow-hidden blade-edge">
            {/* Ambient Katana Gradient */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#CCFF00]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#FF007F]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-3xl space-y-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono-code uppercase bg-[#141721] text-[#CCFF00] border border-[#CCFF00]/40">
                <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
                Katana Cinema Discovery Intelligence
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-display uppercase tracking-tight text-white leading-none">
                WHAT TO WATCH TONIGHT FROM <span className="text-[#CCFF00]">YOUR OWN</span> SERVERS.
              </h1>

              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl font-light">
                CINEMIND continuously scans your active Plex, Jellyfin, Emby, and Stremio servers. It calculates an explainable <strong className="text-white">Match %</strong> against your personal cinematic taste constellation, surfacing the definitive film to screen right now.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={() => {
                    soundEffects.bladeSlash(settings.soundEnabled);
                    setShowHeroIntro(false);
                  }}
                  className="px-6 py-3.5 rounded-xl bg-[#CCFF00] hover:bg-[#b5e000] text-black font-syne font-extrabold text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(204,255,0,0.4)] flex items-center gap-2 cursor-pointer clip-blade-sm transition-all"
                >
                  <Play className="w-4 h-4 fill-black" />
                  Explore Tonight's Pick
                </button>

                <button
                  onClick={() => {
                    soundEffects.click(settings.soundEnabled);
                    setIsExtensionOpen(true);
                  }}
                  className="px-5 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono-code text-xs uppercase tracking-wider border border-white/15 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Server className="w-3.5 h-3.5 text-[#00F0FF]" />
                  Sync Media Server Extension
                </button>

                <button
                  onClick={() => {
                    soundEffects.whoosh(settings.soundEnabled);
                    setIsSearchOpen(true);
                  }}
                  className="px-4 py-3.5 text-xs font-mono-code text-[#00F0FF] hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Natural Query Search
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 1. TONIGHT SUGGESTION ENGINE */}
        {currentTab === 'tonight' && (
          <TonightHero
            movies={movies}
            onSelectMovie={(movie) => setSelectedMovie(movie)}
            onUpdateStatus={handleUpdateStatus}
            soundEnabled={settings.soundEnabled}
          />
        )}

        {/* 2. MY LIBRARY */}
        {currentTab === 'library' && (
          <MyLibrary
            movies={movies}
            onSelectMovie={(movie) => setSelectedMovie(movie)}
            onUpdateStatus={handleUpdateStatus}
            onOpenExtensionModal={() => setIsExtensionOpen(true)}
            soundEnabled={settings.soundEnabled}
          />
        )}

        {/* 3. GAPS (MISSING HIGH-MATCH MASTERPIECES) */}
        {currentTab === 'gaps' && (
          <GapsView
            gaps={gaps}
            onSelectMovie={(movie) => setSelectedMovie(movie)}
            onAddToLibrary={handleAddToLibrary}
            onDismissGap={handleDismissGap}
            soundEnabled={settings.soundEnabled}
          />
        )}

        {/* 4. TASTE CONSTELLATION RADAR */}
        {currentTab === 'taste' && (
          <TasteRadar
            taste={taste}
            onChange={handleTasteChange}
            soundEnabled={settings.soundEnabled}
          />
        )}

        {/* 5. WATCH HISTORY & RATINGS */}
        {currentTab === 'history' && (
          <WatchHistory
            movies={movies}
            onSelectMovie={(movie) => setSelectedMovie(movie)}
            onUpdateRating={handleUpdateRating}
            onUpdateStatus={handleUpdateStatus}
            soundEnabled={settings.soundEnabled}
          />
        )}
      </main>

      {/* Floating Tactical Shortcuts Hint at Bottom Right */}
      <div className="fixed bottom-5 right-5 z-30 hidden sm:flex items-center gap-2">
        <button
          onClick={() => {
            soundEffects.click(settings.soundEnabled);
            setIsShortcutsOpen(true);
          }}
          className="px-3 py-1.5 rounded-full bg-[#07070A]/90 hover:bg-[#141721] text-zinc-400 hover:text-[#CCFF00] border border-white/10 text-xs font-mono-code flex items-center gap-1.5 shadow-xl backdrop-blur-md transition-all cursor-pointer"
        >
          <span>Shortcuts</span>
          <kbd className="px-1 py-0.5 rounded bg-white/10 text-[10px] text-zinc-300">?</kbd>
        </button>
      </div>

      {/* Modals */}
      <MovieDetailModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
        onUpdateStatus={handleUpdateStatus}
        onUpdateRating={handleUpdateRating}
        soundEnabled={settings.soundEnabled}
      />

      <NaturalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        libraryMovies={movies}
        taste={taste}
        onSelectMovie={(movie) => setSelectedMovie(movie)}
        onAddToLibrary={handleAddToLibrary}
        soundEnabled={settings.soundEnabled}
      />

      <ExtensionBridgeModal
        isOpen={isExtensionOpen}
        onClose={() => setIsExtensionOpen(false)}
        servers={servers}
        onImportLibrary={(newMovies, server) => {
          setMovies((prev) => {
            const reRanked = rankMoviesByTaste([...newMovies, ...prev], taste);
            AppStorage.saveMovies(reRanked);
            return reRanked;
          });
          setServers((prev) => {
            const updated = [server, ...prev.filter((s) => s.id !== server.id)];
            AppStorage.saveServers(updated);
            return updated;
          });
        }}
        onLoadDemoServers={handleLoadDemoServers}
        soundEnabled={settings.soundEnabled}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
          AppStorage.saveSettings(newSettings);
        }}
        allData={{
          movies,
          taste,
          servers,
          settings,
        }}
        onResetAll={handleResetAll}
        onRestoreAll={handleRestoreAll}
        soundEnabled={settings.soundEnabled}
      />

      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        soundEnabled={settings.soundEnabled}
      />
    </div>
  );
}
