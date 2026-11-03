import { MovieItem, TasteProfile, MatchBreakdown } from '../types';

/**
 * Calculates a transparent match percentage (0 - 100%) and breakdown
 * between a movie and a user's taste profile.
 */
export function calculateMovieMatch(
  movie: {
    genres?: string[];
    directors?: string[];
    cast?: string[];
    runtime?: number;
    rating?: number;
    year?: number;
    overview?: string;
  },
  taste: TasteProfile
): MatchBreakdown {
  const matchedReasons: string[] = [];

  // 1. Genre Affinity (Max 35 points)
  let genreAffinity = 0;
  const movieGenres = (movie.genres || []).map(g => g.toLowerCase().trim());
  const tasteGenreEntries = Object.entries(taste.genres || {});

  if (tasteGenreEntries.length > 0 && movieGenres.length > 0) {
    let genreScoreSum = 0;
    let matchedGenreCount = 0;

    for (const [tGenre, weight] of tasteGenreEntries) {
      const lowerTGenre = tGenre.toLowerCase().trim();
      const isMatched = movieGenres.some(mg => mg.includes(lowerTGenre) || lowerTGenre.includes(mg));
      if (isMatched) {
        genreScoreSum += Math.min(Math.max(weight, 1), 5); // 1-5 scale
        matchedGenreCount++;
        matchedReasons.push(`Favorite genre: ${tGenre}`);
      }
    }

    if (matchedGenreCount > 0) {
      // 5 weight = max points, scale up to 35
      const avgWeight = genreScoreSum / matchedGenreCount;
      genreAffinity = Math.min(35, Math.round((avgWeight / 5) * 25 + Math.min(matchedGenreCount * 5, 10)));
    }
  } else if (movieGenres.length > 0) {
    genreAffinity = 18; // default baseline
  }

  // 2. Director & Actor Affinity (Max 20 points)
  let crewAffinity = 0;
  const movieDirectors = (movie.directors || []).map(d => d.toLowerCase().trim());
  const movieCast = (movie.cast || []).map(c => c.toLowerCase().trim());

  let directorMatches = 0;
  for (const d of taste.favoriteDirectors || []) {
    const ld = d.toLowerCase().trim();
    if (ld && movieDirectors.some(md => md.includes(ld) || ld.includes(md))) {
      directorMatches++;
      matchedReasons.push(`Directed by ${d}`);
    }
  }

  let actorMatches = 0;
  for (const a of taste.favoriteActors || []) {
    const la = a.toLowerCase().trim();
    if (la && movieCast.some(mc => mc.includes(la) || la.includes(mc))) {
      actorMatches++;
      matchedReasons.push(`Stars ${a}`);
    }
  }

  crewAffinity = Math.min(20, (directorMatches * 12) + (actorMatches * 8));

  // 3. Vibe / Mood Affinity (Max 20 points)
  let vibeAffinity = 0;
  const textCorpus = `${movie.overview || ''} ${(movie.genres || []).join(' ')}`.toLowerCase();
  let vibeMatches = 0;

  const vibeKeywords: Record<string, string[]> = {
    'mind-bending': ['twist', 'reality', 'dream', 'dimension', 'memory', 'psychological', 'puzzle', 'time', 'illusion', 'secret', 'existential'],
    'slow-burn': ['atmospheric', 'meditative', 'deliberate', 'isolated', 'slow', 'tension', 'quiet', 'noir', 'unravel', 'dystopian'],
    'neo-noir': ['detective', 'crime', 'cynical', 'shadow', 'city', 'investigation', 'murder', 'underworld'],
    'adrenaline-rush': ['heist', 'escape', 'action', 'pursuit', 'explosive', 'race', 'agent', 'speed'],
    'feel-good': ['heartwarming', 'comedy', 'friendship', 'uplifting', 'joy', 'charming', 'sweet'],
    'cyberpunk': ['future', 'ai', 'android', 'neon', 'dystopian', 'hacker', 'megacity', 'tech', 'blade runner'],
    'cosmic-horror': ['unknown', 'sanity', 'void', 'alien', 'abyss', 'dread', 'eldritch', 'entity']
  };

  const activeVibes = [...(taste.vibes || []), ...(taste.moods || [])];
  for (const v of activeVibes) {
    const lowerV = v.toLowerCase();
    if (textCorpus.includes(lowerV)) {
      vibeMatches++;
      matchedReasons.push(`Matches "${v}" vibe`);
      continue;
    }
    const keywords = vibeKeywords[lowerV] || [];
    for (const kw of keywords) {
      if (textCorpus.includes(kw)) {
        vibeMatches++;
        matchedReasons.push(`Matches "${v}" vibe`);
        break;
      }
    }
  }

  vibeAffinity = Math.min(20, Math.max(vibeMatches > 0 ? (vibeMatches * 7 + 4) : 0, activeVibes.length === 0 ? 12 : 4));

  // 4. Runtime Fit (Max 10 points)
  let runtimeFit = 5;
  const rt = movie.runtime || 110;
  switch (taste.runtimePreference) {
    case 'under90':
      if (rt <= 95) {
        runtimeFit = 10;
        matchedReasons.push('Under 95 min quick watch');
      } else if (rt <= 110) {
        runtimeFit = 6;
      } else {
        runtimeFit = 2;
      }
      break;
    case '90to120':
      if (rt >= 85 && rt <= 125) {
        runtimeFit = 10;
        matchedReasons.push('Perfect 90-120 min sweet spot');
      } else {
        runtimeFit = 5;
      }
      break;
    case 'over120':
      if (rt >= 120) {
        runtimeFit = 10;
        matchedReasons.push('Immersive epic runtime (2h+)');
      } else {
        runtimeFit = 4;
      }
      break;
    case 'any':
    default:
      runtimeFit = 8;
      break;
  }

  // 5. Community Rating Weight (Max 15 points)
  const rating = movie.rating || 7.0;
  // Scaled from 6.0 - 9.0 to 0 - 15 points
  const communityRating = Math.min(15, Math.max(4, Math.round(((rating - 5.5) / 3.5) * 15)));

  // Total
  const total = Math.min(100, Math.max(10, genreAffinity + crewAffinity + vibeAffinity + runtimeFit + communityRating));

  return {
    genreAffinity,
    crewAffinity,
    vibeAffinity,
    runtimeFit,
    communityRating,
    total,
    matchedReasons: Array.from(new Set(matchedReasons)).slice(0, 4)
  };
}

/**
 * Re-scores and sorts a list of movies based on the user's taste profile.
 */
export function rankMoviesByTaste(movies: MovieItem[], taste: TasteProfile): MovieItem[] {
  return movies.map(movie => {
    const breakdown = calculateMovieMatch(movie, taste);
    return {
      ...movie,
      matchScore: breakdown.total,
      matchBreakdown: breakdown
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}
