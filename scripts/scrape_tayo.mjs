import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.setExtraHTTPHeaders({
  'Accept-Language': 'ko-KR,ko;q=0.9',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
});

// Block ads to speed up load
await page.route('**/{doubleclick,googlesyndication,adsbygoogle}**', r => r.abort());

await page.goto(
  'https://namu.wiki/w/%EA%BC%AC%EB%A7%88%EB%B2%84%EC%8A%A4%20%ED%83%80%EC%9A%94/%EB%93%B1%EC%9E%A5%EC%9D%B8%EB%AC%BC?uuid=bc6c74ee-2ef0-4ea7-884f-34e941ca0d3e',
  { waitUntil: 'load', timeout: 60000 }
);

// Wait a bit for dynamic content
await page.waitForTimeout(3000);

const results = await page.evaluate(() => {
  const imgs = Array.from(document.querySelectorAll('img'));
  return imgs.map(img => {
    let el = img;
    let context = '';
    for (let i = 0; i < 8; i++) {
      el = el.parentElement;
      if (!el) break;
      const t = el.innerText?.slice(0, 80).trim().replace(/\s+/g, ' ');
      if (t && t.length > 1) { context = t; break; }
    }
    return { src: img.src, alt: img.alt, w: img.naturalWidth, h: img.naturalHeight, context };
  });
});

const skip = ['doubleclick','googlesyndication','namu.wiki/favicon','google','hcaptcha'];
for (const r of results) {
  if (r.src && !skip.some(s => r.src.includes(s))) {
    console.log(`${r.w}x${r.h}\t${r.alt||'-'}\t${r.context.slice(0,50)}\t${r.src}`);
  }
}

await browser.close();
