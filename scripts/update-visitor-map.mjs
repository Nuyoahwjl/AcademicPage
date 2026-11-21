import { readFile, mkdir, writeFile, rename, appendFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const scope = 'Distinct places accumulated from dashboard map snapshots; not verified all-time coverage.';

function coordinates(lat, lon) {
  return Number.isFinite(lat) && Math.abs(lat) <= 90 && Number.isFinite(lon) && Math.abs(lon) <= 180;
}

export function mergeLocations(previous, pins) {
  if (!Array.isArray(previous)) throw new Error('Invalid saved locations.');
  if (!Array.isArray(pins) || !pins.length) throw new Error('No location records returned; preserving saved places.');
  const grouped = new Map();
  function add(lat, lon, names) {
    if (!coordinates(lat, lon)) throw new Error('Invalid coordinates; preserving saved places.');
    const key = `${lat},${lon}`;
    const location = grouped.get(key) || { lat, lon, places: new Set() };
    names.forEach(name => location.places.add(name));
    grouped.set(key, location);
  }
  for (const location of previous) {
    if (!location || !Array.isArray(location.places) || !location.places.length ||
      !location.places.every(name => typeof name === 'string' && name.trim())) throw new Error('Invalid saved place labels.');
    add(location.lat, location.lon, location.places);
  }
  for (const pin of pins) {
    if (!pin || pin.lat == null || pin.lon == null ||
      !['number', 'string'].includes(typeof pin.lat) || !['number', 'string'].includes(typeof pin.lon) ||
      String(pin.lat).trim() === '' || String(pin.lon).trim() === '') throw new Error('Missing coordinates; preserving saved places.');
    const name = `${String(pin.city || 'Unknown city').trim()}, ${String(pin.country_code || 'Unknown country').trim()}`;
    add(Number(pin.lat), Number(pin.lon), [name]);
  }
  return [...grouped.values()].map(({ lat, lon, places }) => ({ lat, lon, places: [...places].sort() }))
    .sort((a, b) => a.lon - b.lon || a.lat - b.lat);
}

export async function updateVisitorMap({ root = new URL('../', import.meta.url), fetchImpl = fetch, now = () => new Date() } = {}) {
  const include = await readFile(new URL('_includes/visitor-map.html', root), 'utf8');
  const siteId = JSON.parse(include.match(/<script id="_waurx1"[^>]*>([^<]+)<\/script>/)[1]).id;
  const destination = new URL('assets/data/visitor-map.json', root);
  let previous;
  try { previous = JSON.parse(await readFile(destination, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (previous !== undefined && (!previous || previous.siteId !== siteId || !Array.isArray(previous.locations) ||
    previous.locationCount !== previous.locations.length || typeof previous.fetchedAt !== 'string' || !Number.isFinite(Date.parse(previous.fetchedAt)))) {
    throw new Error('Saved map belongs to another site or has invalid metadata.');
  }
  const source = `https://whos.amung.us/stats/data/?k=${encodeURIComponent(siteId)}&pins=old`;
  const response = await fetchImpl(source, {
    headers: { 'X-Requested-With': 'XMLHttpRequest' }, signal: AbortSignal.timeout(30000)
  });
  if (!response.ok) throw new Error(`Dashboard returned HTTP ${response.status}`);
  const data = await response.json();
  const locations = mergeLocations(previous?.locations || [], data.pins);
  // Preserve the file and timestamp when no new coordinate or label appears.
  if (previous && JSON.stringify(locations) === JSON.stringify(previous.locations)) {
    return { changed: false, locationCount: locations.length };
  }
  const fetchedAt = now().toISOString();
  const snapshot = {
    siteId, source, fetchedAt, firstFetchedAt: previous?.firstFetchedAt || previous?.fetchedAt || fetchedAt,
    scope, locationCount: locations.length, locations
  };
  await mkdir(new URL('assets/data/', root), { recursive: true });
  const temporary = new URL('assets/data/visitor-map.json.tmp', root);
  await writeFile(temporary, JSON.stringify(snapshot, null, 2) + '\n');
  await rename(temporary, destination);
  return { changed: true, locationCount: locations.length };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await updateVisitorMap();
  if (process.env.GITHUB_OUTPUT) await appendFile(process.env.GITHUB_OUTPUT, `changed=${result.changed}\n`);
  console.log(`${result.changed ? 'Updated' : 'Unchanged'}: ${result.locationCount} distinct coordinates.`);
}
