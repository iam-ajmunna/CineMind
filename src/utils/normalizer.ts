import { MovieItem, ServerType } from '../types';

export interface RawMediaPayload {
  title: string;
  year?: number | string;
  posterUrl?: string;
  backdropUrl?: string;
  serverType?: string;
  serverName?: string;
  itemUrl?: string;
  streamUrl?: string;
  genres?: string[] | string;
  directors?: string[] | string;
  cast?: string[] | string;
  runtime?: number | string;
  rating?: number | string;
  overview?: string;
  quality?: string;
}

/**
 * Strips release tags, resolution, codecs, and file extensions from raw scraped or media server titles.
 */
export function cleanMovieTitle(rawTitle: string): { title: string; year?: number } {
  if (!rawTitle) return { title: 'Unknown Title' };

  let clean = rawTitle.trim();

  // Extract year in parenthesis or square brackets e.g. (2024), [2019]
  let extractedYear: number | undefined;
  const yearMatch = clean.match(/[\(\[]\s*(19\d\d|20\d\d)\s*[\)\]]/);
  if (yearMatch) {
    extractedYear = parseInt(yearMatch[1], 10);
    clean = clean.replace(yearMatch[0], '');
  } else {
    // Check for trailing or middle year separated by dots/spaces
    const dotYearMatch = clean.match(/(?:^|[\s._-])(19\d\d|20\d\d)(?:[\s._-]|$)/);
    if (dotYearMatch && parseInt(dotYearMatch[1], 10) >= 1920 && parseInt(dotYearMatch[1], 10) <= 2030) {
      extractedYear = parseInt(dotYearMatch[1], 10);
      clean = clean.replace(dotYearMatch[0], ' ');
    }
  }

  // Remove common scene tags, resolutions, audio codecs
  const scenePatterns = [
    /\b(2160p|1080p|720p|480p|4k|uhd|hdr|hdr10|dolby\s*vision|dv|imax)\b/gi,
    /\b(bluray|blu-ray|bdrip|brrip|web-dl|webdl|webrip|hdtv|dvdrip)\b/gi,
    /\b(x264|x265|h264|h265|hevc|avc|aac|dts|truehd|atmos|ac3)\b/gi,
    /\b(repack|proper|internal|unrated|extended|directors\s*cut|remux)\b/gi,
    /\.(mkv|mp4|avi|mov|wmv|iso|m4v)$/i,
  ];

  for (const pattern of scenePatterns) {
    clean = clean.replace(pattern, ' ');
  }

  // Remove empty or remaining bracket enclosures e.g. [ ], ( ), [ - ]
  clean = clean.replace(/\[\s*\]|\(\s*\)|\{\s*\}/g, ' ');

  // Replace dots/underscores with spaces unless part of an acronym
  clean = clean.replace(/[._]/g, ' ');

  // Clean trailing punctuation or hanging brackets
  clean = clean.replace(/[\[\]\(\)\{\}]/g, ' ');

  // Remove duplicate spaces and trim punctuation
  clean = clean.replace(/\s+/g, ' ').replace(/^[\s\-_:.]+|[\s\-_:.]+$/g, '').trim();

  return {
    title: clean || rawTitle.trim(),
    year: extractedYear
  };
}

/**
 * Normalizes an arbitrary raw payload (from extension or mock server) into a MovieItem
 */
export function normalizeMoviePayload(raw: RawMediaPayload, fallbackServer: ServerType = 'custom', fallbackServerName: string = 'Local Server'): MovieItem {
  const { title, year: parsedYear } = cleanMovieTitle(raw.title || '');
  const year = raw.year ? (typeof raw.year === 'number' ? raw.year : parseInt(String(raw.year).replace(/\D/g, ''), 10)) : (parsedYear || new Date().getFullYear());

  const serverType = (raw.serverType?.toLowerCase() || fallbackServer) as ServerType;
  const serverName = raw.serverName || fallbackServerName;

  // Process genres
  let genres: string[] = [];
  if (Array.isArray(raw.genres)) {
    genres = raw.genres;
  } else if (typeof raw.genres === 'string') {
    genres = raw.genres.split(/[,/|•]/).map(g => g.trim()).filter(Boolean);
  }

  // Process directors
  let directors: string[] = [];
  if (Array.isArray(raw.directors)) {
    directors = raw.directors;
  } else if (typeof raw.directors === 'string') {
    directors = raw.directors.split(/[,/|]/).map(d => d.trim()).filter(Boolean);
  }

  // Process cast
  let cast: string[] = [];
  if (Array.isArray(raw.cast)) {
    cast = raw.cast;
  } else if (typeof raw.cast === 'string') {
    cast = raw.cast.split(/[,/|]/).map(c => c.trim()).filter(Boolean);
  }

  // Parse runtime in minutes
  let runtime = 110;
  if (typeof raw.runtime === 'number') {
    runtime = raw.runtime;
  } else if (typeof raw.runtime === 'string') {
    const num = parseInt(raw.runtime.replace(/\D/g, ''), 10);
    if (!isNaN(num) && num > 0) runtime = num;
  }

  // Parse rating
  let rating = 7.5;
  if (typeof raw.rating === 'number') {
    rating = raw.rating > 10 ? raw.rating / 10 : raw.rating;
  } else if (typeof raw.rating === 'string') {
    const parsed = parseFloat(raw.rating.replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed)) rating = parsed > 10 ? parsed / 10 : parsed;
  }

  // Deterministic ID based on title and year
  const safeIdSlug = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${year}-${serverType}`.replace(/-+/g, '-');

  return {
    id: safeIdSlug,
    title,
    year: isNaN(year) ? 2024 : year,
    overview: raw.overview || `Available on ${serverName}. Discover cinematic greatness.`,
    posterUrl: raw.posterUrl || `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80`,
    backdropUrl: raw.backdropUrl || raw.posterUrl,
    serverType,
    serverName,
    itemUrl: raw.itemUrl,
    streamUrl: raw.streamUrl || raw.itemUrl,
    addedAt: new Date().toISOString(),
    genres: genres.length > 0 ? genres : ['Cinema', 'Drama'],
    directors,
    cast,
    runtime,
    rating: parseFloat(rating.toFixed(1)),
    status: 'unseen',
    matchScore: 80,
    quality: raw.quality || '1080p'
  };
}

/**
 * Deduplicates movie items by title and year, merging server sources if same movie exists on multiple servers
 */
export function deduplicateMovies(movies: MovieItem[]): MovieItem[] {
  const map = new Map<string, MovieItem>();

  for (const m of movies) {
    const key = `${m.title.toLowerCase().replace(/[^a-z0-9]/g, '')}-${m.year}`;
    if (!map.has(key)) {
      map.set(key, m);
    } else {
      const existing = map.get(key)!;
      // Prefer richer metadata or mark multi-server availability
      if (!existing.backdropUrl && m.backdropUrl) existing.backdropUrl = m.backdropUrl;
      if (existing.genres.length < m.genres.length) existing.genres = m.genres;
      if (m.serverType !== existing.serverType) {
        existing.serverName = `${existing.serverName}, ${m.serverName}`;
      }
    }
  }

  return Array.from(map.values());
}
