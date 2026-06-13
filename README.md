# 낱말카드 🃏

26개월 아기를 위한 한국어·영어 낱말 카드 PWA

iPad Safari에서 홈 화면에 추가하면 앱처럼 동작합니다.

---

## 기능

- 카테고리 3종: 과일 / 채소 / 탈것 (총 30개 카드)
- 카드 랜덤 셔플
- 한국어 · 영어 TTS (Web Speech API)
- 정답 버튼 → 효과음 + confetti 애니메이션 + 자동 발음
- 진행률 표시
- PWA (standalone 모드, 홈 화면 추가)

---

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx              # PWA 메타, 폰트, viewport
│   ├── page.tsx                # 홈 화면 (카테고리 선택)
│   ├── globals.css             # 전역 스타일, confetti 애니메이션
│   └── [category]/
│       └── page.tsx            # 낱말 카드 게임 화면
├── components/
│   ├── CategoryCard.tsx        # 카테고리 선택 카드
│   ├── WordCard.tsx            # 낱말 카드 (이미지 + 버튼 조합)
│   ├── PlaceholderImage.tsx    # 이미지 or 이모지 폴백
│   ├── ProgressBar.tsx         # 진행률 바
│   ├── IconButton.tsx          # 재사용 가능한 아이콘 버튼
│   └── CelebrationOverlay.tsx  # 정답 축하 오버레이 (CSS confetti)
├── data/
│   └── cards.ts                # 모든 카드 데이터 (여기만 수정)
├── hooks/
│   └── useTTS.ts               # TTS React 훅
├── types/
│   └── index.ts                # TypeScript 타입 정의
└── utils/
    ├── tts.ts                  # Web Speech API 유틸
    ├── audio.ts                # Web Audio API 효과음
    └── shuffle.ts              # Fisher-Yates 셔플

public/
├── manifest.json               # PWA 매니페스트
├── icons/
│   ├── icon-192x192.png
│   └── icon-512x512.png
└── images/
    ├── fruits/                 # apple.png, banana.png, ...
    ├── vegetables/             # carrot.png, tomato.png, ...
    └── vehicles/               # car.png, bus.png, ...
```

---

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
# → http://localhost:3000

# 프로덕션 빌드 확인
npm run build
npm run start
```

---

## 이미지 교체 방법

`public/images/{카테고리}/{id}.png` 파일을 추가하면 자동으로 표시됩니다.

| 카테고리 | 폴더 | 파일명 예시 |
|---|---|---|
| 과일 | `public/images/fruits/` | `apple.png`, `banana.png` ... |
| 채소 | `public/images/vegetables/` | `carrot.png`, `tomato.png` ... |
| 탈것 | `public/images/vehicles/` | `car.png`, `bus.png` ... |

이미지가 없으면 이모지가 자동으로 표시됩니다 (폴백 UI).

**권장 이미지 규격:** 400×400px 이상, PNG 또는 WebP, 투명 배경

---

## 카테고리 추가 방법

`src/data/cards.ts`에 새 카테고리를 추가합니다:

```ts
{
  id: 'animals',
  nameKo: '동물',
  nameEn: 'Animals',
  emoji: '🐶',
  bgColor: 'bg-orange-100',
  borderColor: 'border-orange-300',
  textColor: 'text-orange-700',
  cards: [
    { id: 'dog', nameKo: '강아지', nameEn: 'Dog', emoji: '🐶', imagePath: '/images/animals/dog.png' },
  ],
}
```

이미지는 `public/images/animals/` 폴더에 넣으면 됩니다. 코드 수정은 이 파일 하나로 끝납니다.

---

## Vercel 배포

### 1. GitHub에 업로드

```bash
git init
git add .
git commit -m "init: 낱말카드 PWA"
git remote add origin https://github.com/YOUR_USERNAME/wordcard.git
git push -u origin main
```

### 2. Vercel 연결

1. [vercel.com](https://vercel.com) 접속 → **Add New Project**
2. GitHub 저장소 선택
3. Framework: **Next.js** (자동 감지)
4. **Deploy** 클릭

환경변수가 필요한 경우 Vercel 대시보드 → Settings → Environment Variables에서 `.env.example` 항목을 참고해 추가합니다.

### 3. 배포 전 체크리스트

- [ ] `npm run build` 로컬 성공 확인
- [ ] TypeScript 에러 없음
- [ ] `.env.local`이 `.gitignore`에 포함됨 (커밋 금지)
- [ ] `public/images/` 이미지 파일 커밋 여부 확인

---

## iPad Safari 홈 화면 추가

1. iPad Safari에서 배포 URL 접속
2. 주소창 옆 **공유 버튼** 탭
3. **홈 화면에 추가** 선택
4. 이름 확인 후 **추가**

홈 화면 아이콘을 탭하면 전체화면 앱처럼 실행됩니다.

---

## iPad 사용성 체크리스트

- [ ] 홈 화면 추가 후 standalone 모드 동작
- [ ] 가로/세로 전환 시 레이아웃 정상
- [ ] 버튼 터치 시 즉각 시각 피드백 (scale 효과)
- [ ] 한국어 TTS 정상 재생
- [ ] 영어 TTS 정상 재생
- [ ] 정답 버튼 → 효과음 + confetti + 자동 발음
- [ ] 이미지 없는 카드 → 이모지 폴백 정상 표시
- [ ] 진행률 바 업데이트 정상
- [ ] 홈 버튼으로 카테고리 화면 복귀
- [ ] 이전/다음 버튼으로 카드 이동
