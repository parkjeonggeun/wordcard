import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setExtraHTTPHeaders({ 'Accept-Language': 'ko-KR,ko;q=0.9' });
await page.route('**/{doubleclick,googlesyndication,adsbygoogle,hcaptcha}**', r => r.abort());

await page.goto(
  'https://namu.wiki/w/%EA%BC%AC%EB%A7%88%EB%B2%84%EC%8A%A4%20%ED%83%80%EC%9A%94/%EB%93%B1%EC%9E%A5%EC%9D%B8%EB%AC%BC?uuid=bc6c74ee-2ef0-4ea7-884f-34e941ca0d3e',
  { waitUntil: 'load', timeout: 60000 }
);

// Scroll down slowly to trigger lazy loading
for (let i = 0; i < 20; i++) {
  await page.evaluate((step) => window.scrollBy(0, step), 800);
  await page.waitForTimeout(300);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1000);

const results = await page.evaluate(() => {
  // Get all headings and images in document order with their positions
  const allEls = Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6,img'));
  
  let lastHeading = '';
  const out = [];
  
  for (const el of allEls) {
    if (el.tagName.startsWith('H')) {
      lastHeading = el.innerText?.trim().replace(/\s+/g, ' ') || '';
    } else if (el.tagName === 'IMG') {
      const src = el.src || el.getAttribute('data-src') || '';
      if (!src || src.startsWith('data:image/svg')) continue;
      
      // Get caption or nearby text
      let caption = el.alt || '';
      if (!caption) {
        let p = el.parentElement;
        for (let i = 0; i < 6; i++) {
          if (!p) break;
          const t = p.innerText?.trim().replace(/\s+/g, ' ').slice(0, 100);
          if (t && t.length > 2) { caption = t; break; }
          p = p.parentElement;
        }
      }
      
      out.push({
        heading: lastHeading.slice(0, 60),
        caption: caption.slice(0, 80),
        src,
        w: el.naturalWidth,
        h: el.naturalHeight,
      });
    }
  }
  return out;
});

const skip = ['doubleclick','googlesyndication','espejo','favicon','google','hcaptcha','svg+xml'];
for (const r of results) {
  if (!r.src || skip.some(s => r.src.includes(s))) continue;
  if (r.src.includes('i.namu.wiki')) {
    console.log(`${r.w}x${r.h}\t[${r.heading}]\t${r.caption.slice(0,60)}\t${r.src}`);
  }
}

await browser.close();
