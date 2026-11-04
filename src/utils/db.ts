import { MovieItem, TasteProfile, ServerConnection, AppSettings, NotificationItem } from '../types';
import { calculateMovieMatch, rankMoviesByTaste } from './matching';
import { WORLD_CATALOG } from '../data/worldCatalog';

export const DEFAULT_TASTE: TasteProfile = {
  genres: {
    'Action': 5,
    'Sci-Fi': 5,
    'Thriller': 5,
    'Mystery': 4,
    'Crime': 4,
    'Drama': 4,
    'Adventure': 3,
    'Comedy': 2,
  },
  favoriteDirectors: ['Christopher Nolan', 'Denis Villeneuve', 'David Fincher', 'Quentin Tarantino', 'SS Rajamouli', 'Bong Joon-ho', 'Lokesh Kanagaraj', 'Prashanth Neel'],
  favoriteActors: ['Leonardo DiCaprio', 'Christian Bale', 'Cillian Murphy', 'Ryan Gosling', 'Prabhas', 'Jr NTR', 'Keanu Reeves', 'Brad Pitt', 'Kamal Haasan'],
  preferredDecades: ['2020s', '2010s', '2000s', '1990s'],
  preferredIndustries: ['hollywood', 'world', 'korean', 'tollywood', 'bollywood', 'kollywood', 'sandalwood', 'mollywood', 'japanese'],
  includeIndianCinema: true,
  prioritizeIndianAction: false,
  runtimePreference: 'any',
  moods: ['cerebral', 'atmospheric', 'adrenaline-rush', 'mind-bending', 'tense'],
  vibes: ['mind-bending', 'neo-noir', 'cyberpunk', 'slow-burn', 'adrenaline-rush'],
  favoriteMovies: ['Dune: Part Two', 'Interstellar', 'Blade Runner 2049', 'The Dark Knight', 'Inception', 'RRR', 'Parasite', 'Pulp Fiction'],
  minRating: 6.8,
};

export const INITIAL_SERVERS: ServerConnection[] = [
  {
    id: 'srv-dflix-live',
    name: 'DFlix Live (WiFi BDIX Gigabit)',
    type: 'dflix',
    url: 'http://dflix.live',
    movieCount: 420,
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    isActive: true,
    isDemo: true,
  },
  {
    id: 'srv-plex-livingroom',
    name: 'Home Plex Server (Shield TV)',
    type: 'plex',
    url: 'http://192.168.1.100:32400',
    movieCount: 168,
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    isActive: true,
    isDemo: true,
  },
  {
    id: 'srv-allsitehub',
    name: 'AllSiteHub BDIX Directory',
    type: 'allsitehub',
    url: 'https://www.allsitehub.site',
    movieCount: 310,
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    isActive: true,
    isDemo: true,
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Upcoming Indian Action Alert',
    message: 'Pushpa 2: The Rule (Allu Arjun) releases in 14 days! Added to your upcoming radar.',
    type: 'upcoming_soon',
    timestamp: '2 hours ago',
    read: false,
    movieId: 'pushpa-2-the-rule-2024',
    movieTitle: 'Pushpa 2: The Rule',
  },
  {
    id: 'notif-2',
    title: 'Now Streaming on Netflix',
    message: 'Kalki 2898 AD (Prabhas, Amitabh Bachchan) is now streaming in 4K HDR Atmos.',
    type: 'new_release',
    timestamp: 'Yesterday',
    read: false,
    movieId: 'kalki-2898-ad-2024',
    movieTitle: 'Kalki 2898 AD',
  },
  {
    id: 'notif-3',
    title: 'Weekly Cinema Intelligence Digest',
    message: '18 new Indian action & Hollywood sci-fi films match your taste profile this week.',
    type: 'digest',
    timestamp: '3 days ago',
    read: true,
  },
];

export const INITIAL_MOVIES: MovieItem[] = WORLD_CATALOG;

export const INITIAL_GAPS: MovieItem[] = [
  {
    id: 'john-wick-chapter-4-2023',
    tmdbId: 603692,
    imdbId: 'tt10366206',
    title: 'John Wick: Chapter 4',
    year: 2023,
    overview: 'With the price on his head ever increasing, John Wick uncovers a path to defeating The High Table, battling his way across Paris, Berlin, and Osaka.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/vZloFAK7NKnMGKEHvYcnEtDmIOa.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/h8gHn0OzBoaefW0w19vR0m3e8.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=qEVUtrk8_B4',
    youtubeTrailerId: 'qEVUtrk8_B4',
    serverType: 'none',
    serverName: 'Not on Local Server',
    addedAt: '2026-10-27T10:00:00Z',
    genres: ['Action', 'Thriller', 'Crime'],
    directors: ['Chad Stahelski'],
    cast: ['Keanu Reeves', 'Donnie Yen', 'Bill Skarsgård', 'Hiroyuki Sanada'],
    runtime: 169,
    rating: 7.7,
    imdbRating: 7.7,
    rtScore: 94,
    status: 'unseen',
    matchScore: 97,
    industry: 'hollywood',
    originalLanguage: 'en',
    streamingProviders: ['Prime Video', 'Lionsgate Play'],
    ageRating: 'R',
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  tmdbApiKey: '',
  geminiApiKey: '',
  soundEnabled: false,
  cinematicMode: true,
  reducedMotion: false,
  autoSyncExtension: true,
  notificationsEnabled: true,
};

const STORAGE_KEYS = {
  MOVIES: 'cinemind_movies',
  TASTE: 'cinemind_taste',
  SERVERS: 'cinemind_servers',
  SETTINGS: 'cinemind_settings',
  NOTIFICATIONS: 'cinemind_notifications',
  ONBOARDED: 'cinemind_onboarded',
};

export const AppStorage = {
  getTaste(): TasteProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASTE);
      return data ? JSON.parse(data) : DEFAULT_TASTE;
    } catch {
      return DEFAULT_TASTE;
    }
  },

  saveTaste(taste: TasteProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASTE, JSON.stringify(taste));
    } catch (e) {
      console.warn('Failed to save taste profile', e);
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  },

  getServers(): ServerConnection[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SERVERS);
      return data ? JSON.parse(data) : INITIAL_SERVERS;
    } catch {
      return INITIAL_SERVERS;
    }
  },

  saveServers(servers: ServerConnection[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SERVERS, JSON.stringify(servers));
    } catch (e) {
      console.warn('Failed to save servers', e);
    }
  },

  getMovies(): MovieItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MOVIES);
      const taste = this.getTaste();
      if (!data) {
        this.saveMovies(INITIAL_MOVIES);
        return rankMoviesByTaste(INITIAL_MOVIES, taste);
      }

      const stored: MovieItem[] = JSON.parse(data);

      // Automatic Migration: If stored catalog has fewer items than our rich master catalog,
      // seamlessly expand to the full universe while preserving user's watched, saved, and rated statuses!
      if (!Array.isArray(stored) || stored.length < INITIAL_MOVIES.length) {
        const storedMap = new Map<string, MovieItem>();
        if (Array.isArray(stored)) {
          stored.forEach((m) => {
            if (m && m.id) storedMap.set(m.id, m);
          });
        }

        const merged: MovieItem[] = INITIAL_MOVIES.map((catalogMovie) => {
          const userMovie = storedMap.get(catalogMovie.id);
          if (userMovie) {
            return {
              ...catalogMovie,
              status: userMovie.status || catalogMovie.status,
              userRating: userMovie.userRating ?? catalogMovie.userRating,
              userNotes: userMovie.userNotes || catalogMovie.userNotes,
              reminded: userMovie.reminded ?? catalogMovie.reminded,
              serverType: userMovie.serverType && userMovie.serverType !== 'none' ? userMovie.serverType : catalogMovie.serverType,
              serverName: userMovie.serverName && userMovie.serverName !== 'Not on Local Server' ? userMovie.serverName : catalogMovie.serverName,
              itemUrl: userMovie.itemUrl || catalogMovie.itemUrl,
            };
          }
          return catalogMovie;
        });

        // Also preserve any custom imported/scraped movies from the user's servers
        if (Array.isArray(stored)) {
          stored.forEach((m) => {
            if (m && m.id && !INITIAL_MOVIES.some((im) => im.id === m.id)) {
              merged.push(m);
            }
          });
        }

        this.saveMovies(merged);
        return rankMoviesByTaste(merged, taste);
      }

      return rankMoviesByTaste(stored, taste);
    } catch {
      return rankMoviesByTaste(INITIAL_MOVIES, DEFAULT_TASTE);
    }
  },

  saveMovies(movies: MovieItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MOVIES, JSON.stringify(movies));
    } catch (e) {
      console.warn('Failed to save movies', e);
    }
  },

  getNotifications(): NotificationItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  },

  saveNotifications(notifs: NotificationItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
    } catch (e) {
      console.warn('Failed to save notifications', e);
    }
  },

  isOnboarded(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ONBOARDED) === 'true';
  },

  setOnboarded(value: boolean): void {
    localStorage.setItem(STORAGE_KEYS.ONBOARDED, String(value));
  },

  resetAll(): void {
    try {
      localStorage.clear();
    } catch {}
  },
};
