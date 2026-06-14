import { chromium } from 'playwright';
import { writeFile, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'images', 'tayo');

// Re-scrape: pick first image that appears in the article BEFORE any section heading
// (character infobox image is always above the content)
const TARGETS = [
  { file: 'rani',    url: 'https://namu.wiki/w/%EB%9D%BC%EB%8B%88%28%EA%BC%AC%EB%A7%88%EB%B2%84%EC%8A%A4%20%ED%83%80%EC%9A%94%29' },
  { file: 'gani',    url: 'https://namu.wiki/w/%EA%B0%80%EB%8B%88%28%EA%BC%AC%EB%A7%88%EB%B2%84%EC%8A%A4%20%ED%83%80%EC%9A%94%29' },
  { file: 'peanut',  url: 'https://namu.wiki/w/%ED%94%BC%EB%84%9B%28%EA%BC%AC%EB%A7%88%EB%B2%84%EC%8A%A4%20%ED%83%80%EC%9A%94%29' },
  { file: 'rogi',    url: 'https://namu.wiki/w/%EB%A1%9C%EA%B8%B0%28%EA%BC%AC%EB%A7%88%EB%B2%84%EC%8A%A4%20%ED%83%80%EC%9A%94%29' },
  { file: 'bingbing',url: 'https://namu.wiki/w/%EB%B9%99%EB%B9%99%28%EA%BC%AC%EB%A7%88%EB%B2%84%EC%8A%A4%20%ED%83%80%EC%9A%94%29' },
  { file: 'pattu',   url: 'https://namu.wiki/w/%ED%8C%A8%ED%8A%B8%28%EA%BC%AC%EB%A7%88%EB%B2%84%EC%8A%A4%20%ED%83%80%EC%9A%94%29' },
];

// art school / unrelated large images to skip
const SKIP_PATTERNS = ['J-HdXI0LyYx', 'lZtgksR2ZA', 'BK6L_k2Sv7'];

function convertToPng(src, dest) {
  const r = spawnSync('sips', ['-Z', '600', '-s', 'format', 'png', src, '--out', dest]);
  return r.status === 0;
}

async function downloadImg(url, destPng) {
  const tmp = destPng.replace('.png', '_tmp.webp');
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://namu.wiki/' }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  await writeFile(tmp, Buffer.from(await res.arrayBuffer()));
  const ok = convertToPng(tmp, destPng);
  await unlink(tmp).catch(() => {});
  if (!ok) throw new Error('sips failed');
}

const browser = await chromium.launch({ headless: true });
const ok = [], fail = [];

for (const item of TARGETS) {
  const dest = join(OUT_DIR, `${item.file}.png`);
  process.stdout.write(`  ${item.file.padEnd(12)} `);
  
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'ko-KR,ko;q=0.9' });
  await page.route('**/{doubleclick,googlesyndication,hcaptcha}**', r => r.abort());
  
  try {
    await page.goto(item.url, { waitUntil: 'load', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    // Get all images in document order with position info
    const imgs = await page.evaluate((skipPats) => {
      const els = Array.from(document.querySelectorAll('img'));
      return els.map(el => ({
        src: el.src || '',
        w: el.naturalWidth,
        h: el.naturalHeight,
        top: el.getBoundingClientRect().top + window.scrollY,
        alt: el.alt || '',
      })).filter(i =>
        i.src.includes('i.namu.wiki') &&
        !i.src.includes('.svg') &&
        i.w >= 80 &&
        !skipPats.some(p => i.src.includes(p))
      ).sort((a, b) => a.top - b.top); // sort by vertical position, top = first
    }, SKIP_PATTERNS);
    
    if (imgs.length === 0) throw new Error('no images found');
    
    // Pick first image that looks like a character (not too wide/narrow)
    const candidate = imgs.find(i => i.w > 80 && i.h > 80 && i.w / i.h < 3) || imgs[0];
    
    await downloadImg(candidate.src, dest);
    console.log(`✅  ${candidate.w}x${candidate.h}  ${candidate.src.slice(32, 70)}...`);
    ok.push(item.file);
  } catch (e) {
    console.log(`❌  ${e.message}`);
    fail.push(item.file);
  } finally {
    await page.close();
  }
  await new Promise(r => setTimeout(r, 800));
}

await browser.close();
console.log(`\n✅ ${ok.length}  ❌ ${fail.length}`);
if (fail.length) console.log('  failed:', fail.join(', '));
