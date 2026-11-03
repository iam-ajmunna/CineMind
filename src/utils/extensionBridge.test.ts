import test from 'node:test';
import assert from 'node:assert';
import fs from 'fs';
import path from 'path';

test('Manifest V3 configuration is valid with no invalid match patterns', () => {
  const manifestPath = path.resolve(process.cwd(), 'extension/manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'manifest.json must exist');

  const content = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  assert.strictEqual(content.manifest_version, 3, 'Must be Manifest V3');
  assert.strictEqual(content.background.service_worker, 'background.js');
  assert.ok(content.permissions.includes('storage'), 'Storage permission required');
  assert.ok(content.host_permissions.includes('<all_urls>'), 'Host permissions required');

  // Verify externally_connectable does not contain wildcard ports
  if (content.externally_connectable?.matches) {
    for (const match of content.externally_connectable.matches) {
      assert.ok(!match.includes(':*'), `Invalid wildcard port pattern in manifest: ${match}`);
    }
  }
});

test('Catalog Engine local dataset contains curated movies with ratings and votes', () => {
  const catalogPath = path.resolve(process.cwd(), 'public/data/imdb-catalog.json');
  assert.ok(fs.existsSync(catalogPath), 'imdb-catalog.json must exist');

  const data = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  assert.ok(Array.isArray(data.movies), 'Catalog must contain a movies array');
  assert.ok(data.movies.length > 20, 'Catalog should contain substantial curated titles');

  // Check structure of first item
  const first = data.movies[0];
  assert.ok(first.title, 'Movie must have a title');
  assert.ok(typeof first.year === 'number', 'Movie must have a year');
  assert.ok(typeof first.rating === 'number', 'Movie must have a rating');
  assert.ok(Array.isArray(first.genres), 'Movie must have genres');
});

test('Extension scripts contain zero TypeScript syntax annotations', () => {
  const files = ['extension/background.js', 'extension/content.js', 'extension/popup/popup.js'];
  for (const file of files) {
    const fullPath = path.resolve(process.cwd(), file);
    const code = fs.readFileSync(fullPath, 'utf-8');
    // Verify no typecast "as HTMLElement" or type annotations ": string"
    assert.doesNotMatch(code, /\bas\s+(HTMLElement|HTMLAnchorElement|ShadowRoot)\b/, `${file} must not contain TypeScript "as Type"`);
    assert.doesNotMatch(code, /\bconst\s+\w+\s*:\s*(string|number|boolean|any)\b/, `${file} must not contain TS variable annotations`);
  }
});
