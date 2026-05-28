# 프로젝트 구조 설계 원칙

> 버전: 1.0 | 작성일: 2026-05-27

---

## 버전 이력

| 버전 | 날짜       | 변경 내용 |
| ---- | ---------- | --------- |
| 1.0  | 2026-05-27 | 최초 작성 |

---

## 1. 최상위 원칙

### 1-1. 관심사 분리 (Separation of Concerns)

UI 렌더링, 서버 상태 페칭, 클라이언트 상태 관리, API 통신, 비즈니스 로직, 데이터 접근을 각각 독립된 계층에서 담당한다.

> 이 프로젝트는 사용자별로 격리된 할 일 데이터를 다루며, 파생 상태(OVERDUE)처럼 DB에 저장되지 않는 로직이 명시적으로 존재한다. 계층을 분리하지 않으면 파생 계산 로직이 UI 코드나 쿼리 로직에 혼재되어 유지보수가 어려워진다.

### 1-2. 단일 책임 (Single Responsibility)

파일 하나, 함수 하나는 하나의 역할만 수행한다. 복합적인 역할이 필요한 경우 여러 파일로 분리한다.

> 개인 프로젝트라도 향후 v2(테마, 다국어) 기능이 추가될 예정이므로, 책임이 뒤섞인 코드는 확장 시 수정 비용을 높인다.

### 1-3. 의존성 단방향 (Unidirectional Dependency)

상위 레이어는 하위 레이어를 호출할 수 있지만, 하위 레이어는 상위 레이어를 참조하지 않는다.

### 1-4. 오버엔지니어링 금지

현재 규모(1인 개발, 개인 TodoList)에 맞는 구조를 유지한다. 불필요한 추상화, 패턴 적용, 디렉토리 세분화는 하지 않는다.

### 1-5. PRD 제약 준수

Prisma ORM을 사용하지 않는다. 백엔드는 `pg` 라이브러리를 통해 PostgreSQL에 직접 쿼리를 작성한다.

---

## 2. 의존성 / 레이어 원칙

### 2-1. 프론트엔드 레이어 (단방향 하향)

```
UI 컴포넌트 (pages, components)
      │  렌더링 및 이벤트 처리만 담당
      ▼
Custom Hook (hooks/)
      │  서버 상태 또는 클라이언트 상태 접근 창구
      ▼
Store / TanStack Query (store/, queries/)
      │  Zustand: 테마 등 클라이언트 전역 상태
      │  TanStack Query: 서버 데이터 캐싱·페칭
      ▼
API 클라이언트 (api/)
      │  HTTP 요청 전송, 응답 파싱
      ▼
백엔드 API
```

규칙:

- 컴포넌트는 `api/`를 직접 호출하지 않는다. 반드시 Hook을 거친다.
- 파생 상태(OVERDUE) 계산은 Hook 또는 TanStack Query의 `select` 옵션에서 수행한다. 컴포넌트에서 직접 계산하지 않는다.
- Zustand store는 테마처럼 서버와 무관한 클라이언트 전역 상태에만 사용한다. 서버 데이터는 TanStack Query로 관리한다.

### 2-2. 백엔드 레이어 (단방향 하향)

```
Route (routes/)
      │  URL 매핑, 미들웨어 연결만 담당
      ▼
Controller (controllers/)
      │  요청 파싱, 응답 직렬화
      ▼
Service (services/)
      │  비즈니스 로직 (BR-* 규칙 적용 위치)
      │  예: 기본 카테고리 자동 생성, 할 일 이관, OVERDUE 판정 등
      ▼
Repository (repositories/)
      │  SQL 쿼리 작성 (pg 직접 사용)
      │  DB 접근만 담당
      ▼
PostgreSQL 17
```

규칙:

- Controller는 Service를 호출하며, 직접 DB 쿼리를 작성하지 않는다.
- Service는 비즈니스 규칙(BR-04~BR-10 등)을 구현하는 유일한 계층이다. Service가 다른 Service를 호출하는 것은 허용하나, 순환 참조는 금지한다.
- Repository는 순수하게 SQL과 DB 커넥션만 다룬다. 비즈니스 판단 로직을 포함하지 않는다.
- 인증 미들웨어는 Route 레벨에서 적용한다.

---

## 3. 코드 / 네이밍 원칙

### 3-1. 파일명

| 대상              | 규칙                                              | 예시                               |
| ----------------- | ------------------------------------------------- | ---------------------------------- |
| React 컴포넌트    | PascalCase, `.tsx`                                | `TodoItem.tsx`, `CategoryList.tsx` |
| Custom Hook       | camelCase, `use` 접두사, `.ts`                    | `useTodos.ts`, `useAuth.ts`        |
| Zustand store     | camelCase, `store` 접미사, `.ts`                  | `themeStore.ts`                    |
| TanStack Query    | camelCase, `queries` 또는 `mutations` 구분, `.ts` | `todoQueries.ts`                   |
| API 클라이언트    | camelCase, `.ts`                                  | `todoApi.ts`, `authApi.ts`         |
| 백엔드 Route      | camelCase, `.routes.js`                           | `todo.routes.js`, `auth.routes.js` |
| 백엔드 Controller | camelCase, `.controller.js`                       | `todo.controller.js`               |
| 백엔드 Service    | camelCase, `.service.js`                          | `todo.service.js`                  |
| 백엔드 Repository | camelCase, `.repository.js`                       | `todo.repository.js`               |
| i18n 번역 파일    | 언어 코드, `.json`                                | `ko.json`, `en.json`               |

### 3-2. 변수명 / 함수명

- JavaScript / TypeScript: camelCase
- 상수(변경 불가 고정값): UPPER_SNAKE_CASE
  - 예: `TODO_STATUS`, `DEFAULT_THEME`
- Boolean 변수: `is`, `has`, `can` 접두사 사용
  - 예: `isDefault`, `isOverdue`, `hasError`
- 이벤트 핸들러: `handle` 접두사 사용
  - 예: `handleSubmit`, `handleDelete`

### 3-3. React 컴포넌트명

- PascalCase를 사용한다.
- 페이지 컴포넌트는 `Page` 접미사를 붙인다.
  - 예: `LoginPage`, `MainPage`

### 3-4. DB 컬럼명

- 도메인 정의서(`1-domain-definition.md`)의 속성명을 camelCase로 적용한다.
  - 예: `userId`, `categoryId`, `startDate`, `dueDate`, `isDefault`, `themeMode`, `createdAt`, `updatedAt`
- SQL 쿼리 작성 시 컬럼명은 그대로 사용하며, pg 쿼리 결과를 camelCase로 변환하는 처리는 Repository에서 담당한다.

### 3-5. API 엔드포인트

- RESTful 명명 규칙을 따른다.
- 리소스명은 복수형 소문자를 사용한다.
- 예:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/todos`
  - `POST /api/todos`
  - `PATCH /api/todos/:id`
  - `DELETE /api/todos/:id`
  - `GET /api/categories`
  - `POST /api/categories`
  - `DELETE /api/categories/:id`

---

## 4. 테스트 / 품질 원칙

### 4-1. 테스트 범위

| 계층                | 테스트 유형             | 우선순위                         |
| ------------------- | ----------------------- | -------------------------------- |
| 백엔드 Service      | 단위 테스트             | 높음 — 비즈니스 규칙(BR-\*) 검증 |
| 백엔드 Repository   | 통합 테스트 (테스트 DB) | 중간                             |
| 백엔드 API          | E2E 테스트 (엔드포인트) | 중간                             |
| 프론트엔드 Hook     | 단위 테스트             | 중간                             |
| 프론트엔드 컴포넌트 | 최소한 (핵심 흐름만)    | 낮음                             |

> 1인 개발, 2일 내 핵심 기능 완성이라는 일정 제약을 고려하여 비즈니스 로직(Service)에 테스트 역량을 집중한다.

### 4-2. 테스트 파일 위치

- 테스트 파일은 대상 파일과 같은 디렉토리에 위치시킨다.
- 파일명은 `*.test.js` (백엔드) 또는 `*.test.ts` / `*.test.tsx` (프론트엔드)를 사용한다.
- 예:
  - `src/services/todo.service.js` → `src/services/todo.service.test.js`
  - `src/hooks/useTodos.ts` → `src/hooks/useTodos.test.ts`

### 4-3. 커버리지 기준

- 백엔드 Service 레이어: 80% 이상 목표
- 나머지 레이어: 별도 기준 없음 (핵심 비즈니스 규칙 커버에 집중)

### 4-4. 코드 품질

- ESLint + Prettier를 프론트엔드·백엔드 모두에 적용한다.
- 커밋 전 lint 통과를 확인한다.

---

## 5. 설정 / 보안 / 운영 원칙

### 5-1. 환경변수 관리

- 모든 민감 정보(DB 접속 정보, JWT 시크릿 등)는 환경변수(`.env`)로 관리한다.
- `.env` 파일은 `.gitignore`에 포함하여 버전 관리에서 제외한다.
- `.env.example` 파일을 제공하여 필요한 환경변수 목록을 문서화한다.
- 환경변수 접근은 백엔드에서만 수행하며, 프론트엔드에서는 `VITE_` 접두사가 붙은 공개 가능한 값만 사용한다.

#### 백엔드 환경변수 (`backend/.env.example`)

```dotenv
# 서버
NODE_ENV=development          # development | production
PORT=3000                     # Express 리슨 포트

# PostgreSQL 연결
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todolist
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key_min_32chars
JWT_EXPIRES_IN=7d             # 토큰 만료 기간 (예: 1h, 7d)

# 보안
BCRYPT_ROUNDS=10              # bcrypt 해시 라운드 수 (권장: 10~12)

# CORS
CORS_ORIGIN=http://localhost:5173   # 허용할 프론트엔드 출처
```

#### 프론트엔드 환경변수 (`frontend/.env.example`)

```dotenv
# API
VITE_API_BASE_URL=http://localhost:3000/api   # 백엔드 API 기본 URL
```

### 5-2. 인증 토큰

- JWT(JSON Web Token) 또는 세션 기반 인증을 사용한다 (PRD 5절 참조).
- 토큰은 httpOnly 쿠키 또는 메모리에 저장한다. `localStorage`에 토큰을 저장하지 않는다.
- 토큰 만료 시 미인증 상태로 처리하고 로그인 화면으로 리다이렉트한다 (US-20).

### 5-3. 비밀번호 저장

- 비밀번호는 반드시 bcrypt로 단방향 해시하여 저장한다. 평문 저장을 절대 금지한다.

### 5-4. 데이터 소유권 검증

- 모든 할 일·카테고리 CRUD API에서 요청 사용자의 `userId`와 리소스의 `userId`를 대조하여 타인 데이터 접근을 차단한다 (BR-04).
- 이 검증은 Service 계층에서 수행한다.

### 5-5. SQL 인젝션 방지

- `pg` 라이브러리의 파라미터화된 쿼리(`$1`, `$2`, ...)를 반드시 사용한다.
- 사용자 입력값을 SQL 문자열에 직접 삽입(템플릿 리터럴 등)하는 것을 금지한다.

### 5-6. 입력 유효성 검증

- 유효성 검증은 Service에서 수행한다. Controller는 요청 파싱과 응답 직렬화만 담당한다.
- 프론트엔드에서도 동일한 규칙으로 1차 검증을 수행하나, 백엔드 검증이 최종 기준이다.

### 5-7. CORS 설정

- 백엔드에서 허용할 출처(origin)를 `CORS_ORIGIN` 환경변수로 명시하고, 그 외 출처의 요청은 거부한다.
- 개발 환경과 운영 환경의 허용 출처를 분리하여 설정한다.
- `credentials: true`를 설정한다. httpOnly 쿠키 기반 인증을 사용하므로 자격증명 포함 요청을 허용해야 한다.
- 허용 메서드는 실제로 사용하는 것만 명시한다: `GET, POST, PATCH, DELETE`.
- 허용 헤더는 `Content-Type, Authorization`으로 제한한다.
- 와일드카드 출처(`*`)는 절대 사용하지 않는다. `credentials: true`와 함께 사용할 수 없으며, 모든 출처를 허용하면 CSRF 위험이 높아진다.

```js
// 적용 예 (app.js)
import cors from 'cors';

app.use(cors({
  origin: process.env.CORS_ORIGIN,   // 환경변수로 출처 제한
  credentials: true,                  // httpOnly 쿠키 전송 허용
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

### 5-8. 에러 응답 형식

모든 API 에러 응답은 다음 형식을 따른다:

```json
{
  "error": {
    "code": "DUPLICATE_EMAIL",
    "message": "이미 사용 중인 이메일입니다."
  }
}
```

- 에러 응답에 스택 트레이스나 내부 구현 정보를 포함하지 않는다.
- 로그인 실패 시 이메일 존재 여부를 노출하지 않는 포괄적 메시지를 사용한다 (US-22).

---

## 6. 프론트엔드 디렉토리 구조

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                     # HTTP 요청 함수 모음
│   │   ├── authApi.ts           # 인증 관련 API 호출
│   │   ├── todoApi.ts           # 할 일 관련 API 호출
│   │   ├── categoryApi.ts       # 카테고리 관련 API 호출
│   │   └── client.ts            # axios 인스턴스 또는 fetch 래퍼 (기본 URL, 토큰 처리)
│   ├── components/              # 재사용 UI 컴포넌트
│   │   ├── common/              # 버튼, 입력창 등 도메인 무관 공통 컴포넌트
│   │   ├── todo/                # 할 일 도메인 컴포넌트
│   │   └── category/            # 카테고리 도메인 컴포넌트
│   ├── hooks/                   # Custom Hook
│   │   ├── useAuth.ts           # 인증 상태 및 로그인/로그아웃
│   │   ├── useTodos.ts          # 할 일 목록 조회 + OVERDUE 파생 계산
│   │   ├── useCategories.ts     # 카테고리 목록 조회
│   │   └── useTheme.ts          # 테마 상태 접근 (Zustand store 래핑)
│   ├── pages/                   # 페이지 단위 컴포넌트
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── MainPage.tsx
│   │   └── ProfilePage.tsx
│   ├── queries/                 # TanStack Query 정의
│   │   ├── todoQueries.ts       # useQuery / useMutation for 할 일
│   │   ├── categoryQueries.ts   # useQuery / useMutation for 카테고리
│   │   └── authQueries.ts       # useQuery / useMutation for 인증
│   ├── store/                   # Zustand 클라이언트 상태
│   │   └── themeStore.ts        # themeMode 상태 (LIGHT | DARK)
│   ├── locales/                 # i18n 번역 리소스
│   │   ├── ko.json
│   │   └── en.json
│   ├── i18n.ts                  # i18next 초기화 설정
│   ├── router.tsx               # 라우트 정의 (React Router 등)
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── .eslintrc.json
├── .prettierrc
├── tsconfig.json
├── vite.config.ts
└── package.json
```

---

## 7. 백엔드 디렉토리 구조

```
backend/
├── src/
│   ├── routes/                  # Express 라우터 (URL 매핑, 미들웨어 연결)
│   │   ├── auth.routes.js
│   │   ├── todo.routes.js
│   │   └── category.routes.js
│   ├── controllers/             # 요청 파싱, 응답 반환
│   │   ├── auth.controller.js
│   │   ├── todo.controller.js
│   │   └── category.controller.js
│   ├── services/                # 비즈니스 로직 (BR-* 규칙 적용)
│   │   ├── auth.service.js
│   │   ├── todo.service.js
│   │   └── category.service.js
│   ├── repositories/            # SQL 쿼리 (pg 직접 사용)
│   │   ├── user.repository.js
│   │   ├── todo.repository.js
│   │   └── category.repository.js
│   ├── middlewares/             # Express 미들웨어
│   │   ├── auth.middleware.js   # JWT 검증, req.user 주입
│   │   └── error.middleware.js  # 전역 에러 핸들러
│   ├── db/                      # DB 연결 설정
│   │   └── pool.js              # pg Pool 인스턴스 생성 및 내보내기
│   ├── __tests__/               # 통합 테스트 (jest + supertest)
│   │   ├── app.test.js
│   │   ├── auth.test.js
│   │   ├── category.test.js
│   │   ├── middleware.test.js
│   │   ├── todo.test.js
│   │   └── todo-filter.test.js
│   └── app.js                   # Express 앱 초기화, 미들웨어·라우터 등록
├── swagger.json                 # OpenAPI 3.0 스펙 (swagger/swagger.json 사본)
├── server.js                    # 서버 진입점 (포트 리슨)
├── .env.example
└── package.json
```
