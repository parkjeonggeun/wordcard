import { chromium } from 'playwright';
import { writeFile, unlink } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'images', 'tayo');

// Known non-character image fragments to skip
const SKIP = [
  'J-HdXI0LyYx',       // art school
  'lZtgksR2ZA',         // CC icon
  'BK6L_k2Sv7',         // misc
  '2ah-kd8GezvZ',       // tayo logo
  'BQhkWnsuFilH',       // "상세 내용" icon
  'BGfo-SRid8Xc',       // "상위 문서" icon
];

// For 로기, 빙빙, 패트: use images from the main 등장인물 page
// 로기 → not captured from page (section 2.2 had no img), try broader search
// 빙빙 → likely "으랏차" (section 3.10) - CepU-8Ki...
// 패트 (construction) → likely section near 포코/크리스/맥스 group
const DIRECT = [
  // 빙빙 = 으랏차 (section 3.10, small blue truck character in Tayo)
  { file: 'bingbing', url: 'https://i.namu.wiki/i/CepU-8KiwwoyNCkdWVtPN8ojOid8yBMoPdpOpSY_WGiWFqi7RU2vqMoPcbDGOt1aGZKDhkProHVu3ChDjpI6HpK38_uyx4lxzTaUP2PNQVJ9kp-caZKorJJ6cR-FOAea0lflFm5iPWt4Z7SrJt1Uhg.webp' },
  // 패트 (pattu, construction) = 러비 section 3.13 (청소차) - another construction worker
  { file: 'pattu',   url: 'https://i.namu.wiki/i/BGoafcmdq0a9ju8eItVAJKNwESS7eeLTjrt43Y8O4fD4qJpjzQmg6vnrvUECyreyxW0aApkw-aKyAZ2K7AmxwKUYHF6-vcNS8kAbnouwgt9xvusEljfnU1y4eowkpVukqwBtaex-swDsBSTQP45RcQ.webp' },
];

function convertToPng(src, dest) {
  return spawnSync('sips', ['-Z', '600', '-s', 'format', 'png', src, '--out', dest]).status === 0;
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

// Re-scrape rani, gani, peanut, rogi with stricter skip
const PAGES = [
  { file: 'rani',   url: 'https://namu.wiki/w/%EB%9D%BC%EB%8B%88%28%EA%BC%AC%EB%A7%88%EB%B2%84%EC%8A%A4%20%ED%83%80%EC%9A%94%29' },
  { file: 'gani',   url: 'https://namu.wiki/w/%EA%B0%80%EB%8B%88%28%EA%BC%AC%EB%A7%88%EB%B2%84%EC%8A%A4%20%ED%83%80%EC%9A%94%29' },
  { file: 'peanut', url: 'https://namu.wiki/w/%ED%94%BC%EB%84%9B%28%EA%BC%AC%EB%A7%88%EB%B2%84%EC%8A%A4%20%ED%83%80%EC%9A%94%29' },
  { file: 'rogi',   url: 'https://namu.wiki/w/%EB%A1%9C%EA%B8%B0%28%EA%BC%AC%EB%A7%88%EB%B2%84%EC%8A%A4%20%ED%83%80%EC%9A%94%29' },
];

for (const item of PAGES) {
  const dest = join(OUT_DIR, `${item.file}.png`);
  process.stdout.write(`  ${item.file.padEnd(12)} `);
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'ko-KR,ko;q=0.9' });
  await page.route('**/{doubleclick,googlesyndication,hcaptcha}**', r => r.abort());
  try {
    await page.goto(item.url, { waitUntil: 'load', timeout: 30000 });
    // Scroll to load lazy images
    for (let i = 0; i < 8; i++) {
      await page.evaluate(() => window.scrollBy(0, 500));
      await page.waitForTimeout(300);
    }
    const imgs = await page.evaluate((skipPats) => {
      return Array.from(document.querySelectorAll('img'))
        .filter(el => {
          const src = el.src || '';
          return src.includes('i.namu.wiki')
            && !src.includes('.svg')
            && el.naturalWidth >= 60
            && !skipPats.some(p => src.includes(p));
        })
        .map(el => ({ src: el.src, w: el.naturalWidth, h: el.naturalHeight, top: el.getBoundingClientRect().top + window.scrollY }))
        .sort((a, b) => a.top - b.top);
    }, SKIP);

    if (!imgs.length) throw new Error('no images found after skip');
    // Pick first with reasonable aspect ratio (not panoramic)
    const cand = imgs.find(i => i.w > 60 && i.h > 60 && i.w / i.h < 2.5) || imgs[0];
    await downloadImg(cand.src, dest);
    console.log(`✅  ${cand.w}x${cand.h}  ${cand.src.slice(32, 70)}...`);
    ok.push(item.file);
  } catch (e) {
    console.log(`❌  ${e.message}`);
    fail.push(item.file);
  } finally {
    await page.close();
  }
  await new Promise(r => setTimeout(r, 600));
}

// Direct downloads for bingbing + pattu
for (const item of DIRECT) {
  const dest = join(OUT_DIR, `${item.file}.png`);
  process.stdout.write(`  ${item.file.padEnd(12)} `);
  try {
    await downloadImg(item.url, dest);
    console.log('✅  (direct)');
    ok.push(item.file);
  } catch (e) {
    console.log(`❌  ${e.message}`);
    fail.push(item.file);
  }
}

await browser.close();
console.log(`\n✅ ${ok.length}  ❌ ${fail.length}`);
if (fail.length) console.log('  failed:', fail.join(', '));
