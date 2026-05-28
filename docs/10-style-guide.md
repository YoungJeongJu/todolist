# 스타일 가이드 — TodoList 웹 애플리케이션

> 버전: 1.0 | 작성일: 2026-05-28 | 참조: 8-wireframes.md, 2-PRD.md, Gmail 레퍼런스 UI

---

## 버전 이력

| 버전 | 날짜       | 변경 내용 |
| ---- | ---------- | --------- |
| 1.0  | 2026-05-28 | 최초 작성 — Gmail 레퍼런스 기반 디자인 시스템 정의 |

---

## 1. 디자인 철학

Gmail의 시각 언어를 참조하여 **깨끗하고 집중을 방해하지 않는** UI를 지향한다.

| 원칙 | 설명 |
|------|------|
| **명확성** | 정보 계층이 분명하며 중요한 요소가 먼저 눈에 들어온다 |
| **일관성** | 동일한 역할의 요소는 어디서나 같은 모양·색을 사용한다 |
| **절제** | 불필요한 장식을 배제하고 여백으로 숨을 쉰다 |
| **반응성** | 데스크탑(≥768px)과 모바일(<768px) 두 레이아웃을 모두 지원한다 |
| **접근성** | WCAG AA 기준 대비 4.5:1 이상을 충족한다 |

---

## 2. 컬러 시스템

### 2-1. 기본 팔레트

Gmail의 컬러 시스템을 참조하여 Blue 계열을 Primary로 사용한다.

```css
:root {
  /* Primary — Google Blue 계열 */
  --color-primary-50:  #e8f0fe;
  --color-primary-100: #d3e3fd;
  --color-primary-200: #a8c7fa;
  --color-primary-500: #4285f4;
  --color-primary-600: #1a73e8;   /* 메인 Primary */
  --color-primary-700: #1557b0;

  /* Neutral — 텍스트 및 배경 */
  --color-neutral-0:   #ffffff;
  --color-neutral-50:  #f8f9fa;   /* 페이지 배경 */
  --color-neutral-100: #f1f3f4;   /* 사이드바 배경 */
  --color-neutral-200: #e8eaed;   /* 구분선, 테두리 */
  --color-neutral-400: #bdc1c6;   /* Placeholder */
  --color-neutral-600: #80868b;   /* 보조 텍스트 */
  --color-neutral-700: #5f6368;   /* 중간 텍스트 */
  --color-neutral-900: #202124;   /* 본문 텍스트 */

  /* Semantic */
  --color-success:     #1e8e3e;
  --color-success-bg:  #e6f4ea;
  --color-warning:     #f29900;
  --color-warning-bg:  #fef7e0;
  --color-error:       #d93025;
  --color-error-bg:    #fce8e6;
  --color-overdue:     #d93025;   /* 기한 초과 강조 */
  --color-overdue-bg:  #fce8e6;
}
```

### 2-2. 다크 모드 팔레트

`themeMode === 'DARK'`일 때 `<html>` 또는 최상위 컨테이너에 `data-theme="dark"` 속성을 적용한다.

```css
[data-theme="dark"] {
  --color-primary-50:  #1a2744;
  --color-primary-100: #1e3a5f;
  --color-primary-200: #2d5a9e;
  --color-primary-500: #4285f4;
  --color-primary-600: #4285f4;   /* 다크에서 Primary 동일 */
  --color-primary-700: #669df6;

  --color-neutral-0:   #1f1f1f;   /* 기본 배경 */
  --color-neutral-50:  #2d2d2d;   /* 컴포넌트 배경 */
  --color-neutral-100: #3c3c3c;   /* 사이드바 배경 */
  --color-neutral-200: #444746;   /* 구분선 */
  --color-neutral-400: #5f6368;
  --color-neutral-600: #9aa0a6;
  --color-neutral-700: #bdc1c6;
  --color-neutral-900: #e8eaed;   /* 다크의 본문 텍스트 */

  --color-success:     #81c995;
  --color-success-bg:  #0d3b1e;
  --color-error:       #f28b82;
  --color-error-bg:    #3c1a18;
  --color-overdue:     #f28b82;
  --color-overdue-bg:  #3c1a18;
}
```

### 2-3. 상태별 색상 사용 규칙

| 상태 | 텍스트 색 | 배지/칩 배경 | 용도 |
|------|-----------|-------------|------|
| NOT_STARTED | `--color-neutral-700` | `--color-neutral-100` | 미시작 |
| IN_PROGRESS | `--color-primary-600` | `--color-primary-50` | 진행 중 |
| DONE | `--color-success` | `--color-success-bg` | 완료 |
| OVERDUE | `--color-overdue` | `--color-overdue-bg` | 기한 초과 |

---

## 3. 타이포그래피

Google Sans와 유사한 한국어 지원 시스템 폰트 스택을 사용한다.

```css
:root {
  --font-family-base: 'Google Sans', 'Noto Sans KR', -apple-system,
                      BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-family-mono: 'Roboto Mono', 'Courier New', monospace;
}
```

### 3-1. 타입 스케일

| 토큰 | 크기 | 굵기 | Line-height | 용도 |
|------|------|------|-------------|------|
| `--text-xs` | 11px | 400 | 1.4 | 타임스탬프, 보조 레이블 |
| `--text-sm` | 13px | 400 | 1.5 | 목록 미리보기, 보조 텍스트 |
| `--text-base` | 14px | 400 | 1.6 | 본문, 입력 필드 |
| `--text-base-bold` | 14px | 600 | 1.6 | 읽지 않은 항목, 강조 본문 |
| `--text-md` | 16px | 400 | 1.5 | 섹션 레이블, 카드 제목 |
| `--text-lg` | 20px | 400 | 1.4 | 페이지 헤더, 모달 제목 |
| `--text-xl` | 24px | 400 | 1.3 | 앱 타이틀 |

```css
:root {
  --text-xs:        11px;
  --text-sm:        13px;
  --text-base:      14px;
  --text-md:        16px;
  --text-lg:        20px;
  --text-xl:        24px;

  --font-normal:    400;
  --font-medium:    500;
  --font-semibold:  600;
}
```

---

## 4. 간격 시스템 (Spacing)

8px 기반 배수 시스템을 사용한다.

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

---

## 5. 모서리 반경 (Border Radius)

```css
:root {
  --radius-sm:   4px;    /* 입력 필드, 소형 칩 */
  --radius-md:   8px;    /* 카드, 모달 */
  --radius-lg:   16px;   /* 드롭다운, 토스트 */
  --radius-full: 9999px; /* 버튼 (Compose 스타일), 배지 */
}
```

---

## 6. 그림자 (Elevation)

```css
:root {
  --shadow-sm:  0 1px 2px rgba(60,64,67,.3),  0 1px 3px 1px rgba(60,64,67,.15);
  --shadow-md:  0 1px 4px rgba(60,64,67,.3),  0 2px 6px 2px rgba(60,64,67,.15);
  --shadow-lg:  0 4px 8px 3px rgba(60,64,67,.15), 0 1px 3px rgba(60,64,67,.3);
  --shadow-xl:  0 6px 10px 4px rgba(60,64,67,.15), 0 2px 3px rgba(60,64,67,.3);
}
```

---

## 7. 레이아웃

### 7-1. 전체 구조

```
+--------------------------------------------------+
| Header (56px 고정)                               |
+------------------+-------------------------------+
| Sidebar (256px)  | Main Content (fluid)          |
|                  |                               |
|                  |                               |
+------------------+-------------------------------+
```

```css
/* 데스크탑 (≥768px) */
.app-layout {
  display: grid;
  grid-template-rows: 56px 1fr;
  grid-template-columns: 256px 1fr;
  grid-template-areas:
    "header header"
    "sidebar main";
  height: 100vh;
}

/* 모바일 (<768px) */
@media (max-width: 767px) {
  .app-layout {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main";
  }
}
```

### 7-2. Header (56px)

- 배경: `--color-neutral-0`
- 하단 테두리: `1px solid --color-neutral-200`
- 좌측: 앱 로고/타이틀
- 우측: 프로필 링크, 로그아웃 버튼

### 7-3. Sidebar (256px, 데스크탑)

- 배경: `--color-neutral-100`
- 내부 여백: `--space-2` (8px) 좌우
- 모바일: 상단 드롭다운으로 전환 (카테고리 선택)

### 7-4. 콘텐츠 영역

- 최대 너비: 제한 없음 (사이드바 제외 전체)
- 내부 여백: `--space-6` (24px) 좌우, `--space-4` (16px) 상하

### 7-5. 반응형 브레이크포인트

| 브레이크포인트 | 범위 | 변경 사항 |
|---------------|------|-----------|
| mobile | < 768px | 사이드바 숨김 → 상단 드롭다운, 모달 → 풀스크린 |
| desktop | ≥ 768px | 사이드바 고정 256px |

---

## 8. 컴포넌트

### 8-1. 버튼

#### Primary Button (메인 액션)

Gmail의 Compose 버튼 스타일을 참조한다.

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-6);
  height: 36px;
  background: var(--color-primary-600);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: background 150ms, box-shadow 150ms;
}

.btn-primary:hover {
  background: var(--color-primary-700);
  box-shadow: var(--shadow-md);
}

.btn-primary:disabled {
  background: var(--color-neutral-200);
  color: var(--color-neutral-400);
  box-shadow: none;
  cursor: not-allowed;
}
```

#### Secondary Button (보조 액션)

```css
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-4);
  height: 36px;
  background: transparent;
  color: var(--color-primary-600);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: background 150ms, border-color 150ms;
}

.btn-secondary:hover {
  background: var(--color-primary-50);
  border-color: var(--color-primary-200);
}
```

#### Danger Button (탈퇴, 삭제 확인)

```css
.btn-danger {
  background: var(--color-error);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-full);
  /* 나머지 속성은 btn-primary 동일 */
}

.btn-danger:hover {
  background: #b5281e;
}
```

#### Ghost / Icon Button (아이콘 전용 액션)

```css
.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  border-radius: var(--radius-full);
  color: var(--color-neutral-700);
  cursor: pointer;
  transition: background 150ms;
}

.btn-ghost:hover {
  background: var(--color-neutral-100);
}
```

#### FAB (Floating Action Button — 할 일 추가)

```css
.btn-fab {
  position: fixed;
  right: var(--space-6);
  bottom: var(--space-6);
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-6);
  height: 56px;
  background: var(--color-primary-600);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--text-md);
  font-weight: var(--font-medium);
  cursor: pointer;
  box-shadow: var(--shadow-lg);
  transition: background 150ms, box-shadow 150ms;
  z-index: 100;
}

.btn-fab:hover {
  box-shadow: var(--shadow-xl);
}
```

---

### 8-2. 입력 필드 (Input)

```css
.input {
  width: 100%;
  height: 40px;
  padding: 0 var(--space-3);
  background: var(--color-neutral-0);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
  color: var(--color-neutral-900);
  transition: border-color 150ms;
  outline: none;
}

.input::placeholder {
  color: var(--color-neutral-400);
}

.input:focus {
  border-color: var(--color-primary-600);
  box-shadow: 0 0 0 2px var(--color-primary-100);
}

.input--error {
  border-color: var(--color-error);
}

.input--error:focus {
  box-shadow: 0 0 0 2px var(--color-error-bg);
}
```

#### Textarea (설명 입력)

```css
.textarea {
  /* input과 동일하되 height 제거 */
  width: 100%;
  min-height: 80px;
  padding: var(--space-2) var(--space-3);
  resize: vertical;
  /* 나머지 속성은 .input 동일 */
}
```

---

### 8-3. 레이블 & 인라인 에러

```css
.form-label {
  display: block;
  margin-bottom: var(--space-1);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--color-neutral-700);
}

.form-error {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-top: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-error);
}

.form-hint {
  margin-top: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
  text-align: right; /* 글자 수 카운터 */
}
```

---

### 8-4. 드롭다운 / Select

```css
.select {
  /* .input 속성 상속 */
  appearance: none;
  background-image: url("data:image/svg+xml,..."); /* 화살표 아이콘 */
  background-repeat: no-repeat;
  background-position: right var(--space-3) center;
  padding-right: var(--space-8);
  cursor: pointer;
}
```

---

### 8-5. 카드 (Card)

```css
.card {
  background: var(--color-neutral-0);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-md);
  padding: var(--space-6);
}
```

---

### 8-6. 모달 (Dialog)

```css
/* 오버레이 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(32,33,36,.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

/* 모달 박스 */
.modal {
  background: var(--color-neutral-0);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  padding: var(--space-6);
}

/* 모달 헤더 */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-5);
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  color: var(--color-neutral-900);
}

/* 모바일: 풀스크린 모달 */
@media (max-width: 767px) {
  .modal-overlay { align-items: stretch; }
  .modal {
    max-width: 100%;
    max-height: 100%;
    border-radius: 0;
    padding: var(--space-4);
  }
}
```

---

### 8-7. 상태 배지 (Status Badge)

할 일 항목의 현재 상태를 나타내는 인라인 배지.

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  white-space: nowrap;
}

.badge--not-started {
  color: var(--color-neutral-700);
  background: var(--color-neutral-100);
}

.badge--in-progress {
  color: var(--color-primary-600);
  background: var(--color-primary-50);
}

.badge--done {
  color: var(--color-success);
  background: var(--color-success-bg);
}

.badge--overdue {
  color: var(--color-overdue);
  background: var(--color-overdue-bg);
}
```

---

### 8-8. 필터 탭 (Status Filter)

메인 화면 상단의 상태 필터 탭. Gmail의 Primary / Promotions / Social 탭 패턴 참조.

```css
.filter-tabs {
  display: flex;
  gap: var(--space-1);
  border-bottom: 1px solid var(--color-neutral-200);
  padding: 0 var(--space-4);
}

.filter-tab {
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-base);
  color: var(--color-neutral-700);
  border-bottom: 3px solid transparent;
  margin-bottom: -1px;
  cursor: pointer;
  transition: color 150ms, border-color 150ms;
  white-space: nowrap;
}

.filter-tab:hover {
  color: var(--color-primary-600);
  background: var(--color-neutral-50);
}

.filter-tab--active {
  color: var(--color-primary-600);
  border-bottom-color: var(--color-primary-600);
  font-weight: var(--font-medium);
}
```

---

### 8-9. 할 일 목록 아이템 (Todo Item)

Gmail 이메일 행 디자인을 참조하여 행 호버 효과와 정보 계층을 구성한다.

```css
.todo-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-neutral-200);
  background: var(--color-neutral-0);
  transition: background 100ms;
  min-height: 52px;
}

.todo-item:hover {
  background: var(--color-neutral-50);
  box-shadow: var(--shadow-sm);
  z-index: 1;
  position: relative;
}

/* 기한 초과 행 좌측 강조선 */
.todo-item--overdue {
  border-left: 3px solid var(--color-overdue);
  padding-left: calc(var(--space-4) - 3px);
}

/* 제목 영역 */
.todo-item__title {
  flex: 1;
  font-size: var(--text-base);
  color: var(--color-neutral-900);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.todo-item__title--done {
  text-decoration: line-through;
  color: var(--color-neutral-600);
}

/* 날짜 */
.todo-item__date {
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
  white-space: nowrap;
}

.todo-item__date--overdue {
  color: var(--color-overdue);
  font-weight: var(--font-medium);
}

/* 액션 버튼 영역 — 호버 시 표시 */
.todo-item__actions {
  display: flex;
  gap: var(--space-1);
  opacity: 0;
  transition: opacity 150ms;
}

.todo-item:hover .todo-item__actions {
  opacity: 1;
}
```

---

### 8-10. 카테고리 사이드바 아이템

Gmail 좌측 네비게이션 아이템 스타일을 참조한다.

```css
.category-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: 0 var(--radius-full) var(--radius-full) 0;
  margin-right: var(--space-2);
  font-size: var(--text-base);
  color: var(--color-neutral-900);
  cursor: pointer;
  transition: background 100ms;
}

.category-item:hover {
  background: var(--color-neutral-200);
}

.category-item--active {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  font-weight: var(--font-semibold);
}
```

---

### 8-11. 알림 메시지 (Toast / Alert)

```css
/* 성공 토스트 */
.alert {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
}

.alert--success {
  background: var(--color-success-bg);
  color: var(--color-success);
  border: 1px solid var(--color-success);
}

.alert--error {
  background: var(--color-error-bg);
  color: var(--color-error);
  border: 1px solid var(--color-error);
}

.alert--warning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
  border: 1px solid var(--color-warning);
}
```

---

### 8-12. 빈 상태 (Empty State)

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-16);
  text-align: center;
  color: var(--color-neutral-600);
}

.empty-state__icon {
  width: 64px;
  height: 64px;
  opacity: .4;
}

.empty-state__title {
  font-size: var(--text-md);
  color: var(--color-neutral-700);
}

.empty-state__desc {
  font-size: var(--text-sm);
  color: var(--color-neutral-600);
}
```

---

### 8-13. 확인 다이얼로그 (Confirm Dialog)

카테고리 삭제, 회원 탈퇴 시 사용.

```css
.confirm-dialog {
  background: var(--color-neutral-0);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xl);
  padding: var(--space-6);
  max-width: 400px;
  width: 90%;
}

.confirm-dialog__title {
  font-size: var(--text-md);
  font-weight: var(--font-medium);
  color: var(--color-neutral-900);
  margin-bottom: var(--space-2);
}

.confirm-dialog__desc {
  font-size: var(--text-base);
  color: var(--color-neutral-700);
  margin-bottom: var(--space-6);
}

.confirm-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}
```

---

### 8-14. 스켈레톤 로딩 (Skeleton)

TanStack Query 로딩 중 표시.

```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: .4; }
}

.skeleton {
  background: var(--color-neutral-200);
  border-radius: var(--radius-sm);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton--text   { height: 14px; }
.skeleton--title  { height: 20px; }
.skeleton--avatar { border-radius: var(--radius-full); }
```

---

## 9. 아이콘

Material Symbols (Google Icons) 또는 Lucide React를 사용한다.

| 역할 | 아이콘 이름 (Lucide) | 크기 |
|------|---------------------|------|
| 할 일 추가 (FAB) | `Plus` | 24px |
| 수정 | `Pencil` | 16px |
| 삭제 | `Trash2` | 16px |
| 닫기 | `X` | 20px |
| 뒤로 가기 (모바일) | `ArrowLeft` | 20px |
| 카테고리 | `Tag` | 16px |
| 프로필 | `User` | 20px |
| 로그아웃 | `LogOut` | 20px |
| 기한 초과 경고 | `AlertCircle` | 14px |
| 완료 체크 | `CheckCircle2` | 16px |
| 테마 (라이트) | `Sun` | 20px |
| 테마 (다크) | `Moon` | 20px |
| 드롭다운 화살표 | `ChevronDown` | 16px |

---

## 10. 애니메이션 & 트랜지션

```css
:root {
  --transition-fast:   100ms ease;
  --transition-base:   150ms ease;
  --transition-slow:   250ms ease;
  --transition-modal:  200ms cubic-bezier(.4, 0, .2, 1);
}
```

| 요소 | 속성 | 지속시간 |
|------|------|---------|
| 버튼 hover | `background`, `box-shadow` | 150ms |
| 입력 focus | `border-color`, `box-shadow` | 150ms |
| 목록 행 hover | `background` | 100ms |
| 모달 등장 | `opacity`, `transform` | 200ms |
| 사이드바 (모바일) | `transform` | 250ms |
| 스켈레톤 | `opacity` (pulse) | 1500ms |

### 모달 등장 애니메이션

```css
@keyframes modal-in {
  from { opacity: 0; transform: translateY(-16px) scale(.96); }
  to   { opacity: 1; transform: translateY(0)     scale(1); }
}

.modal { animation: modal-in var(--transition-modal); }
```

---

## 11. 페이지별 레이아웃 적용

### 11-1. 로그인 / 회원가입 (WF-01, WF-02)

- 전체 화면 중앙 정렬 (flexbox, min-height: 100vh)
- 폼 카드: `max-width: 480px`, `.card` 스타일 적용
- 앱 타이틀 + 부제목: 카드 상단에 중앙 정렬

```
배경: --color-neutral-50
카드: .card (max-width 480px, margin auto)
버튼: .btn-primary (width 100%)
```

### 11-2. 메인 화면 (WF-03)

```
레이아웃: .app-layout (grid)
헤더: 56px, border-bottom
사이드바(데스크탑): 256px, --color-neutral-100
필터 탭: .filter-tabs (4개 탭)
할 일 목록: .todo-item 반복
FAB: .btn-fab (우하단 고정)
```

### 11-3. 할 일 등록/수정 모달 (WF-04)

```
오버레이: .modal-overlay
모달: .modal (max-width 600px)
폼 필드 간격: --space-5 (20px)
액션 버튼: 우측 정렬, [취소: .btn-secondary] [저장: .btn-primary]
```

### 11-4. 프로필 화면 (WF-05)

```
콘텐츠 max-width: 640px, margin auto
섹션 카드: .card, --space-6 gap
탈퇴 섹션: border-top border-color --color-error, 내부 .btn-danger
```

---

## 12. 접근성 체크리스트

| 항목 | 기준 | 구현 방법 |
|------|------|-----------|
| 색 대비 (일반 텍스트) | WCAG AA 4.5:1 이상 | `--color-neutral-900` on `--color-neutral-0` = 16.1:1 ✓ |
| 색 대비 (대형 텍스트) | WCAG AA 3:1 이상 | Primary 600 on White = 4.5:1 ✓ |
| 포커스 표시 | 모든 인터랙티브 요소 | `box-shadow: 0 0 0 2px --color-primary-600` |
| 키보드 내비게이션 | Tab 순서 논리적 | `tabIndex` 적절히 관리 |
| 스크린 리더 | ARIA 레이블 | 아이콘 버튼에 `aria-label`, 오류에 `aria-describedby` |
| 상태 배지 | 색만으로 상태 전달 금지 | 색 + 텍스트 병용 (예: `● 진행 중`) |
| 다크 모드 | 대비율 유지 | 다크 팔레트도 4.5:1 충족 |

---

## 13. CSS 변수 전체 목록 (빠른 참조)

```css
/* 색상 */
--color-primary-50 / 100 / 200 / 500 / 600 / 700
--color-neutral-0 / 50 / 100 / 200 / 400 / 600 / 700 / 900
--color-success / --color-success-bg
--color-warning / --color-warning-bg
--color-error   / --color-error-bg
--color-overdue / --color-overdue-bg

/* 타이포그래피 */
--font-family-base / --font-family-mono
--text-xs / sm / base / md / lg / xl
--font-normal / medium / semibold

/* 간격 */
--space-1 / 2 / 3 / 4 / 5 / 6 / 8 / 10 / 12 / 16

/* 모양 */
--radius-sm / md / lg / full

/* 그림자 */
--shadow-sm / md / lg / xl

/* 트랜지션 */
--transition-fast / base / slow / modal
```
