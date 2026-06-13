import { test, expect, type Page } from '@playwright/test';

// Stub Web Speech API and AudioContext before each test
async function stubBrowserAPIs(page: Page) {
  await page.addInitScript(() => {
    // SpeechSynthesis stub
    const utterances: SpeechSynthesisUtterance[] = [];
    const mockSynth: SpeechSynthesis = {
      speak: (u) => {
        utterances.push(u);
        setTimeout(() => u.onend?.(new SpeechSynthesisEvent('end', { utterance: u })), 100);
      },
      cancel: () => {},
      pause: () => {},
      resume: () => {},
      getVoices: () => [
        { lang: 'ko-KR', name: 'Korean', default: true, localService: true, voiceURI: 'ko-KR' } as SpeechSynthesisVoice,
        { lang: 'en-US', name: 'English US', default: false, localService: true, voiceURI: 'en-US' } as SpeechSynthesisVoice,
      ],
      pending: false,
      speaking: false,
      paused: false,
      onvoiceschanged: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    };
    Object.defineProperty(window, 'speechSynthesis', { value: mockSynth, writable: true });

    // AudioContext stub
    class MockAudioContext {
      state = 'running';
      currentTime = 0;
      destination = {};
      createOscillator() {
        return { connect: () => {}, start: () => {}, stop: () => {}, frequency: { value: 0 }, type: 'sine', onended: null };
      }
      createGain() {
        return {
          connect: () => {},
          gain: { setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
        };
      }
      resume() { return Promise.resolve(); }
    }
    // @ts-ignore
    window.AudioContext = MockAudioContext;
  });
}

test.beforeEach(async ({ page }) => {
  await stubBrowserAPIs(page);
});

// ──────────────────────────────────────────────
// 1. 메인 화면 진입
// ──────────────────────────────────────────────
test('메인 화면 — 카테고리 3개가 보인다', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('낱말 카드')).toBeVisible();
  await expect(page.getByRole('link', { name: /과일/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /채소/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /탈것/ })).toBeVisible();
});

// ──────────────────────────────────────────────
// 2. 과일 카드 진입
// ──────────────────────────────────────────────
test('과일 카테고리 진입 — 카드가 표시된다', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /과일/ }).click();
  await page.waitForURL('/fruits');

  // 진행률 표시 확인 (1 / 8)
  await expect(page.getByText(/1\s*\/\s*8/)).toBeVisible();

  // 홈 버튼 존재
  await expect(page.getByRole('button', { name: '홈으로' })).toBeVisible();
});

// ──────────────────────────────────────────────
// 3. 다음 버튼
// ──────────────────────────────────────────────
test('다음 버튼 — 카드 인덱스가 증가한다', async ({ page }) => {
  await page.goto('/fruits');
  await expect(page.getByText(/1\s*\/\s*8/)).toBeVisible();

  await page.getByRole('button', { name: '다음 카드' }).click();
  await expect(page.getByText(/2\s*\/\s*8/)).toBeVisible();
});

// ──────────────────────────────────────────────
// 4. 이전 버튼
// ──────────────────────────────────────────────
test('이전 버튼 — 카드 인덱스가 감소한다 (순환)', async ({ page }) => {
  await page.goto('/fruits');
  // 1번 → 다음 → 2번 → 이전 → 1번
  await page.getByRole('button', { name: '다음 카드' }).click();
  await expect(page.getByText(/2\s*\/\s*8/)).toBeVisible();

  await page.getByRole('button', { name: '이전 카드' }).click();
  await expect(page.getByText(/1\s*\/\s*8/)).toBeVisible();
});

test('이전 버튼 — 첫 카드에서 누르면 마지막 카드로 순환', async ({ page }) => {
  await page.goto('/fruits');
  await expect(page.getByText(/1\s*\/\s*8/)).toBeVisible();

  await page.getByRole('button', { name: '이전 카드' }).click();
  await expect(page.getByText(/8\s*\/\s*8/)).toBeVisible();
});

// ──────────────────────────────────────────────
// 5. 한국어 음성 버튼
// ──────────────────────────────────────────────
test('한국어 듣기 버튼이 존재하고 클릭 가능하다', async ({ page }) => {
  await page.goto('/fruits');
  const btn = page.getByRole('button', { name: '한국어 듣기' });
  await expect(btn).toBeVisible();
  await btn.click(); // 오류 없이 실행돼야 함
});

// ──────────────────────────────────────────────
// 6. 영어 음성 버튼
// ──────────────────────────────────────────────
test('영어 듣기 버튼이 존재하고 클릭 가능하다', async ({ page }) => {
  await page.goto('/fruits');
  const btn = page.getByRole('button', { name: '영어 듣기' });
  await expect(btn).toBeVisible();
  await btn.click();
});

// ──────────────────────────────────────────────
// 7. 정답 버튼 — 축하 오버레이
// ──────────────────────────────────────────────
test('정답 버튼 — 축하 오버레이가 나타난다', async ({ page }) => {
  await page.goto('/fruits');
  await page.getByRole('button', { name: '정답' }).click();

  // role="dialog" aria-label="정답 축하" 가 보여야 함
  await expect(page.getByRole('dialog', { name: '정답 축하' })).toBeVisible({ timeout: 2000 });
});

test('정답 오버레이 — 탭하면 닫힌다', async ({ page }) => {
  await page.goto('/fruits');
  await page.getByRole('button', { name: '정답' }).click();

  // 오버레이 클릭으로 닫기
  const overlay = page.getByRole('dialog', { name: '정답 축하' });
  await expect(overlay).toBeVisible();
  await overlay.click();
  await expect(overlay).not.toBeVisible({ timeout: 500 });
});

// ──────────────────────────────────────────────
// 8. 홈 버튼
// ──────────────────────────────────────────────
test('홈 버튼 — 메인 화면으로 돌아간다', async ({ page }) => {
  await page.goto('/fruits');
  await page.getByRole('button', { name: '홈으로' }).click();
  await page.waitForURL('/');
  await expect(page.getByRole('link', { name: /과일/ })).toBeVisible();
});

// ──────────────────────────────────────────────
// 9. PWA manifest
// ──────────────────────────────────────────────
test('PWA manifest — 올바른 JSON을 반환한다', async ({ page }) => {
  const res = await page.request.get('/manifest.json');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('json');

  const json = await res.json();
  expect(json.name).toBeTruthy();
  expect(json.display).toBe('standalone');
  expect(json.icons).toBeInstanceOf(Array);
  expect(json.icons.length).toBeGreaterThan(0);
  expect(json.start_url).toBe('/');
});

// ──────────────────────────────────────────────
// 10. 빠른 연속 터치 — 중복 실행 방지
// ──────────────────────────────────────────────
test('빠른 연속 터치 — 정답 버튼 중복 클릭 시 오버레이 하나만 뜬다', async ({ page }) => {
  await page.goto('/fruits');
  const btn = page.getByRole('button', { name: '정답' });

  // 빠르게 3번 연속 클릭
  await btn.click();
  await btn.click();
  await btn.click();

  // 오버레이가 정확히 1개여야 함
  const overlays = page.getByRole('dialog', { name: '정답 축하' });
  await expect(overlays).toHaveCount(1);
});

// ──────────────────────────────────────────────
// 11. 채소 / 탈것 카테고리 접근
// ──────────────────────────────────────────────
test('채소 카테고리 — 8개 카드가 로드된다', async ({ page }) => {
  await page.goto('/vegetables');
  await expect(page.getByText(/1\s*\/\s*8/)).toBeVisible();
});

test('탈것 카테고리 — 14개 카드가 로드된다', async ({ page }) => {
  await page.goto('/vehicles');
  await expect(page.getByText(/1\s*\/\s*14/)).toBeVisible();
});

// ──────────────────────────────────────────────
// 12. 존재하지 않는 카테고리
// ──────────────────────────────────────────────
test('잘못된 카테고리 URL — 오류 메시지와 홈 버튼이 표시된다', async ({ page }) => {
  await page.goto('/unknown-category');
  await expect(page.getByText(/찾을 수 없어요/)).toBeVisible();
  await expect(page.getByRole('button', { name: '홈으로' })).toBeVisible();
});
