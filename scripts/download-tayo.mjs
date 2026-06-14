import { chromium } from 'playwright';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', 'public', 'images', 'tayo');
await mkdir(OUT_DIR, { recursive: true });

// Confirmed image URLs from namu.wiki scraping (heading → character)
const CONFIRMED = [
  { file: 'heart',  url: 'https://i.namu.wiki/i/yoX6d9NUgWdlc04n5bzPHXvKI6Ut8gtTpFAfgsBSL-yQMXW-8c_BXmAbDGEJaj7myBWjtf683Ul5adpAicg7JNdZCmwfl2tHf27W2EFTw3kchtYMmUX9ccwRWwfAZ2So1UGpsqkGSGnVAtA798sHTQ.webp' },
  { file: 'citu',   url: 'https://i.namu.wiki/i/uzFzrG6GdP5B7vhMUzO_r9UqSfPegkwaDH84xf9PdTLd1M1Co3hIhShyHOM6-yG0cqQZ9volIpfdIonQio2n21tWTlQV2gWO_WE_iDAAw3bKyb-ViWBQ93Gd3225hBN_KGzrUbBY9SZpJ-zCZNaeLg.webp' },
  { file: 'pat',    url: 'https://i.namu.wiki/i/2Kg4yhmH-D89q3wAI95UABcI5JPn03VnNaUJoOXtY-1M8twszw5TXJnERGtDvmxKP0Q_KdDIbKn0ncExl_vrspf71dINZQwT17DqXQfSgcByD4eca2KPczvxSg8CNHawK6HHWjTRkQgdsUu01FWECw.webp' },
  { file: 'frank',  url: 'https://i.namu.wiki/i/A1bIJNjvORz7lpB4u4bOBjLBMGttSGNRFq7Vl6fXUHIvbPBDWXENsLW_iM3u3AZfdkb4Cq8hRbcv1mxt4fCQjhBrefwpiD5pMKsYOFCX7ShvA6n1VrxTYKdh0AqJ-t2mfqo0IcKo-pImVSGIwsM8Zg.webp' },
  { file: 'alice',  url: 'https://i.namu.wiki/i/fbcIZYXWTIvHAE7DHZ8IDMQGQbAEyWM57sBjtk2x2RR_5aCwO-wJIs1n4nWl7-5xwH-8XWNtyDdXSZeux3jIIm2wav2gjEhmo5ah43jet9KtJkmBaunzF3vuSXdlZtY_GsS3m91KfaIKPxDy-wSx3Q.webp' },
  { file: 'speed',  url: 'https://i.namu.wiki/i/BiFgLqZWScvNs62XmrsjO_XkK242lD1hyDpja8sQx0lnMb_EqBcpryAd8fAOizFwuyIiAULmjmDh_97gxdTPCcetULlhnaCOcary-KHpCyGCuzrGDR_2ZZG4rL8QyZogPWyFCDLmpVOGTk9Jh3WEfw.webp' },
  { file: 'shiny',  url: 'https://i.namu.wiki/i/xmaCO42IHKj3Z6OZcxLdcRiuebO2VL2LDga-u29jG0vapNSdGZDHrryrxo_IigTcFCVDm2Dvk3M4RzvSN6Fd0DVNFJbfkf8tPa6JCbwPRudk-GfRKuOqz6RSNislUkMVUKR3j8J4e3aud0WlTbhyHg.webp' },
  { file: 'tony',   url: 'https://i.namu.wiki/i/GDfWUW-JuI5hxrVI1Zm4SSxJzt-5_tlTV4IHpMZUNn5_HWXT-_4OuGe4Gam6rwI-nHm9VZPVnUz5nMc3XsU9UqodtNDpYZ15fwjotrxTJX9z1sGA8ke8ZBz_JLoYdWHTzut0qzGOhqNYqPS_OF-QOw.webp' },
  { file: 'toto',   url: 'https://i.namu.wiki/i/lz9nrYAjpMpLxJUim_cMuqEAk9w9ROz4mS9WO1qDvx0x98UohBCfCQioznPEzvBsKtffap53jilSomLqe8ZM_locrlVOK-p2iRlf4FPhQjYSM5WK8f74LzZ29czPrg5fJXKZxJ7cJMDIvab8sZYOcw.webp' },
  { file: 'kinder', url: 'https://i.namu.wiki/i/xtxDJhDGfgA59LKCx0whnrwF_R0OoiIPuaxohchetISW7ODuGDhyuPfrf2q2CjshmCfcZ0aVuc_huiCxdeI78hQhEayhYN7jt0bHGc4pCbRy-KFCh4L6m11r5wRSTBx6bLy3p0Akh7akt_flF895WQ.webp' },
  // Group image for 포코, 크리스, 맥스 — use same image for all three
  { file: 'poco',   url: 'https://i.namu.wiki/i/Fhf-iQo-3eYDEHmcr6bn3DWw9oBwZ5uVvdARiGdPUU8feuX89k0_80jGWTp_p7VRI1iyU5OdU4CNdVRFZYOHv1yvRALgbnx7Y8nCHzp-9F06BJVqYDWYBj1csGSr1cuYgWiFnLywK0SXkC8YGsWf-Q.webp' },
  { file: 'chris',  url: 'https://i.namu.wiki/i/Fhf-iQo-3eYDEHmcr6bn3DWw9oBwZ5uVvdARiGdPUU8feuX89k0_80jGWTp_p7VRI1iyU5OdU4CNdVRFZYOHv1yvRALgbnx7Y8nCHzp-9F06BJVqYDWYBj1csGSr1cuYgWiFnLywK0SXkC8YGsWf-Q.webp' },
  { file: 'max',    url: 'https://i.namu.wiki/i/Fhf-iQo-3eYDEHmcr6bn3DWw9oBwZ5uVvdARiGdPUU8feuX89k0_80jGWTp_p7VRI1iyU5OdU4CNdVRFZYOHv1yvRALgbnx7Y8nCHzp-9F06BJVqYDWYBj1csGSr1cuYgWiFnLywK0SXkC8YGsWf-Q.webp' },
];

// Individual character pages for 타요, 로기, 라니, 가니, 피넛
const PAGES = [
  { file: 'tayo',   url: 'https://namu.wiki/w/%ED%83%80%EC%9A%94%28%EA%BC%AC%EB%A7%88%EB%B2%84%EC%8A%A4%20%ED%83%80%EC%9A%94%29' },
  { file: 'rogi',   url: 'https://namu.wiki/w/%EB%A1%9C%EA%B8%B0%28%EA%BC%AC%EB%A7%88%EB%B2%84%EC%8A%A4%20%ED%83%80%EC%9A%94%29' },
  { file: 'rani',   url: 'https://namu.wiki/w/%EB%9D%BC%EB%8B%88%28%EA%BC%AC%EB%A7%88%EB%B2%84%EC%8A%A4%20%ED%83%80%EC%9A%94%29' },
  { file: 'gani',   url: 'https://namu.wiki/w/%EA%B0%80%EB%8B%88%28%EA%BC%AC%EB%A7%88%EB%B2%84%EC%8A%A4%20%ED%83%80%EC%9A%94%29' },
  { file: 'peanut', url: 'https://namu.wiki/w/%ED%94%BC%EB%84%9B%28%EA%BC%AC%EB%A7%88%EB%B2%84%EC%8A%A4%20%ED%83%80%EC%9A%94%29' },
  { file: 'bingbing', url: 'https://namu.wiki/w/%EB%B9%99%EB%B9%99%28%EA%BC%AC%EB%A7%88%EB%B2%84%EC%8A%A4%20%ED%83%80%EC%9A%94%29' },
  { file: 'pattu',  url: 'https://namu.wiki/w/%ED%8C%A8%ED%8A%B8%28%EA%BC%AC%EB%A7%88%EB%B2%84%EC%8A%A4%20%ED%83%80%EC%9A%94%29' },
];

function convertWebpToPng(src, dest) {
  const r = spawnSync('sips', ['-Z', '600', '-s', 'format', 'png', src, '--out', dest]);
  return r.status === 0;
}

// Download directly from i.namu.wiki
async function downloadDirect(url, destPng) {
  const tmpWebp = destPng.replace('.png', '.webp');
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Referer': 'https://namu.wiki/',
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  await writeFile(tmpWebp, Buffer.from(await res.arrayBuffer()));
  const ok = convertWebpToPng(tmpWebp, destPng);
  try { await import('fs/promises').then(fs => fs.unlink(tmpWebp)); } catch {}
  if (!ok) throw new Error('sips convert failed');
}

// Scrape individual page for first large character image
async function scrapeCharacterPage(pageUrl, browser) {
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'ko-KR,ko;q=0.9' });
  await page.route('**/{doubleclick,googlesyndication,hcaptcha}**', r => r.abort());
  try {
    await page.goto(pageUrl, { waitUntil: 'load', timeout: 30000 });
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, 600));
      await page.waitForTimeout(400);
    }
    const imgs = await page.$$eval('img', els => els
      .filter(e => e.src?.includes('i.namu.wiki') && e.naturalWidth > 100 && !e.src.includes('.svg'))
      .map(e => ({ src: e.src, w: e.naturalWidth, h: e.naturalHeight }))
      .sort((a, b) => (b.w * b.h) - (a.w * a.h))
    );
    return imgs[0]?.src || null;
  } finally {
    await page.close();
  }
}

const browser = await chromium.launch({ headless: true });
const ok = [], fail = [];

// Phase 1: Download confirmed direct URLs
console.log('Phase 1: Downloading confirmed images...\n');
for (const item of CONFIRMED) {
  const dest = join(OUT_DIR, `${item.file}.png`);
  if (existsSync(dest)) { console.log(`  ${item.file.padEnd(10)} ⏭  exists`); ok.push(item.file); continue; }
  process.stdout.write(`  ${item.file.padEnd(10)} `);
  try {
    await downloadDirect(item.url, dest);
    console.log('✅');
    ok.push(item.file);
  } catch (e) {
    console.log(`❌  ${e.message}`);
    fail.push(item.file);
  }
  await new Promise(r => setTimeout(r, 500));
}

// Phase 2: Scrape individual pages
console.log('\nPhase 2: Scraping individual character pages...\n');
for (const item of PAGES) {
  const dest = join(OUT_DIR, `${item.file}.png`);
  if (existsSync(dest)) { console.log(`  ${item.file.padEnd(10)} ⏭  exists`); ok.push(item.file); continue; }
  process.stdout.write(`  ${item.file.padEnd(10)} `);
  try {
    const imgUrl = await scrapeCharacterPage(item.url, browser);
    if (!imgUrl) throw new Error('no image found');
    await downloadDirect(imgUrl, dest);
    console.log(`✅  ${imgUrl.slice(0, 50)}...`);
    ok.push(item.file);
  } catch (e) {
    console.log(`❌  ${e.message}`);
    fail.push(item.file);
  }
  await new Promise(r => setTimeout(r, 800));
}

await browser.close();

console.log('\n' + '─'.repeat(50));
console.log(`✅  ${ok.length} downloaded`);
console.log(`❌  ${fail.length} failed`);
if (fail.length) console.log('    •', fail.join(', '));
console.log('\nFiles:', ok.map(f => `tayo/${f}.png`).join(', '));
