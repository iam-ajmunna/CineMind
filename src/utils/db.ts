import { MovieItem, TasteProfile, ServerConnection, AppSettings, ServerType } from '../types';
import { calculateMovieMatch, rankMoviesByTaste } from './matching';

const DB_NAME = 'cinemind_db';
const DB_VERSION = 1;

export const DEFAULT_TASTE: TasteProfile = {
  genres: {
    'Sci-Fi': 5,
    'Thriller': 5,
    'Mystery': 4,
    'Action': 4,
    'Drama': 3,
    'Crime': 3,
    'Horror': 2,
    'Comedy': 1
  },
  favoriteDirectors: ['Denis Villeneuve', 'Christopher Nolan', 'David Fincher', 'Ridley Scott'],
  favoriteActors: ['Ryan Gosling', 'Cillian Murphy', 'Florence Pugh', 'Jake Gyllenhaal'],
  preferredDecades: ['2010s', '2020s', '1990s'],
  runtimePreference: '90to120',
  moods: ['cerebral', 'atmospheric', 'tense'],
  vibes: ['mind-bending', 'neo-noir', 'slow-burn', 'cyberpunk'],
  favoriteMovies: ['Blade Runner 2049', 'Arrival', 'Prisoners', 'Zodiac', 'Interstellar'],
  minRating: 7.2
};

export const INITIAL_SERVERS: ServerConnection[] = [
  {
    id: 'srv-dflix-live',
    name: 'DFlix Live (WiFi BDIX Gigabit)',
    type: 'dflix',
    url: 'http://dflix.live',
    movieCount: 384,
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    isActive: true,
    isDemo: true
  },
  {
    id: 'srv-allsitehub',
    name: 'AllSiteHub Movie Directory',
    type: 'allsitehub',
    url: 'https://www.allsitehub.site',
    movieCount: 215,
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    isActive: true,
    isDemo: true
  },
  {
    id: 'srv-plex-livingroom',
    name: 'Home Plex (Living Room)',
    type: 'plex',
    url: 'http://192.168.1.100:32400',
    movieCount: 142,
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    isActive: true,
    isDemo: true
  },
  {
    id: 'srv-jellyfin-lab',
    name: 'Jellyfin Media Lab',
    type: 'jellyfin',
    url: 'http://192.168.1.150:8096',
    movieCount: 89,
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    isActive: true,
    isDemo: true
  },
  {
    id: 'srv-stremio-sync',
    name: 'Stremio Local Addons',
    type: 'stremio',
    url: 'http://localhost:11470',
    movieCount: 34,
    lastSyncedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    isActive: true,
    isDemo: true
  }
];

export const INITIAL_MOVIES: MovieItem[] = [
  {
    id: 'dune-part-two-2024-dflix',
    tmdbId: 693134,
    title: 'Dune: Part Two',
    year: 2024,
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s520b8q.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    serverType: 'dflix',
    serverName: 'DFlix Live (WiFi BDIX Gigabit)',
    itemUrl: 'http://dflix.live/movie/dune-part-two-2024',
    streamUrl: 'http://dflix.live/play/dune-part-two-2024',
    addedAt: '2026-10-28T09:15:00Z',
    genres: ['Sci-Fi', 'Adventure', 'Action', 'Drama'],
    directors: ['Denis Villeneuve'],
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Florence Pugh', 'Austin Butler'],
    runtime: 166,
    rating: 8.6,
    status: 'unseen',
    matchScore: 99,
    quality: '4K BDIX Gigabit UltraHD'
  },
  {
    id: 'prisoners-2013-dflix',
    tmdbId: 146233,
    title: 'Prisoners',
    year: 2013,
    overview: 'When Keller Dover\'s daughter and her friend go missing, he takes matters into his own hands as the police pursue multiple leads and the pressure mounts.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/7BsvBgnUvjC6k9m9m0o8n9q.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/8y7t6r5e4w3q2a1s.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=bpXfcTX3epI',
    serverType: 'dflix',
    serverName: 'DFlix Live (WiFi BDIX Gigabit)',
    itemUrl: 'http://dflix.live/movie/prisoners-2013',
    streamUrl: 'http://dflix.live/play/prisoners-2013',
    addedAt: '2026-10-26T18:30:00Z',
    genres: ['Drama', 'Thriller', 'Crime', 'Mystery'],
    directors: ['Denis Villeneuve'],
    cast: ['Hugh Jackman', 'Jake Gyllenhaal', 'Viola Davis', 'Paul Dano'],
    runtime: 153,
    rating: 8.2,
    status: 'unseen',
    matchScore: 97,
    quality: '1080p BDIX Direct FTP'
  },
  {
    id: 'fight-club-1999-allsitehub',
    tmdbId: 550,
    title: 'Fight Club',
    year: 1999,
    overview: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=O1nDozs-9W8',
    serverType: 'allsitehub',
    serverName: 'AllSiteHub Movie Directory',
    itemUrl: 'https://www.allsitehub.site/stream/fight-club-1999',
    streamUrl: 'https://www.allsitehub.site/stream/fight-club-1999',
    addedAt: '2026-10-24T12:00:00Z',
    genres: ['Drama', 'Thriller', 'Mystery'],
    directors: ['David Fincher'],
    cast: ['Brad Pitt', 'Edward Norton', 'Helena Bonham Carter'],
    runtime: 139,
    rating: 8.4,
    status: 'unseen',
    matchScore: 96,
    quality: '1080p Web Stream'
  },
  {
    id: 'blade-runner-2049-2017-plex',
    tmdbId: 335984,
    title: 'Blade Runner 2049',
    year: 2017,
    overview: 'Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what\'s left of society into chaos.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/ilRyAZwNpHqPEzVvB7BP7hkfWUS.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=gCcx85zbxz4',
    serverType: 'plex',
    serverName: 'Home Plex (Living Room)',
    itemUrl: 'plex://server/192.168.1.100/metadata/blade-runner-2049',
    addedAt: '2026-10-14T10:00:00Z',
    genres: ['Sci-Fi', 'Mystery', 'Drama', 'Thriller'],
    directors: ['Denis Villeneuve'],
    cast: ['Ryan Gosling', 'Harrison Ford', 'Ana de Armas', 'Sylvia Hoeks'],
    runtime: 164,
    rating: 8.4,
    status: 'unseen',
    matchScore: 98,
    quality: '4K UHD Remux HDR10'
  },
  {
    id: 'arrival-2016-jellyfin',
    tmdbId: 329865,
    title: 'Arrival',
    year: 2016,
    overview: 'Taking place after alien crafts land around the world, an expert linguist is recruited by the military to determine whether they come in peace or are a threat.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/yIZ1xendyqKvY3FGeeBEUdOTr9z.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=tFMo3UJ4B4g',
    serverType: 'jellyfin',
    serverName: 'Jellyfin Media Lab',
    itemUrl: 'http://192.168.1.150:8096/web/index.html#!/item?id=arrival',
    addedAt: '2026-10-18T14:20:00Z',
    genres: ['Sci-Fi', 'Mystery', 'Drama'],
    directors: ['Denis Villeneuve'],
    cast: ['Amy Adams', 'Jeremy Renner', 'Forest Whitaker'],
    runtime: 116,
    rating: 8.2,
    status: 'unseen',
    matchScore: 95,
    quality: '4K Dolby Vision'
  },
  {
    id: 'oppenheimer-2023-plex',
    tmdbId: 872585,
    title: 'Oppenheimer',
    year: 2023,
    overview: 'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II, examining the moral calculus and historical devastation.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    serverType: 'plex',
    serverName: 'Home Plex (Living Room)',
    itemUrl: 'plex://server/192.168.1.100/metadata/oppenheimer',
    addedAt: '2026-09-02T19:40:00Z',
    genres: ['Drama', 'History', 'Thriller'],
    directors: ['Christopher Nolan'],
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.', 'Florence Pugh'],
    runtime: 180,
    rating: 8.5,
    status: 'unseen',
    matchScore: 94,
    quality: '4K IMAX Enhanced'
  },
  {
    id: 'zodiac-2007-jellyfin',
    tmdbId: 1949,
    title: 'Zodiac',
    year: 2007,
    overview: 'A cartoonist becomes obsessed with tracking down the Zodiac Killer, an unidentified serial killer who terrorized Northern California in the late 1960s and early 1970s.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/6WBe96yq5hvRNaS4u1w608hDYHQ.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/7e3b5eF2xJ7Y7e9w7e8r6e5w4e.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=yNncHPl1UXg',
    serverType: 'jellyfin',
    serverName: 'Jellyfin Media Lab',
    itemUrl: 'http://192.168.1.150:8096/web/index.html#!/item?id=zodiac',
    addedAt: '2026-10-05T12:00:00Z',
    genres: ['Crime', 'Drama', 'Mystery', 'Thriller'],
    directors: ['David Fincher'],
    cast: ['Jake Gyllenhaal', 'Mark Ruffalo', 'Robert Downey Jr.'],
    runtime: 157,
    rating: 8.1,
    status: 'unseen',
    matchScore: 92,
    quality: '1080p BluRay'
  },
  {
    id: 'ex-machina-2014-stremio',
    tmdbId: 264660,
    title: 'Ex Machina',
    year: 2014,
    overview: 'Celebrated programmer Caleb wins a competition to spend a week at the private mountain estate of Nathan, the reclusive CEO of his company, to administer a Turing test to an intelligent humanoid robot.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/dmX6C6Q3qV2G4xR5d78tL9P3jN.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/9gYVz9Q9s5A8X8q4v2B0Y1f6e.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=bggUmgeMCdc',
    serverType: 'stremio',
    serverName: 'Stremio Local Addons',
    itemUrl: 'stremio:///detail/movie/tt0470752',
    addedAt: '2026-10-22T08:15:00Z',
    genres: ['Sci-Fi', 'Thriller', 'Drama'],
    directors: ['Alex Garland'],
    cast: ['Domhnall Gleeson', 'Alicia Vikander', 'Oscar Isaac'],
    runtime: 108,
    rating: 8.0,
    status: 'unseen',
    matchScore: 91,
    quality: '1080p Web-DL'
  },
  {
    id: 'sicario-2015-plex',
    tmdbId: 273481,
    title: 'Sicario',
    year: 2015,
    overview: 'An idealistic FBI agent is enlisted by a government task force to aid in the escalating war against drugs at the border area between the U.S. and Mexico.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/8tU8s7n9x2P6lQ9M8v8k9w8e7r.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/tLp9f8w8e7r6e5w4e.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=sR0SDT2GeFg',
    serverType: 'plex',
    serverName: 'Home Plex (Living Room)',
    itemUrl: 'plex://server/192.168.1.100/metadata/sicario',
    addedAt: '2026-10-01T15:00:00Z',
    genres: ['Action', 'Crime', 'Drama', 'Thriller'],
    directors: ['Denis Villeneuve'],
    cast: ['Emily Blunt', 'Benicio del Toro', 'Josh Brolin'],
    runtime: 121,
    rating: 8.0,
    status: 'unseen',
    matchScore: 89,
    quality: '4K UHD HDR'
  },
  {
    id: 'interstellar-2014-plex',
    tmdbId: 157336,
    title: 'Interstellar',
    year: 2014,
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    serverType: 'plex',
    serverName: 'Home Plex (Living Room)',
    itemUrl: 'plex://server/192.168.1.100/metadata/interstellar',
    addedAt: '2026-08-11T20:00:00Z',
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
    directors: ['Christopher Nolan'],
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    runtime: 169,
    rating: 8.7,
    status: 'seen',
    userRating: 10,
    matchScore: 96,
    quality: '4K UHD'
  },
  {
    id: 'drive-2011-jellyfin',
    tmdbId: 64690,
    title: 'Drive',
    year: 2011,
    overview: 'A Hollywood stuntman and getaway driver falls for his neighbor whose husband has just been released from prison, dragging him into the lethal crosshairs of local mobsters.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/602vevufEvEJQqOP0LvgBElhivL.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/7e3b5eF2xJ7Y7e9w7e8r6e5w4e.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=KBiOF3y1W0Y',
    serverType: 'jellyfin',
    serverName: 'Jellyfin Media Lab',
    itemUrl: 'http://192.168.1.150:8096/web/index.html#!/item?id=drive',
    addedAt: '2026-10-10T11:00:00Z',
    genres: ['Drama', 'Crime', 'Thriller'],
    directors: ['Nicolas Winding Refn'],
    cast: ['Ryan Gosling', 'Carey Mulligan', 'Bryan Cranston', 'Albert Brooks'],
    runtime: 100,
    rating: 7.9,
    status: 'unseen',
    matchScore: 88,
    quality: '1080p Remux'
  },
  {
    id: 'children-of-men-2006-plex',
    tmdbId: 9693,
    title: 'Children of Men',
    year: 2006,
    overview: 'In 2027, in a chaotic world in which women have become inexplicably infertile, a former activist agrees to help transport a miraculously pregnant woman to a sanctuary at sea.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/k9bT67u1v9Q5b8A2c1s4d5e6f.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/8u7t6r5e4w3q2a1s.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=2VT2apoX17c',
    serverType: 'plex',
    serverName: 'Home Plex (Living Room)',
    itemUrl: 'plex://server/192.168.1.100/metadata/children-of-men',
    addedAt: '2026-09-18T18:00:00Z',
    genres: ['Drama', 'Action', 'Sci-Fi', 'Thriller'],
    directors: ['Alfonso Cuarón'],
    cast: ['Clive Owen', 'Julianne Moore', 'Chiwetel Ejiofor', 'Michael Caine'],
    runtime: 109,
    rating: 8.1,
    status: 'unseen',
    matchScore: 87,
    quality: '1080p BluRay'
  },
  {
    id: 'stalker-1979-jellyfin',
    tmdbId: 1398,
    title: 'Stalker',
    year: 1979,
    overview: 'Near a nameless city exists the Zone, a strange and forbidden land protected by barbed wire and military sentries. A Stalker guides two clients into the heart of the mysterious sector.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/lUEj5r5r1e7r8w9e0r1e2.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/9y8x7w6v5u4t3s.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Q3hBLv-HCE8',
    serverType: 'jellyfin',
    serverName: 'Jellyfin Media Lab',
    itemUrl: 'http://192.168.1.150:8096/web/index.html#!/item?id=stalker',
    addedAt: '2026-08-20T14:00:00Z',
    genres: ['Sci-Fi', 'Drama', 'Mystery'],
    directors: ['Andrei Tarkovsky'],
    cast: ['Aleksandr Kaydanovskiy', 'Anatoliy Solonitsyn'],
    runtime: 162,
    rating: 8.2,
    status: 'unseen',
    matchScore: 84,
    quality: 'Criterion 1080p'
  }
];

export const INITIAL_GAPS: MovieItem[] = [
  {
    id: 'gap-incendies-2010',
    tmdbId: 46146,
    title: 'Incendies',
    year: 2010,
    overview: 'Twins travel to the Middle East to discover their family roots and fulfill their mother’s last wishes, uncovering devastating truths about war and identity.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/5y7t8r9e0w1q2s3d4f.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/6y7t8r9e0w1q2s3d4f.jpg',
    serverType: 'none',
    serverName: 'Not in your library',
    addedAt: new Date().toISOString(),
    genres: ['Drama', 'Mystery', 'War'],
    directors: ['Denis Villeneuve'],
    cast: ['Lubna Azabal', 'Mélissa Désormeaux-Poulin'],
    runtime: 131,
    rating: 8.3,
    status: 'unseen',
    matchScore: 93
  },
  {
    id: 'gap-se7en-1995',
    tmdbId: 807,
    title: 'Se7en',
    year: 1995,
    overview: 'Two homicide detectives are on a desperate hunt for a serial killer whose crimes are based on the seven deadly sins in a perpetually raining metropolitan nightmare.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/6yoghtyTzxnpBysND4objVJ0fi2.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/9l175w8e9r7t6y5u.jpg',
    serverType: 'none',
    serverName: 'Not in your library',
    addedAt: new Date().toISOString(),
    genres: ['Crime', 'Mystery', 'Thriller'],
    directors: ['David Fincher'],
    cast: ['Brad Pitt', 'Morgan Freeman', 'Gwyneth Paltrow', 'Kevin Spacey'],
    runtime: 127,
    rating: 8.6,
    status: 'unseen',
    matchScore: 91
  },
  {
    id: 'gap-memento-2000',
    tmdbId: 77,
    title: 'Memento',
    year: 2000,
    overview: 'Leonard Shelby, an insurance investigator suffering from anterograde amnesia, uses notes and tattoos to hunt for the man he thinks killed his wife.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/yuNs09hvpHVU1cBTCAk9z9PC2Mm.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/8y7t6r5e4w3q2a1s.jpg',
    serverType: 'none',
    serverName: 'Not in your library',
    addedAt: new Date().toISOString(),
    genres: ['Mystery', 'Thriller'],
    directors: ['Christopher Nolan'],
    cast: ['Guy Pearce', 'Carrie-Anne Moss', 'Joe Pantoliano'],
    runtime: 113,
    rating: 8.4,
    status: 'unseen',
    matchScore: 90
  },
  {
    id: 'gap-stalker-alien-1979',
    tmdbId: 348,
    title: 'Alien',
    year: 1979,
    overview: 'After a space merchant vessel receives an unknown transmission as a distress call, one of the crew is attacked by a mysterious life form and they realize its life cycle has merely begun.',
    posterUrl: 'https://image.tmdb.org/t/p/w780/vfrQk5IPloGg1v9Rzmu2u02i0m9.jpg',
    backdropUrl: 'https://image.tmdb.org/t/p/w1280/AmR3JG1DYz5um6F9MfPeBnk0en5.jpg',
    serverType: 'none',
    serverName: 'Not in your library',
    addedAt: new Date().toISOString(),
    genres: ['Horror', 'Sci-Fi'],
    directors: ['Ridley Scott'],
    cast: ['Sigourney Weaver', 'Tom Skerritt', 'John Hurt'],
    runtime: 117,
    rating: 8.4,
    status: 'unseen',
    matchScore: 89
  }
];

export const DEFAULT_SETTINGS: AppSettings = {
  tmdbApiKey: '',
  geminiApiKey: '',
  soundEnabled: false,
  cinematicMode: true,
  reducedMotion: false,
  autoSyncExtension: true
};

/**
 * Local storage keys & fallback store
 */
const STORAGE_KEYS = {
  MOVIES: 'cinemind_movies',
  TASTE: 'cinemind_taste',
  SERVERS: 'cinemind_servers',
  SETTINGS: 'cinemind_settings',
  GAPS: 'cinemind_gaps'
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
      const rawMovies = data ? JSON.parse(data) : INITIAL_MOVIES;
      return rankMoviesByTaste(rawMovies, taste);
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

  getGaps(): MovieItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GAPS);
      const taste = this.getTaste();
      const rawGaps = data ? JSON.parse(data) : INITIAL_GAPS;
      return rankMoviesByTaste(rawGaps, taste);
    } catch {
      return rankMoviesByTaste(INITIAL_GAPS, DEFAULT_TASTE);
    }
  },

  saveGaps(gaps: MovieItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.GAPS, JSON.stringify(gaps));
    } catch (e) {
      console.warn('Failed to save gaps', e);
    }
  },

  resetAll(): void {
    try {
      localStorage.clear();
    } catch {}
  }
};
