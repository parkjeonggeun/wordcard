#!/usr/bin/env node
/**
 * Download number and animal images
 * Numbers: Twemoji PNG from jsDelivr CDN (open source, no auth required)
 * Animals: Wikimedia Commons with proper Referer/headers
 */
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

const ROOT = '/Users/jkpark/wordcard/public/images';

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function download(url, outPath, extraFlags = '') {
  if (existsSync(outPath)) {
    const size = parseInt(execSync(`wc -c < "${outPath}"`).toString().trim());
    if (size > 5000) { console.log(`  ✓ skip (exists ${size}B): ${path.basename(outPath)}`); return true; }
    execSync(`rm -f "${outPath}"`);
  }
  try {
    execSync(
      `curl -sL --retry 3 --max-time 20 -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" -e "https://commons.wikimedia.org/" ${extraFlags} "${url}" -o "${outPath}"`,
      { stdio: 'pipe' }
    );
    const size = parseInt(execSync(`wc -c < "${outPath}"`).toString().trim());
    if (size < 5000) {
      const head = execSync(`head -c 20 "${outPath}" 2>/dev/null || echo ''`).toString();
      console.log(`  ✗ too small (${size}B, starts: ${head.replace(/\n/g, '')}): ${path.basename(outPath)}`);
      execSync(`rm -f "${outPath}"`);
      return false;
    }
    console.log(`  ✓ ${path.basename(outPath)} (${size}B)`);
    return true;
  } catch (e) {
    console.log(`  ✗ failed: ${path.basename(outPath)} — ${e.message.slice(0, 60)}`);
    return false;
  }
}

// ──────────────────────────────────────────────
// NUMBERS — Twemoji PNG from jsDelivr (72x72 emoji images, no auth)
// Keycap digit emojis: U+0031..U+0039 + U+20E3, U+1F51F (keycap 10)
// jsDelivr path: /npm/twemoji@latest/assets/72x72/{codepoint}.png
// ──────────────────────────────────────────────
const CDN = 'https://cdn.jsdelivr.net/npm/twemoji@14.0.2/assets/72x72';

const NUMBERS = [
  { id: 'one',   codepoint: '31-20e3' },   // 1️⃣
  { id: 'two',   codepoint: '32-20e3' },   // 2️⃣
  { id: 'three', codepoint: '33-20e3' },   // 3️⃣
  { id: 'four',  codepoint: '34-20e3' },   // 4️⃣
  { id: 'five',  codepoint: '35-20e3' },   // 5️⃣
  { id: 'six',   codepoint: '36-20e3' },   // 6️⃣
  { id: 'seven', codepoint: '37-20e3' },   // 7️⃣
  { id: 'eight', codepoint: '38-20e3' },   // 8️⃣
  { id: 'nine',  codepoint: '39-20e3' },   // 9️⃣
  { id: 'ten',   codepoint: '1f51f' },     // 🔟
];

// ──────────────────────────────────────────────
// ANIMALS — Wikimedia Commons direct file API (imageinfo)
// Using the Wikimedia REST API to get actual thumb URL
// ──────────────────────────────────────────────
const ANIMALS = [
  { id: 'dog',      url: 'https://upload.wikimedia.org/wikipedia/commons/2/26/YellowLabradorLooking_new.jpg' },
  { id: 'cat',      url: 'https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg' },
  { id: 'rabbit',   url: 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Oryctolagus_cuniculus_Rcdo.jpg' },
  { id: 'lion',     url: 'https://upload.wikimedia.org/wikipedia/commons/7/73/Lion_waiting_in_Namibia.jpg' },
  { id: 'tiger',    url: 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Walking_tiger_female.jpg' },
  { id: 'elephant', url: 'https://upload.wikimedia.org/wikipedia/commons/3/37/African_Bush_Elephant.jpg' },
  { id: 'giraffe',  url: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Giraffe_Mikumi_National_Park.jpg' },
  { id: 'monkey',   url: 'https://upload.wikimedia.org/wikipedia/commons/4/40/Macaca_fuscata_fuscata1.jpg' },
  { id: 'bear',     url: 'https://upload.wikimedia.org/wikipedia/commons/7/71/2010-kodiak-bear-1.jpg' },
  { id: 'pig',      url: 'https://upload.wikimedia.org/wikipedia/commons/1/18/Kulta2.jpg' },
  { id: 'cow',      url: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Cow_female_black_white.jpg' },
  { id: 'horse',    url: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Nokota_Horses_cropped.jpg' },
  { id: 'sheep',    url: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Ovis_aries_flock.jpg' },
  { id: 'duck',     url: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Bucephala-albeola-010.jpg' },
  { id: 'chicken',  url: 'https://upload.wikimedia.org/wikipedia/commons/4/45/GallusGallus.jpg' },
  { id: 'penguin',  url: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Spheniscus_magellanicus_-Saunders_Island%2C_Falkland_Islands-8.jpg' },
];

async function main() {
  ensureDir(`${ROOT}/numbers`);
  ensureDir(`${ROOT}/animals`);

  console.log('\n=== Numbers (Twemoji via jsDelivr) ===');
  let numOk = 0;
  for (const { id, codepoint } of NUMBERS) {
    const url = `${CDN}/${codepoint}.png`;
    const out = `${ROOT}/numbers/${id}.png`;
    // jsDelivr doesn't need special headers
    if (download(url, out, '')) numOk++;
  }

  console.log('\n=== Animals (Wikimedia Commons) ===');
  let aniOk = 0;
  for (const { id, url } of ANIMALS) {
    const out = `${ROOT}/animals/${id}.jpg`;
    if (download(url, out, '-H "Referer: https://en.wikipedia.org/"')) aniOk++;
  }

  console.log(`\nDone: numbers ${numOk}/10, animals ${aniOk}/16`);
}

main().catch(console.error);
