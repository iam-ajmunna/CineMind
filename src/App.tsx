/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  MovieItem,
  TasteProfile,
  ServerConnection,
  AppSettings,
  WatchStatus,
  NotificationItem,
} from './types';
import {
  AppStorage,
  DEFAULT_TASTE,
  INITIAL_MOVIES,
  INITIAL_GAPS,
  INITIAL_SERVERS,
  INITIAL_NOTIFICATIONS,
} from './utils/db';
import { rankMoviesByTaste } from './utils/matching';
import { soundEffects } from './utils/sound';

import { Header, NavTab } from './components/Header';
import { BillboardHero } from './components/BillboardHero';
import { MovieCarouselRow } from './components/MovieCarouselRow';
import { IndianCinemaHub } from './components/IndianCinemaHub';
import { UpcomingView } from './components/UpcomingView';
import { DividedLibraryView } from './components/DividedLibraryView';
import { MyListView } from './components/MyListView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';

import { MovieDetailModal } from './components/MovieDetailModal';
import { TrailerModal } from './components/TrailerModal';
import { TasteOnboardingModal } from './components/TasteOnboardingModal';
import { TasteRadar } from './components/TasteRadar';
import { NaturalSearchModal } from './components/NaturalSearchModal';
import { ExtensionBridgeModal } from './components/ExtensionBridgeModal';
import { SettingsModal } from './components/SettingsModal';
import { ShortcutsModal } from './components/ShortcutsModal';

export default function App() {
  // Application State
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [taste, setTaste] = useState<TasteProfile>(DEFAULT_TASTE);
  const [servers, setServers] = useState<ServerConnection[]>(INITIAL_SERVERS);
  const [settings, setSettings] = useState<AppSettings>(AppStorage.getSettings());
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Watchlist & History Tracking Sets
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [remindedIds, setRemindedIds] = useState<Set<string>>(new Set());

  // UI Navigation & Modals
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [selectedMovie, setSelectedMovie] = useState<MovieItem | null>(null);
  const [trailerMovie, setTrailerMovie] = useState<MovieItem | null>(null);

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isExtensionOpen, setIsExtensionOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isTasteRadarOpen, setIsTasteRadarOpen] = useState<boolean>(false);

  // Billboard Hero Selection
  const [heroIndex, setHeroIndex] = useState<number>(0);

  // Initialize data from local storage
  useEffect(() => {
    const loadedTaste = AppStorage.getTaste();
    const loadedSettings = AppStorage.getSettings();
    const loadedServers = AppStorage.getServers();
    const loadedMovies = AppStorage.getMovies();
    const loadedNotifs = AppStorage.getNotifications();

    setTaste(loadedTaste);
    setSettings(loadedSettings);
    setServers(loadedServers);
    setNotifications(loadedNotifs);

    const reRanked = rankMoviesByTaste(loadedMovies, loadedTaste);
    setMovies(reRanked);

    // Populate initial state sets
    const sIds = new Set<string>();
    const wIds = new Set<string>();
    const rIds = new Set<string>();

    reRanked.forEach((m) => {
      if (m.status === 'saved') sIds.add(m.id);
      if (m.status === 'seen') wIds.add(m.id);
      if (m.reminded) rIds.add(m.id);
    });

    setSavedIds(sIds);
    setWatchedIds(wIds);
    setRemindedIds(rIds);

    // Trigger onboarding on first visit if not completed
    if (!AppStorage.isOnboarded()) {
      setIsOnboardingOpen(true);
    }
  }, []);

  // Listen for live messages from the browser extension via window.postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CINEMIND_ALLSITEHUB_SERVERS_DISCOVERED') {
        soundEffects.cinematicHit(settings.soundEnabled);
        setIsExtensionOpen(true);
        return;
      }

      if (
        event.data?.type === 'CINEMIND_MEDIA_SERVER_SYNC' ||
        event.data?.type === 'CINEMIND_PAGE_SYNC_RESPONSE'
      ) {
        const { server, movies: incomingMovies } = event.data;
        if (!incomingMovies || !Array.isArray(incomingMovies)) return;

        soundEffects.cinematicHit(settings.soundEnabled);

        // Merge incoming server movies
        setMovies((prevMovies) => {
          const movieMap = new Map<string, MovieItem>();
          prevMovies.forEach((m) => movieMap.set(`${m.title.toLowerCase()}-${m.year || 2024}`, m));

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
                genres: raw.genres || ['Action', 'Cinema'],
                directors: raw.directors || [],
                cast: raw.cast || [],
                runtime: raw.runtime || 120,
                rating: raw.rating || 7.5,
                status: 'unseen',
                matchScore: 88,
              });
            } else {
              const existing = movieMap.get(key)!;
              movieMap.set(key, {
                ...existing,
                serverType: server?.type || existing.serverType,
                serverName: server?.name || existing.serverName,
                itemUrl: raw.itemUrl || existing.itemUrl,
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

  // Handle Taste Profile Updates
  const handleSaveTaste = (newTaste: TasteProfile) => {
    setTaste(newTaste);
    AppStorage.saveTaste(newTaste);
    AppStorage.setOnboarded(true);

    setMovies((prev) => {
      const reRanked = rankMoviesByTaste(prev, newTaste);
      AppStorage.saveMovies(reRanked);
      return reRanked;
    });
  };

  // Toggle Save / Add to Watchlist
  const handleToggleSave = (movieId: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      const isAlreadySaved = next.has(movieId);
      if (isAlreadySaved) {
        next.delete(movieId);
      } else {
        next.add(movieId);
      }

      setMovies((movList) => {
        const updated = movList.map((m) =>
          m.id === movieId ? { ...m, status: (isAlreadySaved ? 'unseen' : 'saved') as WatchStatus } : m
        );
        AppStorage.saveMovies(updated);
        return updated;
      });

      return next;
    });
  };

  // Mark Movie as Watched with optional score
  const handleMarkWatched = (movieId: string, userRating: number = 9) => {
    setWatchedIds((prev) => {
      const next = new Set(prev);
      next.add(movieId);

      setMovies((movList) => {
        const updated = movList.map((m) =>
          m.id === movieId
            ? { ...m, status: 'seen' as WatchStatus, userRating }
            : m
        );
        AppStorage.saveMovies(updated);
        return updated;
      });

      return next;
    });
  };

  // Thumbs Up / Like Movie
  const handleLikeMovie = (movieId: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(movieId)) {
        next.delete(movieId);
      } else {
        next.add(movieId);
      }
      return next;
    });
  };

  // Toggle Upcoming Release Reminder
  const handleToggleReminder = (movieId: string) => {
    setRemindedIds((prev) => {
      const next = new Set(prev);
      const isReminded = next.has(movieId);
      if (isReminded) {
        next.delete(movieId);
      } else {
        next.add(movieId);
        // Add in-app notification alert
        const movie = movies.find((m) => m.id === movieId);
        if (movie) {
          const newNotif: NotificationItem = {
            id: `notif-${Date.now()}`,
            title: `Reminder Active: ${movie.title}`,
            message: `You will be alerted when ${movie.title} arrives in theatres or on streaming.`,
            type: 'upcoming_soon',
            timestamp: 'Just now',
            read: false,
            movieId: movie.id,
            movieTitle: movie.title,
          };
          setNotifications((notifs) => {
            const updated = [newNotif, ...notifs];
            AppStorage.saveNotifications(updated);
            return updated;
          });
        }
      }

      setMovies((movList) => {
        const updated = movList.map((m) =>
          m.id === movieId ? { ...m, reminded: !isReminded } : m
        );
        AppStorage.saveMovies(updated);
        return updated;
      });

      return next;
    });
  };

  // Mark Notification as Read
  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      AppStorage.saveNotifications(updated);
      return updated;
    });
  };

  // Keyboard Shortcuts (Arrow keys, Enter, Esc, /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
      } else if (e.key === 'Escape') {
        setSelectedMovie(null);
        setTrailerMovie(null);
        setIsSearchOpen(false);
        setIsExtensionOpen(false);
        setIsSettingsOpen(false);
        setIsShortcutsOpen(false);
        setIsTasteRadarOpen(false);
        setIsOnboardingOpen(false);
      } else if (e.key.toLowerCase() === 'm') {
        setSettings((prev) => {
          const next = { ...prev, soundEnabled: !prev.soundEnabled };
          AppStorage.saveSettings(next);
          soundEffects.click(next.soundEnabled);
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings.soundEnabled]);

  // Curated Carousels & Sub-Sections for Home
  const billboardCandidates = useMemo(() => {
    return movies.filter((m) => m.isIndianAction || m.matchScore >= 95);
  }, [movies]);

  const heroMovie = billboardCandidates[heroIndex % Math.max(1, billboardCandidates.length)] || movies[0];

  // ── ROW 1: TOP 10 WORLDWIDE TODAY (GIANT NETFLIX TYPOGRAPHY NUMBERS) ──
  const top10Global = useMemo(() => {
    // Curated high-octane global blockbusters spanning Hollywood, World, and Indian Cinema
    const topIds = [
      'dune-part-two-2024',
      'the-dark-knight-2008',
      'interstellar-2014',
      'rrr-2022',
      'oppenheimer-2023',
      'the-matrix-1999',
      'blade-runner-2049-2017',
      'parasite-2019',
      'kill-2024',
      'vikram-2022',
    ];
    const picked: MovieItem[] = [];
    topIds.forEach((id) => {
      const found = movies.find((m) => m.id === id);
      if (found) picked.push(found);
    });
    // Fallback if needed
    if (picked.length < 10) {
      const rest = movies.filter((m) => !picked.some((p) => p.id === m.id)).slice(0, 10 - picked.length);
      picked.push(...rest);
    }
    return picked;
  }, [movies]);

  // ── ROW 2: TONIGHT'S TOP PICKS (95%+ MATCH ACROSS ALL CINEMA) ──
  const tonightTopPicks = useMemo(() => {
    return movies.filter((m) => m.matchScore >= 95 && m.status !== 'seen').slice(0, 12);
  }, [movies]);

  // ── ROW 3: MIND-BENDING SCI-FI & PSYCHOLOGICAL MASTERPIECES ──
  const scifiMindBending = useMemo(() => {
    return movies.filter(
      (m) =>
        m.genres?.some((g) => ['Sci-Fi', 'Mystery'].includes(g)) ||
        ['Inception', 'Interstellar', 'Arrival', 'The Prestige', 'Memento', 'Blade Runner 2049', 'The Matrix'].some((t) => m.title.includes(t))
    );
  }, [movies]);

  // ── ROW 4: HIGH-OCTANE ACTION & THRILLERS (WORLDWIDE) ──
  const actionAdrenaline = useMemo(() => {
    return movies.filter(
      (m) =>
        m.genres?.includes('Action') &&
        ['John Wick: Chapter 4', 'Mad Max: Fury Road', 'Top Gun: Maverick', 'Heat', 'Gladiator', 'Sicario', 'The Raid: Redemption', 'Kill', 'Vikram', 'Pokiri', 'Thuppakki'].some(
          (t) => m.title.includes(t)
        )
    );
  }, [movies]);

  // ── ROW 5: ACCLAIMED WORLD & ASIAN CINEMA (WITH ENGLISH AUDIO / SUBS) ──
  const worldCinemaIcons = useMemo(() => {
    return movies.filter((m) => ['korean', 'japanese', 'world'].includes(m.industry || ''));
  }, [movies]);

  // ── ROW 6: INDIAN CINEMA BLOCKBUSTERS & PAN-INDIA SAGAS ──
  const indianCinemaSpotlight = useMemo(() => {
    return movies.filter((m) => ['tollywood', 'bollywood', 'kollywood', 'sandalwood', 'mollywood'].includes(m.industry || '') && !m.isUpcoming);
  }, [movies]);

  // ── ROW 7: UPCOMING ANTICIPATED RELEASES & RADAR COUNTDOWNS ──
  const upcomingReleases = useMemo(() => {
    return movies.filter((m) => m.isUpcoming);
  }, [movies]);

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-[#E2E8F0] relative overflow-x-hidden selection:bg-[#E50914] selection:text-white">
      {/* Offline Toast Indicator */}
      <OfflineIndicator />

      {/* Global Navigation Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        savedCount={savedIds.size}
        watchedCount={watchedIds.size}
        serverCount={servers.length}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onSelectMovie={(m) => setSelectedMovie(m)}
        allMovies={movies}
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
        onOpenTaste={() => setIsTasteRadarOpen(true)}
      />

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: HOME (NETFLIX BILLBOARD HERO + STACKED CAROUSELS)
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'home' && (
        <main className="pb-24 animate-in fade-in duration-300">
          {/* Billboard Hero Banner */}
          {heroMovie && (
            <BillboardHero
              movie={heroMovie}
              onPlayTrailer={(m) => setTrailerMovie(m)}
              onMoreInfo={(m) => setSelectedMovie(m)}
              onToggleSave={handleToggleSave}
              isSaved={savedIds.has(heroMovie.id)}
              onShuffleHero={() => setHeroIndex((prev) => prev + 1)}
              soundEnabled={settings.soundEnabled}
            />
          )}

          {/* Row 1: Top 10 Worldwide Today (With Giant Netflix Typography Numbers) */}
          <MovieCarouselRow
            title="Top 10 Worldwide Today"
            subtitle="Most Watched Blockbusters & Acclaimed Hits Across The Globe"
            movies={top10Global}
            isTop10={true}
            onSelectMovie={(m) => setSelectedMovie(m)}
            onPlayTrailer={(m) => setTrailerMovie(m)}
            onToggleSave={handleToggleSave}
            onMarkWatched={handleMarkWatched}
            onLikeMovie={handleLikeMovie}
            onToggleReminder={handleToggleReminder}
            savedIds={savedIds}
            watchedIds={watchedIds}
            likedIds={likedIds}
            remindedIds={remindedIds}
            soundEnabled={settings.soundEnabled}
          />

          {/* Row 2: Tonight's Instant Suggestions (Highest Match %) */}
          <MovieCarouselRow
            title="Tonight's Top Suggestions (95%+ Match)"
            subtitle="Calibrated across all world cinema to your genre affinity"
            movies={tonightTopPicks}
            onSelectMovie={(m) => setSelectedMovie(m)}
            onPlayTrailer={(m) => setTrailerMovie(m)}
            onToggleSave={handleToggleSave}
            onMarkWatched={handleMarkWatched}
            onLikeMovie={handleLikeMovie}
            onToggleReminder={handleToggleReminder}
            savedIds={savedIds}
            watchedIds={watchedIds}
            likedIds={likedIds}
            remindedIds={remindedIds}
            soundEnabled={settings.soundEnabled}
          />

          {/* Row 3: Mind-Bending Sci-Fi & Psychological Masterpieces */}
          <MovieCarouselRow
            title="Mind-Bending Sci-Fi & Psychological Masterpieces"
            subtitle="Dune: Part Two, Interstellar, Blade Runner 2049, Inception, The Matrix, Arrival"
            movies={scifiMindBending}
            onSelectMovie={(m) => setSelectedMovie(m)}
            onPlayTrailer={(m) => setTrailerMovie(m)}
            onToggleSave={handleToggleSave}
            onMarkWatched={handleMarkWatched}
            onLikeMovie={handleLikeMovie}
            onToggleReminder={handleToggleReminder}
            savedIds={savedIds}
            watchedIds={watchedIds}
            likedIds={likedIds}
            remindedIds={remindedIds}
            soundEnabled={settings.soundEnabled}
          />

          {/* Row 4: High-Octane Action & Adrenaline Thrillers */}
          <MovieCarouselRow
            title="High-Octane Action & Adrenaline Thrillers"
            subtitle="John Wick 4, Mad Max: Fury Road, Top Gun: Maverick, Heat, Gladiator, Sicario, Kill"
            movies={actionAdrenaline}
            onSelectMovie={(m) => setSelectedMovie(m)}
            onPlayTrailer={(m) => setTrailerMovie(m)}
            onToggleSave={handleToggleSave}
            onMarkWatched={handleMarkWatched}
            onLikeMovie={handleLikeMovie}
            onToggleReminder={handleToggleReminder}
            savedIds={savedIds}
            watchedIds={watchedIds}
            likedIds={likedIds}
            remindedIds={remindedIds}
            soundEnabled={settings.soundEnabled}
          />

          {/* Row 5: Acclaimed World & Asian Cinema (English Audio / Subs) */}
          <MovieCarouselRow
            title="Acclaimed World & Asian Cinema (English Audio / Subs)"
            subtitle="Parasite, Oldboy, Memories of Murder, Spirited Away, The Raid, Anatomy of a Fall"
            movies={worldCinemaIcons}
            onSelectMovie={(m) => setSelectedMovie(m)}
            onPlayTrailer={(m) => setTrailerMovie(m)}
            onToggleSave={handleToggleSave}
            onMarkWatched={handleMarkWatched}
            onLikeMovie={handleLikeMovie}
            onToggleReminder={handleToggleReminder}
            savedIds={savedIds}
            watchedIds={watchedIds}
            likedIds={likedIds}
            remindedIds={remindedIds}
            soundEnabled={settings.soundEnabled}
          />

          {/* Row 6: Indian Cinema Hits & Pan-India Sagas */}
          <MovieCarouselRow
            title="Indian Cinema Hits & Pan-India Sagas"
            subtitle="RRR, K.G.F: Chapter 2, Baahubali 2, Kalki 2898 AD, Salaar, Manjummel Boys, Vikram"
            movies={indianCinemaSpotlight}
            onSelectMovie={(m) => setSelectedMovie(m)}
            onPlayTrailer={(m) => setTrailerMovie(m)}
            onToggleSave={handleToggleSave}
            onMarkWatched={handleMarkWatched}
            onLikeMovie={handleLikeMovie}
            onToggleReminder={handleToggleReminder}
            savedIds={savedIds}
            watchedIds={watchedIds}
            likedIds={likedIds}
            remindedIds={remindedIds}
            soundEnabled={settings.soundEnabled}
          />

          {/* Row 7: Upcoming Releases & Countdowns */}
          {upcomingReleases.length > 0 && (
            <MovieCarouselRow
              title="Upcoming Releases & In-App Alerts"
              subtitle="Pushpa 2, Dune: Messiah, Kantara: Chapter 1, SSMB29, War 2"
              movies={upcomingReleases}
              onSelectMovie={(m) => setSelectedMovie(m)}
              onPlayTrailer={(m) => setTrailerMovie(m)}
              onToggleSave={handleToggleSave}
              onMarkWatched={handleMarkWatched}
              onLikeMovie={handleLikeMovie}
              onToggleReminder={handleToggleReminder}
              savedIds={savedIds}
              watchedIds={watchedIds}
              likedIds={likedIds}
              remindedIds={remindedIds}
              soundEnabled={settings.soundEnabled}
            />
          )}
        </main>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: MOVIES (DIVIDED INTO TONIGHT, INTERESTED, WATCHED)
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'movies' && (
        <DividedLibraryView
          movies={movies}
          taste={taste}
          servers={servers}
          initialSubTab="interested"
          onSelectMovie={(m) => setSelectedMovie(m)}
          onPlayTrailer={(m) => setTrailerMovie(m)}
          onToggleSave={handleToggleSave}
          onMarkWatched={handleMarkWatched}
          onLikeMovie={handleLikeMovie}
          savedIds={savedIds}
          watchedIds={watchedIds}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: INDIAN CINEMA HUB
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'indian' && (
        <IndianCinemaHub
          movies={movies}
          onSelectMovie={(m) => setSelectedMovie(m)}
          onPlayTrailer={(m) => setTrailerMovie(m)}
          onToggleSave={handleToggleSave}
          onMarkWatched={handleMarkWatched}
          onLikeMovie={handleLikeMovie}
          onToggleReminder={handleToggleReminder}
          savedIds={savedIds}
          watchedIds={watchedIds}
          likedIds={likedIds}
          remindedIds={remindedIds}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: UPCOMING
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'upcoming' && (
        <UpcomingView
          mode="upcoming"
          movies={movies}
          onSelectMovie={(m) => setSelectedMovie(m)}
          onPlayTrailer={(m) => setTrailerMovie(m)}
          onToggleSave={handleToggleSave}
          onToggleReminder={handleToggleReminder}
          remindedIds={remindedIds}
          savedIds={savedIds}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 5: NEW & HOT
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'new_and_hot' && (
        <UpcomingView
          mode="new_and_hot"
          movies={movies}
          onSelectMovie={(m) => setSelectedMovie(m)}
          onPlayTrailer={(m) => setTrailerMovie(m)}
          onToggleSave={handleToggleSave}
          onToggleReminder={handleToggleReminder}
          remindedIds={remindedIds}
          savedIds={savedIds}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 6: MY LIST (SAVED, WATCHED, REMINDERS)
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'my_list' && (
        <MyListView
          movies={movies}
          savedIds={savedIds}
          watchedIds={watchedIds}
          remindedIds={remindedIds}
          onSelectMovie={(m) => setSelectedMovie(m)}
          onPlayTrailer={(m) => setTrailerMovie(m)}
          onToggleSave={handleToggleSave}
          onMarkWatched={handleMarkWatched}
          soundEnabled={settings.soundEnabled}
        />
      )}

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        savedCount={savedIds.size}
        soundEnabled={settings.soundEnabled}
      />

      {/* ─────────────────────────────────────────────────────────────
          MODALS & OVERLAYS
      ───────────────────────────────────────────────────────────── */}
      {/* Netflix Detail Modal */}
      <MovieDetailModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
        onUpdateStatus={(id, status) => {
          if (status === 'saved') handleToggleSave(id);
          if (status === 'seen') handleMarkWatched(id);
        }}
        onUpdateRating={(id, rating) => handleMarkWatched(id, rating)}
        onSelectSimilar={(m) => setSelectedMovie(m)}
        allMovies={movies}
        soundEnabled={settings.soundEnabled}
      />

      {/* Full-Screen Cinema Trailer Player */}
      <TrailerModal
        movie={trailerMovie}
        onClose={() => setTrailerMovie(null)}
        soundEnabled={settings.soundEnabled}
      />

      {/* First-Run Taste Onboarding Modal */}
      <TasteOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        taste={taste}
        onSaveTaste={handleSaveTaste}
        soundEnabled={settings.soundEnabled}
      />

      {/* Taste Radar Modal */}
      {isTasteRadarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-3xl bg-[#14141B] rounded-3xl border border-white/20 p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setIsTasteRadarOpen(false)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2"
            >
              ✕
            </button>
            <h2 className="text-2xl font-display font-black text-white uppercase mb-4">
              Your Cinematic DNA & Radar
            </h2>
            <TasteRadar
              taste={taste}
              onChange={handleSaveTaste}
              soundEnabled={settings.soundEnabled}
            />
          </div>
        </div>
      )}

      {/* Natural Search Modal (Gemini AI) */}
      <NaturalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        libraryMovies={movies}
        taste={taste}
        onSelectMovie={(m) => setSelectedMovie(m)}
        onAddToLibrary={(m) => {
          setMovies((prev) => [m, ...prev]);
        }}
        soundEnabled={settings.soundEnabled}
      />

      {/* Extension Bridge Modal */}
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
        onLoadDemoServers={() => {
          setServers(INITIAL_SERVERS);
          AppStorage.saveServers(INITIAL_SERVERS);
        }}
        soundEnabled={settings.soundEnabled}
      />

      {/* Settings Modal */}
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
        onResetAll={() => {
          AppStorage.resetAll();
          setTaste(DEFAULT_TASTE);
          setServers(INITIAL_SERVERS);
          setMovies(rankMoviesByTaste(INITIAL_MOVIES, DEFAULT_TASTE));
        }}
        onRestoreAll={(data) => {
          if (data.taste) {
            setTaste(data.taste);
            AppStorage.saveTaste(data.taste);
          }
          if (data.movies) {
            setMovies(rankMoviesByTaste(data.movies, data.taste || taste));
          }
        }}
        soundEnabled={settings.soundEnabled}
      />

      {/* Shortcuts Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        soundEnabled={settings.soundEnabled}
      />
    </div>
  );
}
