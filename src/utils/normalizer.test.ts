import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanMovieTitle, normalizeMoviePayload, deduplicateMovies } from './normalizer';

test('cleanMovieTitle extracts title and year from release filenames', () => {
  const result1 = cleanMovieTitle('Dune.Part.Two.2024.2160p.UHD.HDR.BluRay.x265.mkv');
  assert.equal(result1.title, 'Dune Part Two');
  assert.equal(result1.year, 2024);

  const result2 = cleanMovieTitle('Oppenheimer (2023) [1080p] [WEBRip]');
  assert.equal(result2.title, 'Oppenheimer');
  assert.equal(result2.year, 2023);

  const result3 = cleanMovieTitle('The Matrix');
  assert.equal(result3.title, 'The Matrix');
});

test('normalizeMoviePayload standardizes media server data', () => {
  const item = normalizeMoviePayload({
    title: 'Interstellar.2014.1080p',
    genres: 'Sci-Fi, Adventure, Drama',
    runtime: '169 min',
    rating: '8.7',
    serverType: 'plex',
    serverName: 'Living Room Plex'
  });

  assert.equal(item.title, 'Interstellar');
  assert.equal(item.year, 2014);
  assert.equal(item.serverType, 'plex');
  assert.equal(item.runtime, 169);
  assert.equal(item.rating, 8.7);
  assert.deepEqual(item.genres, ['Sci-Fi', 'Adventure', 'Drama']);
});

test('deduplicateMovies merges identical titles and preserves sources', () => {
  const m1: any = {
    id: 'm1',
    title: 'Inception',
    year: 2010,
    serverType: 'plex',
    serverName: 'Home Plex',
    genres: ['Action', 'Sci-Fi'],
    posterUrl: 'url1'
  };
  const m2: any = {
    id: 'm2',
    title: 'Inception',
    year: 2010,
    serverType: 'jellyfin',
    serverName: 'Jellyfin Lab',
    genres: ['Action', 'Sci-Fi', 'Thriller'],
    posterUrl: 'url2',
    backdropUrl: 'backdrop2'
  };

  const deduped = deduplicateMovies([m1, m2]);
  assert.equal(deduped.length, 1);
  assert.ok(deduped[0].serverName.includes('Home Plex'));
  assert.ok(deduped[0].serverName.includes('Jellyfin Lab'));
  assert.equal(deduped[0].backdropUrl, 'backdrop2');
});
