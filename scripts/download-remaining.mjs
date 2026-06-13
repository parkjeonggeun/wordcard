#!/usr/bin/env node
/**
 * Download remaining 13 images via Openverse API (Flickr/free sources)
 * Skips already-downloaded images.
 */

import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT    = join(__dirname, '..');
const IMG_DIR = join(ROOT, 'public', 'images');

const MISSING = [
  // vegetables
  { id: 'carrot',    category: 'vegetables', query: 'carrot vegetable fresh orange' },
  { id: 'broccoli',  category: 'vegetables', query: 'broccoli vegetable green fresh' },
  { id: 'cabbage',   category: 'vegetables', query: 'napa cabbage chinese cabbage' },
  // vehicles
  { id: 'bus',       category: 'vehicles',   query: 'school bus yellow' },
  { id: 'taxi',      category: 'vehicles',   query: 'yellow taxi cab' },
  { id: 'firetruck', category: 'vehicles',   query: 'fire truck engine red' },
  { id: 'policecar', category: 'vehicles',   query: 'police car vehicle' },
  { id: 'ambulance', category: 'vehicles',   query: 'ambulance emergency vehicle white' },
  { id: 'train',     category: 'vehicles',   query: 'steam locomotive train' },
  { id: 'ship',      category: 'vehicles',   query: 'cruise ship vessel' },
  { id: 'bicycle',   category: 'vehicles',   query: 'bicycle bike side view' },
  { id: 'excavator', category: 'vehicles',   query: 'excavator digger yellow' },
  { id: 'tractor',   category: 'vehicles',   query: 'farm tractor red green' },
];

async function searchOpenverse(query) {
  // Try non-Wikimedia sources first (flickr, etc.)
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&license_type=commercial&source=flickr,stocksnap,rawpixel&format=json&page_size=10`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Wordcard-Educational-App/1.0 (toddler flashcard open-source)' },
  });
  if (!res.ok) throw new Error(`Openverse API ${res.status}`);
  const data = await res.json();
  return (data.results ?? []).filter(r => r.url && r.thumbnail);
}

async function searchOpenverseAny(query) {
  // Fallback: any source including Wikimedia
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&license_type=commercial&format=json&page_size=10`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Wordcard-Educational-App/1.0' },
  });
  if (!res.ok) throw new Error(`Openverse API ${res.status}`);
  const data = await res.json();
  // Avoid Wikimedia upload.wikimedia.org since it's rate-limited
  return (data.results ?? []).filter(r => r.url && !r.url.includes('upload.wikimedia.org'));
}

async function download(url, path) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  await writeFile(path, Buffer.from(buf));
}

function sips(src, dest) {
  const r = spawnSync('sips', ['-Z', '800', '-s', 'format', 'png', src, '--out', dest]);
  return r.status === 0;
}

async function main() {
  console.log('🎴  Downloading remaining 13 images via Openverse\n');

  const ok = [], fail = [];

  for (const item of MISSING) {
    const dest = join(IMG_DIR, item.category, `${item.id}.png`);
    const label = `${item.category}/${item.id}`;
    process.stdout.write(`  ${label.padEnd(24)} `);

    if (existsSync(dest)) {
      console.log('⏭  already exists');
      continue;
    }

    await mkdir(join(IMG_DIR, item.category), { recursive: true });

    let results = [];
    try {
      results = await searchOpenverse(item.query);
      if (results.length === 0) {
        results = await searchOpenverseAny(item.query);
      }
    } catch (e) {
      console.log(`❌  search error: ${e.message}`);
      fail.push(item.id);
      await new Promise(r => setTimeout(r, 1000));
      continue;
    }

    if (results.length === 0) {
      console.log('❌  no results');
      fail.push(item.id);
      await new Promise(r => setTimeout(r, 500));
      continue;
    }

    // Pick first result
    const best = results[0];
    // Use full-size URL; fall back to thumbnail
    const imgUrl = best.url;

    const tmp = join(IMG_DIR, `_tmp_${item.id}.jpg`);
    try {
      await download(imgUrl, tmp);
      const ok2 = sips(tmp, dest);
      await unlink(tmp).catch(() => {});
      if (!ok2) throw new Error('sips convert failed');

      const license = best.license ?? '';
      const src = best.source ?? '';
      console.log(`✅  [${license}] ${src}`);
      ok.push(item.id);
    } catch (e) {
      await unlink(tmp).catch(() => {});
      console.log(`❌  ${e.message}`);
      fail.push(item.id);
    }

    await new Promise(r => setTimeout(r, 1200));
  }

  console.log('\n' + '─'.repeat(48));
  console.log(`✅  ${ok.length} downloaded`);
  console.log(`❌  ${fail.length} failed`);
  if (fail.length) console.log('    •', fail.join(', '));
}

main().catch(e => { console.error(e); process.exit(1); });
