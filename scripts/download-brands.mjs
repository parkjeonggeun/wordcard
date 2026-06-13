#!/usr/bin/env node
/**
 * Download brand logo SVGs from Wikimedia Commons and convert to PNG.
 */

import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMG_DIR = join(__dirname, '..', 'public', 'images', 'brands');

const BRANDS = [
  {
    id: 'nike',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
  },
  {
    id: 'adidas',
    url: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Adidas_2022_logo.svg',
  },
  {
    id: 'newbalance',
    url: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/New_Balance_logo.svg',
  },
  {
    id: 'starbucks',
    url: 'https://upload.wikimedia.org/wikipedia/en/d/d3/Starbucks_Corporation_Logo_2011.svg',
    fallback: 'https://upload.wikimedia.org/wikipedia/commons/3/35/Starbucks_Coffee_Logo.svg',
  },
  {
    id: 'mercedes',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Benz_Logo_2010.svg',
    fallback: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Mercedes-Benz_Star_%281969-1986%2C_2025-%29.svg',
  },
  {
    id: 'bmw',
    url: 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW.svg',
    fallback: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Logo_BMW_Group_2021.svg',
  },
  {
    id: 'audi',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/92/Audi-Logo_2016.svg',
  },
  {
    id: 'tesla',
    url: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg',
  },
  {
    id: 'genesis',
    url: 'https://upload.wikimedia.org/wikipedia/en/8/83/Genesis_division_emblem.svg',
    fallback: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Genesis_motors_logo.svg',
  },
];

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
};

async function download(url, path) {
  const res = await fetch(url, { headers: HEADERS, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  const buf = await res.arrayBuffer();
  await writeFile(path, Buffer.from(buf));
}

function convertToPng(src, dest) {
  const r = spawnSync('sips', ['-Z', '800', '-s', 'format', 'png', src, '--out', dest]);
  if (r.status !== 0) {
    console.error('sips stderr:', r.stderr?.toString());
  }
  return r.status === 0;
}

async function main() {
  await mkdir(IMG_DIR, { recursive: true });
  console.log('🏷️  Downloading brand logos\n');

  const ok = [], fail = [];

  for (const brand of BRANDS) {
    const dest = join(IMG_DIR, `${brand.id}.png`);
    const tmp = join(IMG_DIR, `_tmp_${brand.id}.svg`);
    process.stdout.write(`  ${brand.id.padEnd(16)} `);

    if (existsSync(dest)) {
      console.log('⏭  already exists');
      ok.push(brand.id);
      continue;
    }

    const urls = [brand.url, brand.fallback].filter(Boolean);
    let downloaded = false;

    for (const url of urls) {
      try {
        await download(url, tmp);
        downloaded = true;
        break;
      } catch (e) {
        process.stdout.write(`(retry) `);
      }
    }

    if (!downloaded) {
      console.log('❌  all URLs failed');
      fail.push(brand.id);
      continue;
    }

    const converted = convertToPng(tmp, dest);
    await unlink(tmp).catch(() => {});

    if (!converted) {
      console.log('❌  sips convert failed');
      fail.push(brand.id);
      continue;
    }

    console.log('✅');
    ok.push(brand.id);
    await new Promise(r => setTimeout(r, 600));
  }

  console.log('\n' + '─'.repeat(40));
  console.log(`✅  ${ok.length} done`);
  console.log(`❌  ${fail.length} failed`);
  if (fail.length) console.log('    •', fail.join(', '));
}

main().catch(e => { console.error(e); process.exit(1); });
