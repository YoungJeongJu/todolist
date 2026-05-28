# 스타일 가이드 2 — TodoList 웹 애플리케이션

> 버전: 1.0 | 작성일: 2026-05-28 | 참조: Google Calendar 레퍼런스 UI, 8-wireframes.md

---

## 버전 이력

| 버전 | 날짜       | 변경 내용 |
| ---- | ---------- | --------- |
| 1.0  | 2026-05-28 | 최초 작성 — Google Calendar 레퍼런스 기반 디자인 시스템 |

---

## 1. 디자인 철학

Google Calendar의 시각 언어를 참조하여 **날짜·기한 중심의 할 일 관리**에 최적화된 UI를 지향한다.

| 원칙 | 설명 |
|------|------|
| **공간감** | 충분한 여백과 얇은 그리드 선으로 콘텐츠에 집중 |
| **색을 통한 분류** | 카테고리·상태를 색으로 즉시 구분 (Calendar의 캘린더 색상 체계 참조) |
| **인라인 액션** | 별도 페이지 이동 없이 모달/팝업으로 할 일을 등록·수정 |
| **경계 최소화** | 입력 필드는 하단 선만 표시, 배경으로 영역 구분 |
| **재료(Material) 감성** | Google Material Design 3의 아이콘 행·버튼·대화상자 패턴 적용 |

---

## 2. 컬러 시스템

### 2-1. 기본 팔레트

Google Calendar의 실제 색상을 측정·추출한 값이다.

```css
:root {
  /* Primary — Google Blue */
  --color-primary-50:  #e8f0fe;
  --color-primary-100: #d2e3fc;
  --color-primary-200: #aecbfa;
  --color-primary-500: #4285f4;
  --color-primary-600: #1a73e8;   /* Save 버튼, Today 마커, 링크 */
  --color-primary-700: #1557b0;

  /* Surface */
  --color-surface:        #ffffff;   /* 메인 배경, 모달 배경 */
  --color-surface-raised: #ffffff;   /* 카드, 팝업 */
  --color-surface-dim:    #f6f8fc;   /* 사이드바, hover 배경 */

  /* Neutral */
  --color-outline:        #dadce0;   /* 그리드 선, 테두리, 구분선 */
  --color-outline-focus:  #1a73e8;   /* 포커스 하단 선 */
  --color-text-primary:   #202124;   /* 날짜 숫자, 본문 */
  --color-text-secondary: #70757a;   /* 요일 헤더, 보조 텍스트 */
  --color-text-disabled:  #bdc1c6;

  /* Semantic */
  --color-today:          #1a73e8;   /* 오늘 날짜 원형 마커 */
  --color-today-text:     #ffffff;
  --color-error:          #d93025;
  --color-error-bg:       #fce8e6;
}
```

### 2-2. 카테고리 색상 팔레트

Google Calendar의 이벤트 색상 체계를 참조하여 카테고리별 색상을 정의한다. 체크박스·이벤트 칩·사이드바 도트에 동일하게 적용한다.

```css
:root {
  /* 카테고리 대표색 — 배경(칩) / 텍스트 쌍 */
  --cat-blue-bg:    #e8f0fe;  --cat-blue-text:    #1a73e8;  --cat-blue-dot:    #1a73e8;
  --cat-cyan-bg:    #e0f7fa;  --cat-cyan-text:    #0097a7;  --cat-cyan-dot:    #0097a7;
  --cat-green-bg:   #e6f4ea;  --cat-green-text:   #1e8e3e;  --cat-green-dot:   #33b679;
  --cat-sage-bg:    #f0f4e8;  --cat-sage-text:    #5b8043;  --cat-sage-dot:    #7bd148;
  --cat-yellow-bg:  #fef7e0;  --cat-yellow-text:  #b06000;  --cat-yellow-dot:  #f6c026;
  --cat-orange-bg:  #fce8e6;  --cat-orange-text:  #b31412;  --cat-orange-dot:  #ff7043;
  --cat-pink-bg:    #fce4ec;  --cat-pink-text:    #c62828;  --cat-pink-dot:    #e67c73;
  --cat-purple-bg:  #f3e8fd;  --cat-purple-text:  #6a0dad;  --cat-purple-dot:  #9e69af;
  --cat-graphite-bg:#f1f3f4;  --cat-graphite-text:#3c4043;  --cat-graphite-dot:#616161;
}
```

### 2-3. 다크 모드

```css
[data-theme="dark"] {
  --color-primary-600: #4285f4;

  --color-surface:        #1f1f1f;
  --color-surface-raised: #292929;
  --color-surface-dim:    #2d2d2d;

  --color-outline:        #3c4043;
  --color-outline-focus:  #4285f4;
  --color-text-primary:   #e8eaed;
  --color-text-secondary: #9aa0a6;
  --color-text-disabled:  #5f6368;

  --color-today:          #4285f4;
  --color-today-text:     #ffffff;
  --color-error:          #f28b82;
  --color-error-bg:       #3c1a18;

  /* 카테고리 칩 — 다크에서 배경 어둡게 */
  --cat-blue-bg:    #1a2744;
  --cat-green-bg:   #0d2e1a;
  --cat-yellow-bg:  #2e2200;
  --cat-orange-bg:  #3c1200;
  --cat-pink-bg:    #3c0a1a;
  --cat-purple-bg:  #220a3c;
  --cat-graphite-bg:#2d2d2d;
}
```

---

## 3. 타이포그래피

Google Calendar의 실제 폰트 사용을 참조한다.

```css
:root {
  --font-family-base: 'Google Sans', 'Noto Sans KR', -apple-system,
                      BlinkMacSystemFont, 'Segoe UI', sans-serif;

  /* 크기 스케일 */
  --text-xs:   11px;   /* 이벤트 칩, 타임스탬프 */
  --text-sm:   12px;   /* 미니 캘린더 날짜, 보조 레이블 */
  --text-base: 14px;   /* 본문, 입력, 폼 아이템 */
  --text-md:   16px;   /* 섹션 헤더, 모달 아이템 레이블 */
  --text-lg:   22px;   /* 모달 제목 입력 */
  --text-xl:   26px;   /* 날짜 숫자 (헤더 월/년) */

  /* 굵기 */
  --font-normal:   400;
  --font-medium:   500;
  --font-semibold: 600;
}
```

### 3-1. 날짜 숫자 표시 규칙

Google Calendar의 날짜 숫자 표시 방식을 참조한다.

| 상태 | 크기 | 굵기 | 색상 | 배경 |
|------|------|------|------|------|
| 일반 날짜 | 14px | 400 | `--color-text-primary` | 없음 |
| 오늘 날짜 | 14px | 500 | `--color-today-text` | `--color-today` 원형 |
| 기한 임박 (3일 이내) | 14px | 500 | `--color-primary-600` | 없음 |
| 기한 초과 | 14px | 500 | `--color-error` | 없음 |
| 비활성(이전 달) | 14px | 400 | `--color-text-disabled` | 없음 |

---

## 4. 간격 시스템

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
}
```

---

## 5. 모서리 반경

Google Calendar의 실제 값을 측정한 결과다.

```css
:root {
  --radius-xs:   4px;    /* 이벤트 칩 (종일 이벤트) */
  --radius-sm:   8px;    /* 입력 필드 컨테이너 (포커스 시) */
  --radius-md:   12px;   /* 모달, 팝오버 */
  --radius-lg:   16px;   /* Create 버튼, 드롭다운 패널 */
  --radius-full: 9999px; /* Save 버튼, 오늘 날짜 원형, 탭 칩 */
}
```

---

## 6. 그림자

```css
:root {
  /* 팝오버 (이벤트 생성 모달) */
  --shadow-popup:  0 8px 10px 1px rgba(0,0,0,.14),
                   0 3px 14px 2px rgba(0,0,0,.12),
                   0 5px 5px -3px rgba(0,0,0,.2);
  /* 드롭다운 */
  --shadow-menu:   0 2px 4px -1px rgba(0,0,0,.2),
                   0 4px 5px  0  rgba(0,0,0,.14),
                   0 1px 10px 0  rgba(0,0,0,.12);
  /* 카드 hover */
  --shadow-card:   0 1px 3px rgba(60,64,67,.3),
                   0 4px 8px 3px rgba(60,64,67,.15);
}
```

---

## 7. 레이아웃

### 7-1. 전체 구조

Google Calendar의 3영역 레이아웃을 참조한다.

```
+--------------------------------------------------+
| Header (60px — 로고·내비·뷰 전환·아이콘)         |
+-------------------+------------------------------+
| Sidebar (165px)   | Main Content (fluid)         |
| - Create 버튼     | - 필터 탭                    |
| - 미니 캘린더     | - 할 일 목록                 |
| - 카테고리 목록   |                              |
+-------------------+------------------------------+
```

```css
.app-layout {
  display: grid;
  grid-template-rows: 60px 1fr;
  grid-template-columns: 165px 1fr;
  grid-template-areas:
    "header  header"
    "sidebar main";
  height: 100vh;
  background: var(--color-surface);
}

@media (max-width: 767px) {
  .app-layout {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "main";
  }
}
```

### 7-2. Header (60px)

- 배경: `--color-surface`
- 하단 테두리: `1px solid --color-outline`
- 좌측: 햄버거 메뉴 아이콘 + 앱 로고
- 우측: 검색, 설정, 프로필 아이콘

### 7-3. Sidebar (165px)

- 배경: `--color-surface`
- 상단: `+ 할 일 추가` Create 버튼
- 중간: 카테고리 컬러 리스트
- 모바일: 드로어(서랍) 방식으로 전환

---

## 8. 컴포넌트

### 8-1. Create 버튼 (할 일 추가 진입점)

Google Calendar의 "+ Create" 버튼을 참조한다.

```css
.btn-create {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: 0 var(--space-4) 0 var(--space-3);
  height: 48px;
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  box-shadow: var(--shadow-card);
  cursor: pointer;
  transition: background 150ms, box-shadow 150ms;
}

.btn-create:hover {
  background: var(--color-surface-dim);
  box-shadow: var(--shadow-popup);
}

/* "+" 아이콘 */
.btn-create__icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-600);
}
```

### 8-2. Today 버튼 (네비게이션)

Google Calendar 헤더의 "Today" 버튼 스타일.

```css
.btn-today {
  height: 36px;
  padding: 0 var(--space-4);
  background: var(--color-surface);
  color: var(--color-text-primary);
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: background 150ms;
}

.btn-today:hover {
  background: var(--color-surface-dim);
}
```

### 8-3. Save 버튼 (모달 내 주요 액션)

Google Calendar 이벤트 생성 팝업의 "Save" 버튼.

```css
.btn-save {
  height: 36px;
  padding: 0 var(--space-6);
  background: var(--color-primary-600);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: background 150ms, box-shadow 150ms;
}

.btn-save:hover {
  background: var(--color-primary-700);
  box-shadow: 0 1px 3px rgba(0,0,0,.3);
}

.btn-save:disabled {
  background: var(--color-outline);
  color: var(--color-text-disabled);
  cursor: not-allowed;
}
```

### 8-4. More Options 버튼 (텍스트 버튼)

```css
.btn-text {
  height: 36px;
  padding: 0 var(--space-3);
  background: transparent;
  color: var(--color-primary-600);
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: background 150ms;
}

.btn-text:hover {
  background: var(--color-primary-50);
}
```

### 8-5. FAB (모바일 할 일 추가)

```css
.btn-fab {
  position: fixed;
  right: var(--space-4);
  bottom: var(--space-4);
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background: var(--color-primary-600);
  color: #ffffff;
  border: none;
  box-shadow: var(--shadow-popup);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  transition: background 150ms, box-shadow 150ms;
}

.btn-fab:hover {
  background: var(--color-primary-700);
}
```

---

### 8-6. 모달 (이벤트 생성 팝업)

Google Calendar의 이벤트 생성 팝업을 TodoList 할 일 등록 모달에 적용한다.

```css
/* 팝업 컨테이너 */
.popup {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-popup);
  width: 100%;
  max-width: 440px;
  padding: var(--space-4) 0 var(--space-3);
  overflow: hidden;
}

/* 팝업 헤더 (드래그 핸들 + 닫기) */
.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-3) var(--space-3);
}

.popup-drag-handle {
  color: var(--color-text-secondary);
}

.popup-close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background 150ms;
}

.popup-close:hover {
  background: var(--color-surface-dim);
}
```

#### 제목 입력 (하단 선만 표시)

Google Calendar의 "Add title" 스타일 — 박스가 없고 하단 선만 있는 입력 필드.

```css
.input-title {
  width: 100%;
  border: none;
  border-bottom: 2px solid var(--color-outline);
  background: transparent;
  font-size: var(--text-lg);      /* 22px */
  font-weight: var(--font-normal);
  color: var(--color-text-primary);
  padding: var(--space-1) var(--space-4);
  margin-bottom: var(--space-3);
  outline: none;
  transition: border-color 150ms;
}

.input-title::placeholder {
  color: var(--color-text-secondary);
}

.input-title:focus {
  border-bottom-color: var(--color-primary-600);
}
```

#### 탭 바 (Event | Task | Appointment)

```css
.popup-tabs {
  display: flex;
  gap: var(--space-1);
  padding: 0 var(--space-4);
  margin-bottom: var(--space-2);
}

.popup-tab {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  height: 32px;
  padding: 0 var(--space-3);
  border: none;
  border-radius: var(--radius-full);
  background: transparent;
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: background 150ms, color 150ms;
}

.popup-tab:hover {
  background: var(--color-surface-dim);
  color: var(--color-text-primary);
}

.popup-tab--active {
  background: var(--color-primary-50);
  color: var(--color-primary-600);
  font-weight: var(--font-medium);
}

/* "New" 배지 */
.popup-tab__badge {
  font-size: var(--text-xs);
  padding: 1px var(--space-1);
  background: var(--color-primary-600);
  color: #ffffff;
  border-radius: var(--radius-full);
}
```

#### 아이콘 행 폼 아이템

Google Calendar의 "Add guests", "Add location" 등 아이콘 + 텍스트 행 패턴.

```css
.form-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-2) var(--space-4);
  min-height: 48px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 150ms;
}

.form-row:hover {
  background: var(--color-surface-dim);
}

.form-row__icon {
  width: 20px;
  height: 20px;
  margin-top: 2px;
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.form-row__content {
  flex: 1;
  font-size: var(--text-base);
  color: var(--color-text-primary);
  line-height: 1.5;
}

.form-row__label {
  color: var(--color-text-secondary);
}

.form-row__sublabel {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-top: 2px;
}

/* 날짜/시간 행 */
.form-row--datetime .form-row__content {
  font-weight: var(--font-medium);
}

/* 구분선 */
.form-row-divider {
  height: 1px;
  background: var(--color-outline);
  margin: var(--space-1) var(--space-4);
}
```

#### 팝업 액션 영역

```css
.popup-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4) 0;
}
```

---

### 8-7. 필터 탭 (할 일 상태 필터)

Google Calendar의 Event | Task | Appointment 탭을 TodoList 상태 필터에 적용한다.

```css
.filter-chips {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  overflow-x: auto;
  scrollbar-width: none;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-outline);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  color: var(--color-text-primary);
  white-space: nowrap;
  cursor: pointer;
  transition: background 150ms, border-color 150ms;
}

.filter-chip:hover {
  background: var(--color-surface-dim);
}

.filter-chip--active {
  background: var(--color-primary-50);
  border-color: var(--color-primary-200);
  color: var(--color-primary-600);
  font-weight: var(--font-medium);
}

/* 상태별 칩 색상 */
.filter-chip--in-progress.filter-chip--active {
  background: var(--cat-blue-bg);
  border-color: var(--cat-blue-dot);
  color: var(--cat-blue-text);
}

.filter-chip--done.filter-chip--active {
  background: var(--cat-green-bg);
  border-color: var(--cat-green-dot);
  color: var(--cat-green-text);
}

.filter-chip--overdue.filter-chip--active {
  background: var(--color-error-bg);
  border-color: var(--color-error);
  color: var(--color-error);
}
```

---

### 8-8. 할 일 카드 (Event Chip 스타일)

Google Calendar의 이벤트 칩(종일 이벤트)을 TodoList 목록 아이템에 적용한다.

```css
.todo-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border-left: 4px solid var(--cat-blue-dot);   /* 카테고리 색상 */
  border-radius: 0 var(--radius-xs) var(--radius-xs) 0;
  margin-bottom: var(--space-1);
  cursor: pointer;
  transition: background 150ms, box-shadow 150ms;
}

.todo-card:hover {
  background: var(--color-surface-dim);
  box-shadow: var(--shadow-card);
  z-index: 1;
  position: relative;
}

/* 카테고리별 좌측 테두리 색 */
.todo-card[data-category-color="blue"]    { border-left-color: var(--cat-blue-dot);    }
.todo-card[data-category-color="green"]   { border-left-color: var(--cat-green-dot);   }
.todo-card[data-category-color="yellow"]  { border-left-color: var(--cat-yellow-dot);  }
.todo-card[data-category-color="orange"]  { border-left-color: var(--cat-orange-dot);  }
.todo-card[data-category-color="pink"]    { border-left-color: var(--cat-pink-dot);    }
.todo-card[data-category-color="purple"]  { border-left-color: var(--cat-purple-dot);  }
.todo-card[data-category-color="graphite"]{ border-left-color: var(--cat-graphite-dot);}

.todo-card__title {
  flex: 1;
  font-size: var(--text-base);
  color: var(--color-text-primary);
  line-height: 1.4;
}

.todo-card__title--done {
  text-decoration: line-through;
  color: var(--color-text-secondary);
}

.todo-card__meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.todo-card__date--overdue {
  color: var(--color-error);
  font-weight: var(--font-medium);
}

/* 완료 체크 원형 버튼 */
.todo-card__check {
  width: 20px;
  height: 20px;
  border: 2px solid var(--color-outline);
  border-radius: var(--radius-full);
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
  margin-top: 2px;
  transition: border-color 150ms, background 150ms;
}

.todo-card__check:hover {
  border-color: var(--color-primary-600);
}

.todo-card__check--done {
  background: var(--color-primary-600);
  border-color: var(--color-primary-600);
}
```

#### 소형 이벤트 칩 (사이드바·미니 캘린더용)

```css
.event-chip {
  display: block;
  padding: 1px var(--space-1);
  border-radius: var(--radius-xs);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

/* 카테고리 색상 적용 */
.event-chip--blue    { background: var(--cat-blue-bg);   color: var(--cat-blue-text);   }
.event-chip--green   { background: var(--cat-green-bg);  color: var(--cat-green-text);  }
.event-chip--yellow  { background: var(--cat-yellow-bg); color: var(--cat-yellow-text); }
.event-chip--overdue { background: var(--color-error-bg); color: var(--color-error);    }
```

---

### 8-9. 오늘 날짜 마커

```css
.today-marker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: var(--color-today);
  color: var(--color-today-text);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}
```

---

### 8-10. 카테고리 컬러 선택기

Google Calendar의 캘린더 색상 선택 UI를 카테고리 편집에 적용한다.

```css
.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding: var(--space-3);
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  border: none;
  cursor: pointer;
  position: relative;
  transition: transform 150ms, box-shadow 150ms;
}

.color-swatch:hover {
  transform: scale(1.15);
  box-shadow: 0 2px 4px rgba(0,0,0,.3);
}

/* 선택된 색상 — 체크 아이콘 표시 */
.color-swatch--selected::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius-full);
  background: url("data:image/svg+xml,...") center no-repeat; /* 흰색 체크 */
}
```

---

### 8-11. 카테고리 사이드바 체크리스트

Google Calendar의 "My calendars" 체크리스트 스타일.

```css
.category-list {
  padding: var(--space-2) 0;
}

.category-list__section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
  cursor: pointer;
}

.category-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  margin: 0 var(--space-2);
  cursor: pointer;
  transition: background 150ms;
}

.category-item:hover {
  background: var(--color-surface-dim);
}

/* 색상 체크박스 */
.category-checkbox {
  width: 18px;
  height: 18px;
  border-radius: var(--radius-xs);
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 체크박스 색상은 카테고리 색상 팔레트로 지정 */
.category-checkbox--checked {
  /* 체크 아이콘 흰색 */
}

.category-checkbox--unchecked {
  border: 2px solid currentColor;
  background: transparent;
}

.category-item__name {
  flex: 1;
  font-size: var(--text-base);
  color: var(--color-text-primary);
}

.category-item__actions {
  display: flex;
  gap: var(--space-1);
  opacity: 0;
  transition: opacity 150ms;
}

.category-item:hover .category-item__actions {
  opacity: 1;
}
```

---

### 8-12. 상태 드롭다운 (할 일 행 내)

```css
.status-select {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  height: 28px;
  padding: 0 var(--space-2);
  border: none;
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: background 150ms;
}

.status-select--not-started {
  background: var(--cat-graphite-bg);
  color: var(--cat-graphite-text);
}

.status-select--in-progress {
  background: var(--cat-blue-bg);
  color: var(--cat-blue-text);
}

.status-select--done {
  background: var(--cat-green-bg);
  color: var(--cat-green-text);
}

.status-select--overdue {
  background: var(--color-error-bg);
  color: var(--color-error);
}
```

---

### 8-13. 입력 필드 (일반 — 카테고리 이름 등)

```css
/* 기본 입력: 라운드 박스 스타일 */
.input {
  width: 100%;
  height: 40px;
  padding: 0 var(--space-3);
  background: var(--color-surface-dim);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-size: var(--text-base);
  color: var(--color-text-primary);
  outline: none;
  transition: border-color 150ms, background 150ms;
}

.input:hover {
  background: var(--color-surface);
  border-color: var(--color-outline);
}

.input:focus {
  background: var(--color-surface);
  border-color: var(--color-primary-600);
  box-shadow: 0 0 0 2px var(--color-primary-50);
}

.input--error {
  border-color: var(--color-error);
}

.input--error:focus {
  box-shadow: 0 0 0 2px var(--color-error-bg);
}

/* 인라인 오류 */
.input-error-msg {
  margin-top: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-error);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
```

---

### 8-14. 알림 / 토스트

```css
.snackbar {
  position: fixed;
  bottom: var(--space-6);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: #323232;
  color: #ffffff;
  border-radius: var(--radius-xs);
  font-size: var(--text-base);
  box-shadow: var(--shadow-popup);
  z-index: 300;
  animation: snackbar-in 200ms ease;
}

@keyframes snackbar-in {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0);   }
}

.snackbar__action {
  color: var(--color-primary-200);
  font-weight: var(--font-medium);
  cursor: pointer;
  text-transform: uppercase;
  font-size: var(--text-sm);
}
```

---

### 8-15. 빈 상태 (Empty State)

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-12) var(--space-6);
  text-align: center;
}

.empty-state__icon {
  width: 120px;
  height: 120px;
  opacity: .3;
}

.empty-state__title {
  font-size: var(--text-md);
  color: var(--color-text-primary);
  font-weight: var(--font-medium);
}

.empty-state__desc {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  max-width: 320px;
}
```

---

### 8-16. 확인 다이얼로그

```css
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.32);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  animation: fade-in 150ms ease;
}

.dialog {
  background: var(--color-surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-popup);
  padding: var(--space-6);
  max-width: 400px;
  width: calc(100% - var(--space-8));
  animation: scale-in 150ms cubic-bezier(.4, 0, .2, 1);
}

.dialog__title {
  font-size: var(--text-md);
  font-weight: var(--font-medium);
  color: var(--color-text-primary);
  margin-bottom: var(--space-3);
}

.dialog__body {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
  line-height: 1.6;
}

.dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
}

@keyframes fade-in  { from { opacity: 0; } to { opacity: 1; } }
@keyframes scale-in {
  from { opacity: 0; transform: scale(.92); }
  to   { opacity: 1; transform: scale(1);   }
}
```

---

## 9. 아이콘

Google Calendar와 동일하게 **Material Symbols Rounded** 또는 **Lucide React**를 사용한다.

| 역할 | Material Symbol | Lucide React | 크기 |
|------|----------------|-------------|------|
| 할 일 추가 (Create) | `add` | `Plus` | 24px |
| 닫기 | `close` | `X` | 20px |
| 수정/편집 | `edit` | `Pencil` | 18px |
| 삭제 | `delete` | `Trash2` | 18px |
| 날짜/캘린더 | `schedule` | `Clock` | 20px |
| 카테고리/태그 | `label` | `Tag` | 20px |
| 완료 체크 | `check_circle` | `CheckCircle2` | 20px |
| 기한 초과 경고 | `warning` | `AlertCircle` | 16px |
| 설명 | `notes` | `AlignLeft` | 20px |
| 프로필 | `person` | `User` | 20px |
| 로그아웃 | `logout` | `LogOut` | 20px |
| 설정 | `settings` | `Settings` | 20px |
| 다크 모드 | `dark_mode` | `Moon` | 20px |
| 라이트 모드 | `light_mode` | `Sun` | 20px |
| 드롭다운 | `expand_more` | `ChevronDown` | 18px |
| 뒤로 | `arrow_back` | `ArrowLeft` | 20px |
| 더 보기 | `more_vert` | `MoreVertical` | 20px |

---

## 10. 애니메이션

```css
:root {
  --easing-standard:  cubic-bezier(.4, 0, .2, 1);   /* Material Standard */
  --easing-decelerate: cubic-bezier(0, 0, .2, 1);   /* 진입 (위에서 아래) */
  --easing-accelerate: cubic-bezier(.4, 0, 1, 1);   /* 퇴장 */

  --duration-short:  100ms;
  --duration-medium: 200ms;
  --duration-long:   300ms;
}
```

| 요소 | 속성 | 지속 시간 | Easing |
|------|------|----------|--------|
| 버튼 hover | `background`, `box-shadow` | 150ms | standard |
| 입력 focus | `border-color`, `box-shadow` | 150ms | standard |
| 칩/탭 선택 | `background`, `color` | 150ms | standard |
| 카드 hover | `background`, `box-shadow` | 100ms | standard |
| 팝업 등장 | `opacity`, `transform` | 200ms | decelerate |
| 다이얼로그 | `opacity`, `transform(scale)` | 150ms | standard |
| 스낵바 | `opacity`, `translateY` | 200ms | decelerate |
| 드로어(모바일) | `transform(translateX)` | 300ms | standard |

---

## 11. 페이지별 적용

### 11-1. 로그인 / 회원가입

```
배경: --color-surface-dim
카드: --color-surface, border-radius --radius-md, shadow --shadow-card
제목 입력: .input-title (하단 선 스타일)
버튼: .btn-save (전체 너비)
```

### 11-2. 메인 화면

```
Header: 60px, --color-surface, border-bottom --color-outline
Sidebar: 165px, --color-surface
  - .btn-create (할 일 추가 진입)
  - .category-list (카테고리 컬러 체크리스트)
Main:
  - .filter-chips (상태 칩 필터)
  - .todo-card (카드 목록, 좌측 카테고리 색 테두리)
  - .btn-fab (모바일 우하단)
```

### 11-3. 할 일 등록/수정 모달

```
오버레이: rgba(0,0,0,.32)
팝업: .popup (max-width 440px)
  - .input-title (하단 선 제목 입력)
  - .popup-tabs (상태 탭)
  - .form-row × N (날짜, 카테고리, 설명 — 아이콘 행)
  - .popup-actions ([취소: .btn-text] [저장: .btn-save])
```

### 11-4. 프로필 화면

```
콘텐츠: max-width 560px, margin auto
섹션 카드: --color-surface, border --color-outline, border-radius --radius-md
입력 필드: .input (라운드 박스 스타일)
탈퇴 섹션: border-top 1px solid --color-error
```

---

## 12. 접근성

| 항목 | 기준 | 구현 |
|------|------|------|
| 색 대비 (일반 텍스트) | 4.5:1 이상 | `#202124` on `#fff` = 16.1:1 ✓ |
| 색 대비 (대형 텍스트) | 3:1 이상 | Primary 600 on White = 4.5:1 ✓ |
| 포커스 표시 | 모든 인터랙티브 요소 | `box-shadow: 0 0 0 2px --color-primary-50` |
| 카테고리 색상 | 색만으로 구분 금지 | 색 + 이름 텍스트 병용 |
| 체크박스 | 시각 외 상태 전달 | `aria-checked`, `role="checkbox"` |
| 모달 포커스 트랩 | 열려 있는 동안 포커스 모달 내 유지 | `focus-trap` 라이브러리 또는 직접 구현 |
| 다크 모드 | 대비율 유지 | 다크 팔레트도 4.5:1 충족 |

---

## 13. CSS 변수 빠른 참조

```css
/* 색상 */
--color-primary-50/100/200/500/600/700
--color-surface / surface-raised / surface-dim
--color-outline / outline-focus
--color-text-primary / secondary / disabled
--color-today / today-text
--color-error / error-bg

/* 카테고리 */
--cat-blue-bg/text/dot
--cat-cyan-bg/text/dot
--cat-green-bg/text/dot
--cat-sage-bg/text/dot
--cat-yellow-bg/text/dot
--cat-orange-bg/text/dot
--cat-pink-bg/text/dot
--cat-purple-bg/text/dot
--cat-graphite-bg/text/dot

/* 타이포그래피 */
--text-xs/sm/base/md/lg/xl
--font-normal/medium/semibold

/* 간격 */
--space-1/2/3/4/5/6/8/10/12

/* 모양 */
--radius-xs/sm/md/lg/full

/* 그림자 */
--shadow-popup / menu / card

/* 애니메이션 */
--easing-standard / decelerate / accelerate
--duration-short / medium / long
```
