#!/usr/bin/env node
/**
 * Wordcard Image Downloader — Curated Wikimedia Commons URLs
 *
 * All sources: Wikimedia Commons / Wikipedia
 * Licenses: Public Domain, CC BY-SA, CC BY (all free for educational use)
 * Converts to PNG (max 800px) via macOS sips.
 */

import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT    = join(__dirname, '..');
const IMG_DIR = join(ROOT, 'public', 'images');

// ---------------------------------------------------------------------------
// Curated image list — verified Wikimedia Commons URLs
// License info: All CC BY-SA / CC BY / Public Domain ✓
// ---------------------------------------------------------------------------
const IMAGES = [
  // ── Fruits ──────────────────────────────────────────────────────────────
  {
    id: 'apple', category: 'fruits',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Red_Apple.jpg',
    note: 'Public Domain',
  },
  {
    id: 'banana', category: 'fruits',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Banana.arp.750pix.jpg',
    note: 'Public Domain (Evan-Amos)',
  },
  {
    id: 'strawberry', category: 'fruits',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/Strawberries.jpg',
    note: 'CC BY-SA 3.0',
  },
  {
    id: 'grape', category: 'fruits',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Table_grapes_on_white.jpg',
    note: 'CC BY-SA 3.0',
  },
  {
    id: 'watermelon', category: 'fruits',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Watermelon_seedless.jpg',
    note: 'CC BY-SA 3.0',
  },
  {
    id: 'tangerine', category: 'fruits',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/TangerineFruit.jpg',
    note: 'Public Domain',
  },
  {
    id: 'peach', category: 'fruits',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Illustration_Prunus_persica_clean_no_descr.jpg',
    note: 'CC BY-SA 3.0',
  },
  {
    id: 'pineapple', category: 'fruits',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Pineapple.jpg',
    note: 'CC BY-SA 2.0',
  },

  // ── Vegetables ──────────────────────────────────────────────────────────
  {
    id: 'carrot', category: 'vegetables',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Carrot-fb.jpg',
    note: 'CC BY-SA 3.0',
  },
  {
    id: 'tomato', category: 'vegetables',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Tomato_je.jpg',
    note: 'CC BY-SA 3.0',
  },
  {
    id: 'cucumber', category: 'vegetables',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Cucumber.jpg',
    note: 'CC BY-SA 3.0',
  },
  {
    id: 'corn', category: 'vegetables',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Corn_on_the_cob.jpg',
    note: 'CC BY-SA 3.0',
  },
  {
    id: 'onion', category: 'vegetables',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Onion.jpg',
    note: 'CC BY-SA 3.0',
  },
  {
    id: 'potato', category: 'vegetables',
    url: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Potatoes.jpg',
    note: 'Public Domain',
  },
  {
    id: 'broccoli', category: 'vegetables',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Broccoli.jpg',
    note: 'CC BY-SA 2.0',
  },
  {
    id: 'cabbage', category: 'vegetables',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Napa_cabbage.jpg',
    note: 'CC BY-SA 3.0',
  },

  // ── Vehicles ────────────────────────────────────────────────────────────
  {
    id: 'car', category: 'vehicles',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Red_car.jpg',
    note: 'CC BY-SA 3.0',
  },
  {
    id: 'bus', category: 'vehicles',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/84/LTZ1328-19-20241030-160332.jpg',
    note: 'CC BY-SA 4.0',
  },
  {
    id: 'taxi', category: 'vehicles',
    url: 'https://upload.wikimedia.org/wikipedia/commons/0/03/TAXI.jpg',
    note: 'CC BY-SA 3.0',
  },
  {
    id: 'firetruck', category: 'vehicles',
    url: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Dublin_Fire_Brigade_Pump_Ladder_D32.jpg',
    note: 'CC BY-SA 3.0',
  },
  {
    id: 'policecar', category: 'vehicles',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Washington_DC_Metropolitan_Police_Department_Dodge_Charger_No._1605.jpg',
    note: 'Public Domain',
  },
  {
    id: 'ambulance', category: 'vehicles',
    url: 'https://upload.wikimedia.org/wikipedia/commons/c/cd/Stockholm%2C_ambulans%2C_2014%2C_21.jpg',
    note: 'CC BY-SA 4.0',
  },
  {
    id: 'train', category: 'vehicles',
    url: 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Number_4468_Mallard_in_York.jpg',
    note: 'CC BY-SA 3.0',
  },
  {
    id: 'airplane', category: 'vehicles',
    url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/United_Airlines_Boeing_777-200_Meulemans.jpg',
    note: 'CC BY-SA 2.0',
  },
  {
    id: 'helicopter', category: 'vehicles',
    url: 'https://upload.wikimedia.org/wikipedia/commons/7/70/VH-SUF_Taking_Off.jpg',
    note: 'CC BY-SA 4.0',
  },
  {
    id: 'ship', category: 'vehicles',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/66/Icon_of_the_Seas_Puerto_Rico_2025_%28cropped%29.jpg',
    note: 'CC BY-SA 4.0',
  },
  {
    id: 'bicycle', category: 'vehicles',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/41/Left_side_of_Flying_Pigeon.jpg',
    note: 'CC BY-SA 3.0',
  },
  {
    id: 'excavator', category: 'vehicles',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Excavator_Postiguet_Beach_2.jpg',
    note: 'CC BY-SA 3.0',
  },
  {
    id: 'dumptruck', category: 'vehicles',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/11/Freightliner_M2_106_6x4_2014_%2814240376744%29.jpg',
    note: 'CC BY 2.0',
  },
  {
    id: 'tractor', category: 'vehicles',
    url: 'https://upload.wikimedia.org/wikipedia/commons/8/85/Ford_8N.jpg',
    note: 'Public Domain',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function download(url, destPath) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Wordcard-Educational-App/1.0 (toddler flashcard; Wikimedia Commons)' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  await writeFile(destPath, Buffer.from(buf));
}

function sipsConvert(src, dest, maxPx = 800) {
  const r = spawnSync('sips', ['-Z', String(maxPx), '-s', 'format', 'png', src, '--out', dest]);
  return r.status === 0;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('🎴  Wordcard — Curated Image Downloader');
  console.log('📄  Source: Wikimedia Commons (verified free licenses)\n');

  const results = { ok: [], skip: [], fail: [] };

  for (const img of IMAGES) {
    const dir  = join(IMG_DIR, img.category);
    const dest = join(dir, `${img.id}.png`);
    const label = `${img.category}/${img.id}`;

    process.stdout.write(`  ${label.padEnd(24)} `);

    if (existsSync(dest)) {
      console.log('⏭  already exists');
      results.skip.push(img.id);
      continue;
    }

    await mkdir(dir, { recursive: true });

    const ext = img.url.toLowerCase().endsWith('.png') ? '.png' : '.jpg';
    const tmp = join(IMG_DIR, `_tmp_${img.id}${ext}`);

    try {
      await download(img.url, tmp);

      if (ext === '.png') {
        // Resize PNG in place
        sipsConvert(tmp, dest);
        await unlink(tmp).catch(() => {});
      } else {
        // Convert JPEG → PNG
        const ok = sipsConvert(tmp, dest);
        await unlink(tmp).catch(() => {});
        if (!ok) throw new Error('sips failed');
      }

      console.log(`✅  [${img.note}]`);
      results.ok.push(img.id);
    } catch (e) {
      await unlink(tmp).catch(() => {});
      console.log(`❌  ${e.message}`);
      results.fail.push({ id: img.id, err: e.message });
    }

    // Polite delay — Wikimedia fair-use
    await new Promise(r => setTimeout(r, 600));
  }

  // Summary
  console.log('\n' + '─'.repeat(48));
  console.log(`✅  Downloaded : ${results.ok.length}`);
  console.log(`⏭   Skipped   : ${results.skip.length}`);
  console.log(`❌  Failed     : ${results.fail.length}`);
  if (results.fail.length) {
    results.fail.forEach(f => console.log(`    • ${f.id}: ${f.err}`));
  }
  console.log('\n✨  Done');
}

main().catch(e => { console.error(e); process.exit(1); });
