export type ServerType = 'plex' | 'jellyfin' | 'emby' | 'stremio' | 'kodi' | 'radarr' | 'dflix' | 'allsitehub' | 'bdix' | 'custom' | 'none';

export type WatchStatus = 'unseen' | 'seen' | 'saved' | 'not_interested';

export type IndustryType =
  | 'bollywood'
  | 'tollywood'
  | 'kollywood'
  | 'mollywood'
  | 'sandalwood'
  | 'bengali'
  | 'punjabi'
  | 'hollywood'
  | 'korean'
  | 'japanese'
  | 'world';

export interface MatchBreakdown {
  genreAffinity: number;    // max 35
  crewAffinity: number;     // max 20
  vibeAffinity: number;     // max 20
  runtimeFit: number;       // max 10
  communityRating: number;  // max 15
  total: number;            // 0 - 100
  matchedReasons: string[];
}

export interface MovieItem {
  id: string;
  tmdbId?: number;
  imdbId?: string;
  title: string;
  year: number;
  overview: string;
  posterUrl: string;
  backdropUrl?: string;
  trailerUrl?: string;
  youtubeTrailerId?: string;
  serverType: ServerType;
  serverName: string;
  itemUrl?: string;
  streamUrl?: string;
  addedAt: string;
  genres: string[];
  directors: string[];
  cast: string[];
  runtime: number; // minutes
  rating: number;  // 0 - 10 (TMDB)
  imdbRating?: number;
  rtScore?: number;
  userRating?: number; // 1 - 10
  userNotes?: string;
  status: WatchStatus;
  matchScore: number; // 0 - 100
  matchBreakdown?: MatchBreakdown;
  quality?: string; // 4K HDR, 1080p, etc.
  aiExplanation?: string;
  industry?: IndustryType;
  originalLanguage?: string;
  isIndianAction?: boolean;
  isUpcoming?: boolean;
  releaseDate?: string;
  countdownDays?: number;
  reminded?: boolean;
  top10Rank?: number;
  hasEnglishAudio?: boolean; // English original audio or official English dubbed track
  audioLanguages?: string[]; // e.g. ['English', 'Hindi', 'Spanish']
  streamingProviders?: string[];
  ageRating?: string;
}

export interface TasteProfile {
  genres: Record<string, number>; // genre name -> weight 1 to 5
  favoriteDirectors: string[];
  favoriteActors: string[];
  preferredDecades: string[];
  preferredIndustries: string[];
  includeIndianCinema: boolean;
  prioritizeIndianAction: boolean;
  runtimePreference: 'any' | 'under90' | '90to120' | 'over120';
  moods: string[];
  vibes: string[];
  favoriteMovies: string[];
  minRating: number;
}

export interface ServerConnection {
  id: string;
  name: string;
  type: ServerType;
  url: string;
  movieCount: number;
  lastSyncedAt: string;
  isActive: boolean;
  isDemo?: boolean;
}

export interface AppSettings {
  tmdbApiKey: string;
  geminiApiKey: string;
  soundEnabled: boolean;
  cinematicMode: boolean;
  reducedMotion: boolean;
  autoSyncExtension: boolean;
  notificationsEnabled: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'upcoming_soon' | 'new_release' | 'catalog_match' | 'digest';
  timestamp: string;
  read: boolean;
  movieId?: string;
  movieTitle?: string;
}

export interface AISearchResult {
  title: string;
  year: number;
  reason: string;
  vibes: string[];
  similarityScore: number;
  matchedLibraryMovie?: MovieItem;
}
