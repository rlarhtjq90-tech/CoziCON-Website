# howbuild.com 디자인 가이드

> 분석 대상: https://www.howbuild.com/
> 기술 스택: Next.js + Tailwind CSS v3.4.3 + Pretendard 폰트

---

## 1. 색상 시스템 (Color System)

### CSS Custom Properties (디자인 토큰)

```css
:root {
  --color-primary:     #1a2dff;
  --color-primary-100: #f0f6ff;
  --color-primary-200: #d1dbfa;
  --color-primary-300: #9cb4fc;
  --color-primary-400: #4c79ff;
  --color-primary-500: #1a2dff;
  --color-primary-600: #091eaa;
  --color-primary-700: #000966;
}
```

### Primary Blue Scale

| Token      | Hex       | 용도                       |
|------------|-----------|----------------------------|
| blue-50    | #eff6ff   | 배경 tint                  |
| blue-100   | #f0f6ff   | 연한 배경 (카드 hover 등)  |
| blue-200   | #d1dbfa   | 보더, 구분선               |
| blue-300   | #9cb4fc   | 비활성 / placeholder       |
| blue-400   | #4c79ff   | 보조 액션, hover 상태      |
| blue-500   | #1a2dff   | **브랜드 메인 컬러** (CTA) |
| blue-600   | #091eaa   | hover/pressed 상태         |
| blue-700   | #000966   | 가장 진한 강조             |

### Slate (Dark Brand) Scale

| Token      | Hex       | 용도                    |
|------------|-----------|-------------------------|
| slate-100  | #f3f6fc   | 섹션 배경               |
| slate-200  | #e0e7f5   | 구분선, 보더            |
| slate-300  | #cfd7e8   | 비활성 요소             |
| slate-400  | #7585a3   | 보조 텍스트             |
| slate-500  | #52607a   | 중간 텍스트             |
| slate-600  | #293857   | 진한 보조 텍스트        |
| slate-700  | #132039   | **다크 배경** (GNB 등)  |

### Gray Scale

| Token      | Hex       | 용도                    |
|------------|-----------|-------------------------|
| gray-50    | #fcfcfd   | 가장 밝은 배경          |
| gray-100   | #f9fafb   | 섹션 배경               |
| gray-200   | #edeff2   | 보더 (default border)   |
| gray-300   | #dbdde1   | 구분선                  |
| gray-400   | #818898   | placeholder, 비활성     |
| gray-500   | #5c6370   | 보조 텍스트             |
| gray-600   | #363d49   | 본문 텍스트             |
| gray-700   | #0f1624   | **최진한 텍스트** (제목)|

### Accent / Status Colors

| Color       | Hex       | 용도                  |
|-------------|-----------|-----------------------|
| Orange-Red  | #FF4C00   | 강조 배지, 알림       |
| Amber-500   | #f59e0b   | 경고, 별점            |
| Green-500   | #22c55e   | 성공, 완료            |
| Teal-500    | #00ccb8   | 보조 액센트           |
| Purple-500  | #8049f6   | 보조 그라디언트 끝색  |
| Red-500     | #cf1736   | 에러                  |

### 배경 색상 패턴

```
White section:    #ffffff
Light blue tint:  #f7f9fd, #f3f6fc, #ebeffa
Blue gradient bg: linear-gradient(180deg, #f1efff, #f2f6ff)
Dark section:     #132039 → #263759 (gradient)
```

---

## 2. 그라디언트 (Gradients)

```css
/* 커스텀 그라디언트 클래스 */
.bg-gradient-blue45   { background: linear-gradient(130.18deg, #4c79ff 6.52%, #1a2dff); }
.bg-gradient-blue56   { background: linear-gradient(101.68deg, #1a2dff 3.65%, #003399 109.87%); }
.bg-gradient-violet45 { background: linear-gradient(90.05deg, #4d4dff 0.04%, #3333ff 99.95%); }
.bg-gradient-violet56 { background: linear-gradient(103.97deg, #3333ff 17.47%, #0a0ac2 96.6%); }

/* 섹션 배경 그라디언트 */
.hero-bg    { background: linear-gradient(180deg, #f3f6fc, #fff); }
.cta-dark   { background: linear-gradient(90.05deg, #263759 0.04%, #132039 99.95%); }
.blue-light { background: linear-gradient(270deg, #ebeffa, #f7f9fd); }
.fade-edge  { background: linear-gradient(90deg, transparent, #000 100px, #000 calc(100% - 100px), transparent); }
```

---

## 3. 타이포그래피 (Typography)

### 폰트 패밀리

```css
font-family: Pretendard, system-ui, sans-serif;
/* CDN: https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css */
```

### 제목 스케일 (Title Scale)

| 클래스  | Size      | px 환산  | 용도              |
|---------|-----------|----------|-------------------|
| .text-t1 | 3rem     | 48px     | 대형 히어로 제목  |
| .text-t2 | 2.25rem  | 36px     | 섹션 메인 제목    |
| .text-t3 | 2rem     | 32px     | 섹션 서브 제목    |
| .text-t4 | 1.75rem  | 28px     | 카드 대형 제목    |
| .text-t5 | 1.5rem   | 24px     | 카드 제목         |
| .text-t6 | 1.375rem | 22px     | 소제목            |
| .text-t7 | 1.125rem | 18px     | 작은 제목         |

### 본문 스케일 (Paragraph Scale)

| 클래스   | Size        | px 환산 | 용도                |
|----------|-------------|---------|---------------------|
| .text-p24 | 1.5rem     | 24px    | 대형 본문           |
| .text-p22 | 1.375rem   | 22px    | 큰 본문             |
| .text-p20 | 1.25rem    | 20px    | 강조 본문           |
| .text-p18 | 1.125rem   | 18px    | 일반 본문 (크게)    |
| .text-p16 | 1rem       | 16px    | **기본 본문**       |
| .text-p14 | 0.875rem   | 14px    | 보조 설명           |
| .text-p13 | 0.8125rem  | 13px    | 캡션, 태그          |
| .text-p12 | 0.75rem    | 12px    | 작은 레이블         |
| .text-p11 | 0.6875rem  | 11px    | 최소 텍스트         |

### 폰트 굵기

| Weight | 용도                    |
|--------|-------------------------|
| 300    | 라이트 (얇은 텍스트)    |
| 400    | 기본 본문               |
| 500    | 중간 강조               |
| 600    | 버튼, 레이블            |
| 700    | **제목 (Bold)**         |
| 900    | 숫자 강조 (통계 등)     |

### 자간 / 행간

```css
letter-spacing: -0.02em;  /* 제목에 주로 사용 */
letter-spacing: -1.28px;  /* 대형 숫자 */

line-height: 1.5;    /* 기본 본문 */
line-height: 1.6;    /* 여유있는 본문 */
line-height: 1.625;  /* 장문 */
line-height: 1.25;   /* 제목 */
```

---

## 4. 레이아웃 & 그리드 (Layout & Grid)

### 컨테이너 너비

| 용도               | 값      |
|--------------------|---------|
| 메인 콘텐츠        | 1136px  |
| 와이드 섹션        | 1200px  |
| 풀 와이드          | 1440px  |
| 배경 이미지        | 1600px  |
| 최대 와이드        | 1921px  |

### 반응형 브레이크포인트

```css
/* Tailwind 커스텀 브레이크포인트 */
mobile  : ~ 799px          (기본, max-width: 799px)
tablet  : 800px ~          (min-width: 800px)   → prefix: tablet:
laptop  : 1136px ~         (min-width: 1136px)  → prefix: laptop:
desktop : 1600px ~         (min-width: 1600px)  → prefix: desktop:
wide    : 1921px ~         (min-width: 1921px)
extra   : ~ 374px          (max-width: 374px, 소형 폰 특별 처리)
```

**사용 예시:**
```html
<h1 class="text-t4 tablet:text-t3 laptop:text-t1">제목</h1>
<div class="flex flex-col laptop:flex-row gap-6 laptop:gap-12">...</div>
```

### GNB (글로벌 네비게이션 바) 높이

```css
:root {
  --gnb-height:        3rem;   /* 48px - 모바일 */
  --gnb-height-tablet: 4rem;   /* 64px - 태블릿 */
  --gnb-height-laptop: 4.5rem; /* 72px - 랩탑 */
}
```

### 섹션 패딩 패턴

```css
/* 섹션 수직 패딩 */
py-10  → 40px  (모바일)
py-16  → 64px  (laptop)

/* 섹션 수평 패딩 */
px-6   → 24px  (모바일)
px-0   → 0px   (tablet: 컨테이너 내부에서 처리)
```

---

## 5. 간격 (Spacing)

Tailwind 8px 베이스 스케일 사용:

| 클래스 | 값      | px   |
|--------|---------|------|
| gap-1  | 0.25rem | 4px  |
| gap-2  | 0.5rem  | 8px  |
| gap-3  | 0.75rem | 12px |
| gap-4  | 1rem    | 16px |
| gap-6  | 1.5rem  | 24px |
| gap-8  | 2rem    | 32px |
| gap-10 | 2.5rem  | 40px |
| gap-12 | 3rem    | 48px |
| gap-16 | 4rem    | 64px |

---

## 6. 보더 & 쉐도우 (Border & Shadow)

### Border Radius

| 클래스       | 값         | px    | 용도               |
|--------------|------------|-------|--------------------|
| rounded-sm   | 0.125rem   | 2px   | 인풋, 태그         |
| rounded-md   | 0.375rem   | 6px   | 버튼 (소형)        |
| rounded-lg   | 0.5rem     | 8px   | 기본 카드          |
| rounded-xl   | 0.75rem    | 12px  | 카드               |
| rounded-2xl  | 1rem       | 16px  | 큰 카드            |
| rounded-3xl  | 1.5rem     | 24px  | 이미지 컨테이너    |
| 6.25rem      | 6.25rem    | 100px | 뱃지, 태그 (pill)  |
| rounded-full | 9999px     | —     | 아이콘 버튼, 아바타|

### Box Shadow

```css
/* 기본 카드 */
box-shadow: 0 0.125rem 0.5rem rgba(19,32,57,.04),
            0 0.25rem 0.0625rem rgba(19,32,57,.02);

/* 중간 카드 */
box-shadow: 0 0.5rem 1.25rem rgba(19,32,57,.01),
            0 0.25rem 0.75rem rgba(19,32,57,.04);

/* 섹션 요소 */
box-shadow: 0 0 1.25rem rgba(0,27,82,.04);

/* 강조 카드 */
box-shadow: 0 1.25rem 2.5rem rgba(19,32,57,.04);

/* 크게 떠있는 요소 */
box-shadow: 0 2.5rem 3.75rem rgba(19,32,57,.16);

/* 블루 글로우 (CTA 버튼) */
box-shadow: 0 0.25rem 1.25rem rgba(51,119,255,.3);
```

### Default Border Color

```css
border-color: #edeff2;  /* gray-200 */
```

---

## 7. 애니메이션 & 트랜지션 (Animation)

```css
/* 다이얼로그 등장/퇴장 */
animation: dialogShow .12s cubic-bezier(.95,.05,.8,.04) forwards;
animation: dialogHide .12s cubic-bezier(.95,.05,.8,.04) forwards;

/* 페이드 */
animation: fadeIn  .12s cubic-bezier(.95,.05,.8,.04) forwards;
animation: fadeOut .12s cubic-bezier(.95,.05,.8,.04) forwards;

/* 로고 캐러셀 무한 슬라이드 */
animation: slide 50s linear infinite;

/* 슬라이드업 (알림, 토스트) */
animation: slideUp .2s ease-out forwards;

/* 로딩 스피너 */
animation: spin 1s linear infinite;
```

---

## 8. 섹션 구조 (Section Architecture)

페이지 위에서 아래 순서:

```
┌─────────────────────────────────────────┐
│ 01. GNB (Global Navigation Bar)          │ sticky, height: 3-4.5rem
├─────────────────────────────────────────┤
│ 02. Hero Section                         │ bg: linear(#f3f6fc → #fff)
│     "건축의 시작부터 끝까지 하우빌드"      │ t1 크기 제목, CTA 버튼
├─────────────────────────────────────────┤
│ 03. Process Steps (4-Tab)                │ bg: white
│     건축 단계별 프로세스 탭               │
├─────────────────────────────────────────┤
│ 04. Participant Types (3-Column)         │ bg: white
│     건축주 / 건축사 / 건설사             │
├─────────────────────────────────────────┤
│ 05. Partner Logo Carousel                │ bg: white
│     14+ 스폰서 로고 무한 슬라이드         │ animation: slide 50s
├─────────────────────────────────────────┤
│ 06. Solutions Grid                       │ bg: #f7f9fd
│     3개 솔루션 카드                       │
├─────────────────────────────────────────┤
│ 07. Testimonials Carousel                │ bg: dark (#132039)
│     9개 영상 썸네일 슬라이드             │
├─────────────────────────────────────────┤
│ 08. Services Section                     │ bg: white
│     4개 서비스 피처 카드                  │
├─────────────────────────────────────────┤
│ 09. Portfolio Carousel                   │ bg: #f3f6fc
│     12+ 완공 프로젝트 슬라이드            │
├─────────────────────────────────────────┤
│ 10. Statistics Section                   │ bg: gradient-blue (dark)
│     총 프로젝트 수, 총 공사비 등 숫자     │ font-weight: 900
├─────────────────────────────────────────┤
│ 11. Educational Content                  │ bg: white
│     YouTube / 블로그 링크 카드           │
├─────────────────────────────────────────┤
│ 12. Newsletter Signup Form               │ bg: #ebeffa
│     이메일 인풋 + 동의 체크박스          │
├─────────────────────────────────────────┤
│ 13. Partnership CTAs (2 Cards)           │ bg: white
│     건축사 파트너 / 건설사 파트너        │
├─────────────────────────────────────────┤
│ 14. FAQ Section                          │ bg: white
│     아코디언 방식                         │
├─────────────────────────────────────────┤
│ 15. Main CTA Section                     │ bg: gradient-blue-dark
│     "하우빌드와 건축 상담하기" 버튼       │
├─────────────────────────────────────────┤
│ 16. Footer                               │ bg: #132039 (slate-700)
│     링크 + 연락처 + SNS 아이콘           │
└─────────────────────────────────────────┘
```

---

## 9. 컴포넌트 패턴 (Component Patterns)

### GNB (Navigation)

```
- Position: sticky, top: 0
- Height: var(--gnb-height) = 3rem/4rem/4.5rem
- Background: white (스크롤 시 backdrop-blur 추가 가능)
- Logo: 좌측
- 메뉴 링크: 중앙 또는 우측 (솔루션, 파트너, 완공사례, 고객지원)
- CTA 버튼: "상담하기" (blue-500 filled)
```

### 버튼 (Button)

```css
/* Primary CTA */
background: #1a2dff;          /* blue-500 */
color: #ffffff;
border-radius: 6.25rem;       /* pill */
padding: 0.75rem 1.5rem;
font-weight: 600;
box-shadow: 0 0.25rem 1.25rem rgba(51,119,255,.3);  /* 블루 글로우 */

/* Secondary */
background: transparent;
border: 1px solid #1a2dff;
color: #1a2dff;
border-radius: 6.25rem;

/* Ghost / Text */
background: transparent;
color: #363d49;  /* gray-600 */
```

### 카드 (Card)

```css
/* 기본 카드 */
background: #ffffff;
border-radius: 1rem;           /* rounded-2xl */
box-shadow: 0 0.5rem 1.25rem rgba(19,32,57,.04);
padding: 1.5rem;               /* p-6 */

/* 배경 카드 (연한 블루) */
background: #f3f6fc;           /* slate-100 */
border-radius: 1.5rem;         /* rounded-3xl */

/* 다크 카드 */
background: linear-gradient(90.05deg, #263759, #132039);
color: #ffffff;
border-radius: 1rem;
```

### 배지 / 태그 (Badge)

```css
/* 파란 태그 */
background: #f0f6ff;           /* blue-100 */
color: #1a2dff;                /* blue-500 */
border-radius: 6.25rem;        /* pill */
padding: 0.25rem 0.75rem;
font-size: 0.8125rem;          /* p13 */
font-weight: 500;

/* 보라 태그 */
background: #f1efff;
color: #5d32dd;                /* purple */
border-radius: 6.25rem;
```

### 폼 (Form)

```css
/* Input */
border: 1px solid #edeff2;     /* gray-200 */
border-radius: 0.5rem;         /* rounded-lg */
padding: 0.75rem 1rem;
font-size: 1rem;               /* p16 */
background: #ffffff;

/* Focus */
border-color: #1a2dff;
outline: none;
box-shadow: 0 0 0 3px rgba(26,45,255,.1);
```

### 캐러셀 (Carousel)

```css
/* 로고 무한 슬라이드 */
.animate-slide {
  animation: slide 50s linear infinite;
  will-change: transform;
}

/* 페이드 엣지 마스크 */
mask-image: linear-gradient(
  90deg, transparent, #000 100px, #000 calc(100% - 100px), transparent
);
```

### 통계 숫자 (Statistics)

```css
font-size: 3rem;               /* t1 */
font-weight: 900;
letter-spacing: -0.02em;
color: #ffffff;                /* 다크 섹션 위에서 */
```

---

## 10. 디자인 언어 & 미학 (Design Language)

### 핵심 특성

| 항목          | 설명                                                  |
|---------------|-------------------------------------------------------|
| 스타일        | **Modern Professional Minimal** — 군더더기 없는 클린 |
| 색조          | 쿨톤 블루 계열 지배적, 따뜻한 악센트 최소 사용        |
| 타입 스케일   | 한국어 가독성 최적화된 Pretendard                     |
| 밝기 패턴     | 밝은 섹션과 짙은 섹션 교차 배치 (리듬감)              |
| 레이아웃      | 여백 충분, 콘텐츠 밀도 낮음 → 신뢰감                 |
| CTA           | 블루 pill 버튼 + 글로우 섀도우 = 클릭 유도            |
| 이미지 처리   | Next.js Image 최적화, aspect-ratio 고정               |
| 애니메이션    | 빠르고 subtle (0.12s~0.2s), 과한 모션 없음            |

### 섹션 배경 패턴 (교차 리듬)

```
White → Light Blue Tint → White → Dark Navy → White → Light → Dark → ...
```

### 브랜드 컬러 철학

- **블루(#1a2dff)**: 신뢰, 전문성, 기술
- **짙은 네이비(#132039)**: 무게감, 안정감 (다크 섹션)
- **밝은 블루 tint(#f3f6fc)**: 부드러움, 접근성
- **강조 오렌지(#FF4C00)**: 긴급함, 주목도 높은 배지

---

## 11. 실전 활용 팁

### 동일한 스택으로 구현 시 추천 설정

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1a2dff',
          100: '#f0f6ff',
          200: '#d1dbfa',
          300: '#9cb4fc',
          400: '#4c79ff',
          500: '#1a2dff',
          600: '#091eaa',
          700: '#000966',
        },
        slate: {
          100: '#f3f6fc',
          200: '#e0e7f5',
          300: '#cfd7e8',
          400: '#7585a3',
          500: '#52607a',
          600: '#293857',
          700: '#132039',
        },
        gray: {
          200: '#edeff2',
          300: '#dbdde1',
          400: '#818898',
          500: '#5c6370',
          600: '#363d49',
          700: '#0f1624',
        },
      },
      fontSize: {
        't1': '3rem',
        't2': '2.25rem',
        't3': '2rem',
        't4': '1.75rem',
        't5': '1.5rem',
        't6': '1.375rem',
        't7': '1.125rem',
        'p11': '0.6875rem',
        'p12': '0.75rem',
        'p13': '0.8125rem',
        'p14': '0.875rem',
        'p16': '1rem',
        'p18': '1.125rem',
        'p20': '1.25rem',
        'p22': '1.375rem',
        'p24': '1.5rem',
      },
      screens: {
        'tablet': '800px',
        'laptop': '1136px',
        'desktop': '1600px',
      },
      backgroundImage: {
        'gradient-blue45':   'linear-gradient(130.18deg, #4c79ff 6.52%, #1a2dff)',
        'gradient-blue56':   'linear-gradient(101.68deg, #1a2dff 3.65%, #003399 109.87%)',
        'gradient-violet45': 'linear-gradient(90.05deg, #4d4dff 0.04%, #3333ff 99.95%)',
        'gradient-violet56': 'linear-gradient(103.97deg, #3333ff 17.47%, #0a0ac2 96.6%)',
      },
      fontFamily: {
        'pretendard': ['Pretendard', 'system-ui', 'sans-serif'],
      },
    },
  },
}
```

### 폰트 임포트

```css
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css");
```
