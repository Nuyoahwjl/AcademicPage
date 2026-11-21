import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, basename, dirname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { mergeLocations, updateVisitorMap } from './update-visitor-map.mjs';

const saved = [{ lat: 30, lon: 110, places: ['Saved city, CN'] }];
const now = () => new Date('2026-11-23T02:00:00.000Z');
const response = pins => async () => ({ ok: true, json: async () => ({ pins }) });

async function fixture(t, snapshot = { siteId: 'example', fetchedAt: '2026-11-21T00:00:00.000Z', locationCount: 1, locations: saved }) {
  const directory = await mkdtemp(join(tmpdir(), 'academicpage-map-'));
  const root = pathToFileURL(directory + sep);
  await mkdir(new URL('_includes/', root));
  await mkdir(new URL('assets/data/', root), { recursive: true });
  await writeFile(new URL('_includes/visitor-map.html', root), '<script id="_waurx1" type="application/json">{"id":"example"}</script>');
  const file = new URL('assets/data/visitor-map.json', root);
  if (snapshot !== null) await writeFile(file, JSON.stringify(snapshot));
  t.after(async () => {
    // Delete only the test directory created immediately above.
    assert.equal(dirname(resolve(directory)), resolve(tmpdir()));
    assert.ok(basename(directory).startsWith('academicpage-map-'));
    await rm(directory, { recursive: true, force: true });
  });
  return { root, file };
}

test('adds new places once while retaining saved places absent from the response', () => {
  const pins = [
    { lat: '40', lon: '-70', city: 'New city', country_code: 'US' },
    { lat: 40, lon: -70, city: 'New city', country_code: 'US' },
    { lat: 30, lon: 110, city: 'Alias', country_code: 'CN' }
  ];
  const original = structuredClone(saved);
  assert.deepEqual(mergeLocations(saved, pins), [
    { lat: 40, lon: -70, places: ['New city, US'] },
    { lat: 30, lon: 110, places: ['Alias, CN', 'Saved city, CN'] }
  ]);
  assert.deepEqual(saved, original);
});

test('rejects empty responses and invalid coordinates rather than replacing history', () => {
  for (const pins of [null, [], [{ lat: null, lon: 1 }], [{ lat: ' ', lon: 1 }], [{ lat: false, lon: 1 }],
    [{ lat: 91, lon: 1 }], [{ lat: 1, lon: -181 }], [{ lat: 'Infinity', lon: 1 }]]) {
    assert.throws(() => mergeLocations(saved, pins));
  }
  assert.throws(() => mergeLocations([{ lat: 30, lon: 110, places: [] }], [{ lat: 1, lon: 1 }]));
});

test('writes a merged snapshot and preserves its first observation date', async t => {
  const { root, file } = await fixture(t);
  const result = await updateVisitorMap({ root, now, fetchImpl: response([{ lat: 40, lon: -70, city: 'New city', country_code: 'US' }]) });
  assert.deepEqual(result, { changed: true, locationCount: 2 });
  const snapshot = JSON.parse(await readFile(file, 'utf8'));
  assert.equal(snapshot.firstFetchedAt, '2026-11-21T00:00:00.000Z');
  assert.equal(snapshot.fetchedAt, now().toISOString());
  assert.deepEqual(snapshot.locations[1], saved[0]);
  assert.equal('recordCount' in snapshot, false);
  assert.ok(snapshot.locations.every(location => !('count' in location)));
});

test('unchanged places preserve the exact file and timestamp', async t => {
  const { root, file } = await fixture(t);
  const before = await readFile(file, 'utf8');
  const result = await updateVisitorMap({ root, now: () => { throw new Error('Must not update time'); }, fetchImpl: response([
    { lat: 30, lon: 110, city: 'Saved city', country_code: 'CN' },
    { lat: 30, lon: 110, city: 'Saved city', country_code: 'CN' }
  ]) });
  assert.equal(result.changed, false);
  assert.equal(await readFile(file, 'utf8'), before);
});

test('failed requests, malformed JSON, and empty data preserve the saved file', async t => {
  const { root, file } = await fixture(t);
  const before = await readFile(file, 'utf8');
  for (const fetchImpl of [
    async () => { throw new Error('Network failure'); },
    async () => ({ ok: false, status: 503 }),
    async () => ({ ok: true, json: async () => { throw new Error('Malformed JSON'); } }),
    response([]), response([{ lat: null, lon: 0 }])
  ]) {
    await assert.rejects(updateVisitorMap({ root, now, fetchImpl }));
    assert.equal(await readFile(file, 'utf8'), before);
  }
});

test('rejects a saved snapshot for another site', async t => {
  const { root, file } = await fixture(t, { siteId: 'other', fetchedAt: now().toISOString(), locationCount: 1, locations: saved });
  const before = await readFile(file, 'utf8');
  await assert.rejects(updateVisitorMap({ root, now, fetchImpl: response([{ lat: 1, lon: 1 }]) }));
  assert.equal(await readFile(file, 'utf8'), before);
});

test('creates the first snapshot when no saved map exists', async t => {
  const { root, file } = await fixture(t, null);
  const result = await updateVisitorMap({ root, now, fetchImpl: response([{ lat: 0, lon: 0, city: 'Origin', country_code: 'XX' }]) });
  assert.equal(result.changed, true);
  const snapshot = JSON.parse(await readFile(file, 'utf8'));
  assert.equal(snapshot.firstFetchedAt, snapshot.fetchedAt);
  assert.deepEqual(snapshot.locations, [{ lat: 0, lon: 0, places: ['Origin, XX'] }]);
});
