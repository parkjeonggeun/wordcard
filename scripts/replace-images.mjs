#!/usr/bin/env node
/**
 * Replace 16 images with better curated versions.
 * Sources: Flickr CC (commercial use allowed).
 */

import { writeFile, unlink, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMG_DIR   = join(__dirname, '..', 'public', 'images');

const REPLACEMENTS = [
  // ── Fruits ────────────────────────────────────────────────────────────
  {
    id: 'peach', category: 'fruits',
    url: 'https://live.staticflickr.com/65535/53097227971_985867701a_b.jpg',
    note: 'Flickr CC BY — "Peach Isolated On White"',
  },
  {
    id: 'strawberry', category: 'fruits',
    url: 'https://live.staticflickr.com/3811/11902821974_d53e2cb228_b.jpg',
    note: 'Flickr CC BY — single strawberry',
  },
  {
    id: 'tangerine', category: 'fruits',
    url: 'https://live.staticflickr.com/5309/5606507081_98764afebc.jpg',
    note: 'Flickr CC BY — Satsuma Mandarins',
  },
  {
    id: 'watermelon', category: 'fruits',
    url: 'https://live.staticflickr.com/5012/5427691534_4c0420cdc9_b.jpg',
    note: 'Flickr CC BY — Watermelon',
  },

  // ── Vegetables ────────────────────────────────────────────────────────
  {
    id: 'cucumber', category: 'vegetables',
    url: 'https://live.staticflickr.com/2551/3800306463_e726c74801_b.jpg',
    note: 'Flickr CC BY — large cucumber',
  },
  {
    id: 'cabbage', category: 'vegetables',
    url: 'https://live.staticflickr.com/65535/48407634492_5840c3f280_b.jpg',
    note: 'Flickr CC BY — Whole Napa Cabbage for kimchi',
  },
  {
    id: 'broccoli', category: 'vegetables',
    url: 'https://live.staticflickr.com/5055/5478500913_a364fe642e_b.jpg',
    note: 'Flickr CC BY — Broccoli',
  },

  // ── Vehicles ──────────────────────────────────────────────────────────
  {
    id: 'taxi', category: 'vehicles',
    url: 'https://live.staticflickr.com/3514/3180940701_f1039732c7.jpg',
    note: 'Flickr CC BY — New York City Taxi',
  },
  {
    id: 'ambulance', category: 'vehicles',
    url: 'https://live.staticflickr.com/5031/5893752031_c0c8133972_b.jpg',
    note: 'Flickr CC BY — Emergency Ambulance',
  },
  {
    id: 'ship', category: 'vehicles',
    url: 'https://live.staticflickr.com/3374/4575570906_524a8db96d_b.jpg',
    note: 'Flickr CC BY — mv Bretagne ferry side view',
  },
  {
    id: 'bus', category: 'vehicles',
    url: 'https://live.staticflickr.com/40/92406343_d3d2cb762f_b.jpg',
    note: 'Flickr CC BY — School Bus',
  },
  {
    id: 'train', category: 'vehicles',
    url: 'https://live.staticflickr.com/8147/7652752902_c8a0fd6708_b.jpg',
    note: 'Flickr CC BY — Steam locomotive Glenfinnan',
  },
  {
    id: 'policecar', category: 'vehicles',
    url: 'https://live.staticflickr.com/7145/6733692133_3faac54335_b.jpg',
    note: 'Flickr CC BY — Police Cruiser side view',
  },
  {
    id: 'firetruck', category: 'vehicles',
    url: 'https://live.staticflickr.com/3766/14128282778_ec0962f803_b.jpg',
    note: 'Flickr CC BY — American LaFrance Fire Truck',
  },
  {
    id: 'excavator', category: 'vehicles',
    url: 'https://live.staticflickr.com/65535/49901939093_5d4e31e73a_b.jpg',
    note: 'Flickr CC BY — Excavator Construction Machine',
  },
  {
    id: 'dumptruck', category: 'vehicles',
    url: 'https://live.staticflickr.com/7580/15856349052_2622e236c9_b.jpg',
    note: 'Flickr CC BY — Dump Truck',
  },
];

async function download(url, path) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  await writeFile(path, Buffer.from(await res.arrayBuffer()));
}

function sips(src, dest) {
  const r = spawnSync('sips', ['-Z', '800', '-s', 'format', 'png', src, '--out', dest]);
  return r.status === 0;
}

async function main() {
  console.log('🔄  Replacing 16 images\n');
  const ok = [], fail = [];

  for (const img of REPLACEMENTS) {
    const dest = join(IMG_DIR, img.category, `${img.id}.png`);
    const tmp  = join(IMG_DIR, `_tmp_${img.id}.jpg`);
    const label = `${img.category}/${img.id}`;
    process.stdout.write(`  ${label.padEnd(24)} `);

    await mkdir(join(IMG_DIR, img.category), { recursive: true });

    try {
      await download(img.url, tmp);
      const converted = sips(tmp, dest);
      await unlink(tmp).catch(() => {});
      if (!converted) throw new Error('sips failed');
      console.log(`✅  ${img.note}`);
      ok.push(img.id);
    } catch (e) {
      await unlink(tmp).catch(() => {});
      console.log(`❌  ${e.message}`);
      fail.push({ id: img.id, err: e.message });
    }

    await new Promise(r => setTimeout(r, 400));
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`✅  ${ok.length} replaced`);
  console.log(`❌  ${fail.length} failed`);
  if (fail.length) fail.forEach(f => console.log(`    • ${f.id}: ${f.err}`));
}

main().catch(e => { console.error(e); process.exit(1); });
