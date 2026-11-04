import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateMovieMatch, rankMoviesByTaste } from './matching';
import { TasteProfile } from '../types';

const sampleTaste: TasteProfile = {
  genres: {
    'Sci-Fi': 5,
    'Thriller': 4,
    'Mystery': 4,
    'Drama': 2,
    'Comedy': 1
  },
  favoriteDirectors: ['Denis Villeneuve', 'Christopher Nolan'],
  favoriteActors: ['Ryan Gosling', 'Florence Pugh'],
  preferredDecades: ['2010s', '2020s'],
  preferredIndustries: ['hollywood', 'tollywood', 'bollywood', 'kollywood'],
  includeIndianCinema: true,
  prioritizeIndianAction: true,
  runtimePreference: 'over120',
  moods: ['atmospheric', 'cerebral'],
  vibes: ['mind-bending', 'cyberpunk', 'slow-burn'],
  favoriteMovies: ['Blade Runner 2049', 'Arrival', 'Interstellar'],
  minRating: 7.0
};

test('calculates high match for matching sci-fi thriller with favorite director', () => {
  const movie = {
    genres: ['Sci-Fi', 'Thriller'],
    directors: ['Denis Villeneuve'],
    cast: ['Ryan Gosling', 'Ana de Armas'],
    runtime: 164,
    rating: 8.4,
    overview: 'A young blade runner discovers a long-buried secret that leads him to track down former blade runner Rick Deckard in a dystopian neon cyberpunk future.'
  };

  const match = calculateMovieMatch(movie, sampleTaste);
  assert.ok(match.total >= 85, `Expected score >= 85, got ${match.total}`);
  assert.ok(match.genreAffinity >= 25, `Expected genreAffinity >= 25, got ${match.genreAffinity}`);
  assert.ok(match.crewAffinity >= 15, `Expected crewAffinity >= 15, got ${match.crewAffinity}`);
  assert.ok(match.vibeAffinity >= 10, `Expected vibeAffinity >= 10, got ${match.vibeAffinity}`);
  assert.equal(match.runtimeFit, 10, `Expected runtimeFit 10 for 164 min with over120 preference`);
  assert.ok(match.matchedReasons.length > 0);
});

test('calculates lower match for unrelated comedy movie', () => {
  const comedyMovie = {
    genres: ['Comedy', 'Romance'],
    directors: ['Unknown Director'],
    cast: ['Random Actor'],
    runtime: 88,
    rating: 6.2,
    overview: 'Two strangers meet at a wedding and get into silly misunderstandings.'
  };

  const match = calculateMovieMatch(comedyMovie, sampleTaste);
  assert.ok(match.total < 60, `Expected score < 60, got ${match.total}`);
});

test('ranks movies properly by taste score', () => {
  const m1: any = {
    id: '1',
    title: 'Blade Runner 2049',
    genres: ['Sci-Fi', 'Mystery'],
    directors: ['Denis Villeneuve'],
    cast: ['Ryan Gosling'],
    runtime: 164,
    rating: 8.4,
    matchScore: 0
  };
  const m2: any = {
    id: '2',
    title: 'Romantic Comedy',
    genres: ['Comedy'],
    directors: ['Other'],
    cast: ['Other'],
    runtime: 85,
    rating: 6.0,
    matchScore: 0
  };

  const ranked = rankMoviesByTaste([m2, m1], sampleTaste);
  assert.equal(ranked[0].id, '1');
  assert.ok(ranked[0].matchScore > ranked[1].matchScore);
});
