# 프론트엔드 개발 통합 가이드

> 버전: 1.0 | 작성일: 2026-05-28

---

## 목차

1. [개요](#1-개요)
2. [인증 흐름](#2-인증-흐름)
3. [API 엔드포인트 레퍼런스](#3-api-엔드포인트-레퍼런스)
4. [데이터 모델 (TypeScript)](#4-데이터-모델-typescript)
5. [에러 처리](#5-에러-처리)
6. [비즈니스 규칙 (프론트엔드 관점)](#6-비즈니스-규칙-프론트엔드-관점)
7. [상태 관리 가이드](#7-상태-관리-가이드)
8. [페이지별 구현 가이드](#8-페이지별-구현-가이드)
9. [개발 환경 설정](#9-개발-환경-설정)

---

## 1. 개요

### 문서 목적

본 문서는 TodoList 백엔드 API를 활용하여 프론트엔드를 개발할 때 필요한 모든 정보를 제공합니다. API 스펙, 데이터 모델, 에러 처리, 상태 관리 패턴, 그리고 페이지별 구현 가이드를 포함합니다.

### 대상 독자

- React + TypeScript 프론트엔드 개발자
- 프로젝트 구조 및 아키텍처 설계에 관심 있는 개발자

### 기술 스택

| 구분 | 기술 |
|------|------|
| **UI Framework** | React 19 |
| **언어** | TypeScript |
| **빌드 도구** | Vite |
| **상태 관리 (클라이언트 전역)** | Zustand |
| **상태 관리 (서버 데이터)** | TanStack Query (React Query) |
| **라우팅** | React Router |
| **다국어** | i18next + react-i18next |
| **스타일링** | (프로젝트 결정) |
| **HTTP 클라이언트** | axios 또는 fetch API |
| **캘린더** | react-big-calendar + date-fns |

### 백엔드 서버 정보

```
Base URL: http://localhost:3000
API Prefix: /api
Protocol: REST + JSON
Authentication: JWT Bearer Token
```

**프로덕션 배포 시** `VITE_API_BASE_URL` 환경변수로 변경합니다.

---

## 2. 인증 흐름

### 개요

TodoList 앱은 **JWT(JSON Web Token) Bearer 토큰 기반 인증**을 사용합니다. 모든 인증이 필요한 API 요청에는 `Authorization` 헤더에 토큰을 포함해야 합니다.

### 토큰 저장 위치

**절대 금지**: `localStorage`에 토큰을 저장하지 않습니다 (XSS 공격 취약성).

**권장**: 다음 중 하나:
- **메모리 저장** (간단함, 새로고침 시 로그아웃)
  ```typescript
  let authToken: string | null = null;
  
  export function setToken(token: string) {
    authToken = token;
  }
  
  export function getToken(): string | null {
    return authToken;
  }
  ```
- **httpOnly 쿠키** (권장, 자동 전송)
  ```typescript
  // 백엔드에서 Set-Cookie 헤더로 발급
  // axios/fetch에서 credentials: 'include' 설정
  ```

### 로그인 흐름

```
1. 사용자 이메일 + 비밀번호 입력
   ↓
2. POST /api/auth/login 요청
   ↓
3. 응답: { token: "JWT...", user: { id, email, name, themeMode, createdAt } }
   ↓
4. 토큰 저장 (메모리 또는 쿠키)
   ↓
5. 저장된 themeMode를 UI에 적용
   ↓
6. 메인 화면으로 이동
```

### 회원가입 및 즉시 로그인

```
1. 사용자 이메일 + 비밀번호 + 이름 입력
   ↓
2. POST /api/auth/register 요청
   ↓
3. 응답: { token: "JWT...", user: { ..., themeMode: "LIGHT" } }
   ↓
4. 토큰 저장
   ↓
5. 메인 화면으로 이동 (기본 카테고리가 자동 생성됨)
```

### 토큰 필요한 엔드포인트

모든 인증 필요 엔드포인트는 다음 헤더와 함께 요청합니다:

```
Authorization: Bearer <JWT_TOKEN>
```

**인증이 필요한 엔드포인트:**

- PATCH /api/auth/me — 내 정보 수정
- DELETE /api/auth/me — 회원 탈퇴
- GET /api/categories — 카테고리 목록 조회
- POST /api/categories — 카테고리 생성
- DELETE /api/categories/:id — 카테고리 삭제
- GET /api/todos — 할 일 목록 조회 (필터링 포함)
- POST /api/todos — 할 일 등록
- PATCH /api/todos/:id — 할 일 수정
- PATCH /api/todos/:id/status — 할 일 상태 변경
- DELETE /api/todos/:id — 할 일 삭제

**인증 불필요:**

- POST /api/auth/register — 회원가입
- POST /api/auth/login — 로그인

### 토큰 만료 및 자동 로그아웃

```
1. API 요청 시 응답이 401 Unauthorized (UNAUTHORIZED 에러)
   ↓
2. 프론트엔드: 토큰 삭제
   ↓
3. 로그인 화면으로 강제 리다이렉트
```

**구현 패턴 (axios interceptor 예시):**

```typescript
// api/client.ts
import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // httpOnly 쿠키 전송
});

// 응답 인터셉터
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 삭제
      localStorage.removeItem('authToken'); // 또는 메모리 초기화
      // 로그인 화면으로 리다이렉트
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 3. API 엔드포인트 레퍼런스

### 회원가입

#### POST /api/auth/register

**설명**: 이메일·비밀번호·이름으로 계정을 생성합니다. 가입 성공 시 '기본' 카테고리가 자동 생성되며, 즉시 로그인 상태가 됩니다.

**인증**: 불필요

**요청 Body**

| 필드 | 타입 | 필수 | 규칙 |
|------|------|------|------|
| email | string | O | 이메일 형식, 중복 불가 |
| password | string | O | 최소 8자, 영문+숫자 포함 |
| name | string | O | 1~50자 |

**요청 예시**

```json
{
  "email": "user@example.com",
  "password": "password1",
  "name": "홍길동"
}
```

**성공 응답 (201 Created)**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "홍길동",
    "themeMode": "LIGHT",
    "createdAt": "2026-05-28T12:00:00.000Z"
  }
}
```

**에러 응답**

| HTTP | 에러코드 | 메시지 | 발생 조건 |
|------|---------|--------|---------|
| 400 | INVALID_EMAIL | 유효하지 않은 이메일 형식입니다. | 이메일 형식 오류 |
| 400 | INVALID_PASSWORD | 비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다. | 비밀번호 규칙 미충족 |
| 400 | INVALID_NAME | 이름은 1~50자여야 합니다. | 이름 길이 초과/미만 |
| 409 | DUPLICATE_EMAIL | 이미 사용 중인 이메일입니다. | 이메일 중복 |

---

### 로그인

#### POST /api/auth/login

**설명**: 이메일·비밀번호로 로그인합니다. 성공 시 JWT 토큰과 저장된 themeMode가 포함된 사용자 정보를 반환합니다.

**인증**: 불필요

**요청 Body**

| 필드 | 타입 | 필수 |
|------|------|------|
| email | string | O |
| password | string | O |

**요청 예시**

```json
{
  "email": "user@example.com",
  "password": "password1"
}
```

**성공 응답 (200 OK)**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "홍길동",
    "themeMode": "DARK",
    "createdAt": "2026-05-28T12:00:00.000Z"
  }
}
```

**에러 응답**

| HTTP | 에러코드 | 메시지 | 발생 조건 |
|------|---------|--------|---------|
| 401 | INVALID_CREDENTIALS | 이메일 또는 비밀번호가 올바르지 않습니다. | 일치하지 않음 (어떤 필드가 틀렸는지 노출 X) |

---

### 내 정보 수정

#### PATCH /api/auth/me

**설명**: 로그인한 사용자 본인의 이름, 비밀번호, 테마 모드를 수정합니다. 수정할 항목만 포함하여 요청합니다.

**인증**: 필요 (Bearer Token)

**요청 Body** (전부 선택)

| 필드 | 타입 | 규칙 |
|------|------|------|
| name | string | 1~50자 |
| currentPassword | string | 비밀번호 변경 시 필수 |
| newPassword | string | 최소 8자, 영문+숫자 포함 |
| themeMode | string | "LIGHT" 또는 "DARK" |

**요청 예시 1 — 이름만 변경**

```json
{
  "name": "김철수"
}
```

**요청 예시 2 — 비밀번호 변경**

```json
{
  "currentPassword": "oldpassword1",
  "newPassword": "newpassword2"
}
```

**요청 예시 3 — 테마 변경**

```json
{
  "themeMode": "DARK"
}
```

**성공 응답 (200 OK)**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "김철수",
    "themeMode": "DARK",
    "createdAt": "2026-05-28T12:00:00.000Z"
  }
}
```

**에러 응답**

| HTTP | 에러코드 | 메시지 | 발생 조건 |
|------|---------|--------|---------|
| 400 | INVALID_NAME | 이름은 1~50자여야 합니다. | 이름 검증 실패 |
| 400 | INVALID_PASSWORD | 비밀번호는 8자 이상, 영문과 숫자를 포함해야 합니다. | 비밀번호 규칙 미충족 |
| 400 | INVALID_THEME | themeMode는 LIGHT 또는 DARK여야 합니다. | 잘못된 테마값 |
| 401 | UNAUTHORIZED | 인증이 필요합니다. | 토큰 없음/만료 |
| 401 | INVALID_CREDENTIALS | 현재 비밀번호가 올바르지 않습니다. | 현재 비밀번호 불일치 |

---

### 회원 탈퇴

#### DELETE /api/auth/me

**설명**: 로그인한 사용자 본인의 계정을 삭제합니다. 탈퇴 시 해당 사용자의 모든 할 일과 카테고리('기본' 포함)가 함께 삭제됩니다.

**인증**: 필요 (Bearer Token)

**요청 Body**: 없음

**성공 응답 (204 No Content)**

응답 본문 없음.

**에러 응답**

| HTTP | 에러코드 | 메시지 | 발생 조건 |
|------|---------|--------|---------|
| 401 | UNAUTHORIZED | 인증이 필요합니다. | 토큰 없음/만료 |

---

### 카테고리 목록 조회

#### GET /api/categories

**설명**: 로그인한 사용자 본인의 카테고리 목록을 조회합니다. '기본' 카테고리(isDefault=true)를 포함하여 반환합니다.

**인증**: 필요 (Bearer Token)

**쿼리 파라미터**: 없음

**성공 응답 (200 OK)**

```json
{
  "categories": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "기본",
      "isDefault": true
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "name": "업무",
      "isDefault": false
    }
  ]
}
```

**에러 응답**

| HTTP | 에러코드 | 메시지 | 발생 조건 |
|------|---------|--------|---------|
| 401 | UNAUTHORIZED | 인증이 필요합니다. | 토큰 없음/만료 |

---

### 카테고리 생성

#### POST /api/categories

**설명**: 새 카테고리를 생성합니다. 생성된 카테고리는 본인에게만 표시됩니다.

**인증**: 필요 (Bearer Token)

**요청 Body**

| 필드 | 타입 | 필수 | 규칙 |
|------|------|------|------|
| name | string | O | 1~30자 |

**요청 예시**

```json
{
  "name": "업무"
}
```

**성공 응답 (201 Created)**

```json
{
  "category": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "업무",
    "isDefault": false
  }
}
```

**에러 응답**

| HTTP | 에러코드 | 메시지 | 발생 조건 |
|------|---------|--------|---------|
| 400 | VALIDATION_ERROR | 카테고리 이름은 1~30자여야 합니다. | 이름 길이 초과/미만 |
| 401 | UNAUTHORIZED | 인증이 필요합니다. | 토큰 없음/만료 |

---

### 카테고리 삭제

#### DELETE /api/categories/{id}

**설명**: 카테고리를 삭제합니다. '기본' 카테고리(isDefault=true)는 삭제할 수 없습니다. 삭제 시 해당 카테고리의 할 일은 '기본' 카테고리로 자동 이관됩니다.

**인증**: 필요 (Bearer Token)

**경로 파라미터**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| id | UUID | 삭제할 카테고리 ID |

**요청 예시**

```
DELETE /api/categories/550e8400-e29b-41d4-a716-446655440002
Authorization: Bearer <TOKEN>
```

**성공 응답 (204 No Content)**

응답 본문 없음.

**에러 응답**

| HTTP | 에러코드 | 메시지 | 발생 조건 |
|------|---------|--------|---------|
| 400 | CANNOT_DELETE_DEFAULT_CATEGORY | '기본' 카테고리는 삭제할 수 없습니다. | 기본 카테고리 삭제 시도 |
| 401 | UNAUTHORIZED | 인증이 필요합니다. | 토큰 없음/만료 |
| 403 | FORBIDDEN | 접근 권한이 없습니다. | 본인 소유가 아닌 카테고리 |
| 404 | NOT_FOUND | 카테고리를 찾을 수 없습니다. | ID 오류 |

---

### 할 일 목록 조회 (필터링 포함)

#### GET /api/todos

**설명**: 로그인한 사용자 본인의 할 일 목록을 조회합니다. status 필터에 OVERDUE를 지정하면 기한 초과 항목(dueDate < 오늘 AND status != DONE)을 반환합니다. status와 categoryId 필터를 동시에 적용할 수 있습니다.

**인증**: 필요 (Bearer Token)

**쿼리 파라미터**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| status | string | X | NOT_STARTED, IN_PROGRESS, DONE, OVERDUE 중 하나 |
| categoryId | UUID | X | 특정 카테고리의 할 일만 조회 |

**요청 예시**

```
GET /api/todos?status=NOT_STARTED&categoryId=550e8400-e29b-41d4-a716-446655440001
Authorization: Bearer <TOKEN>
```

**성공 응답 (200 OK)**

```json
{
  "todos": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "categoryId": "550e8400-e29b-41d4-a716-446655440001",
      "title": "OpenAPI 스펙 작성",
      "description": "swagger.json 파일 작성",
      "startDate": "2026-05-28",
      "dueDate": "2026-05-29",
      "status": "IN_PROGRESS",
      "isOverdue": false,
      "createdAt": "2026-05-28T12:00:00.000Z",
      "updatedAt": "2026-05-28T13:00:00.000Z"
    }
  ]
}
```

**에러 응답**

| HTTP | 에러코드 | 메시지 | 발생 조건 |
|------|---------|--------|---------|
| 400 | VALIDATION_ERROR | status 파라미터가 유효하지 않습니다. | 잘못된 status 값 |
| 401 | UNAUTHORIZED | 인증이 필요합니다. | 토큰 없음/만료 |

---

### 할 일 등록

#### POST /api/todos

**설명**: 새 할 일을 등록합니다. 제목은 필수(1~100자)이며, 설명·시작일·종료일·카테고리는 선택 사항입니다. 카테고리 미지정 시 '기본' 카테고리가 자동 적용됩니다. 등록 시 기본 상태는 NOT_STARTED입니다.

**인증**: 필요 (Bearer Token)

**요청 Body**

| 필드 | 타입 | 필수 | 규칙 |
|------|------|------|------|
| title | string | O | 1~100자 |
| description | string | X | 최대 1000자 |
| startDate | string (date) | X | YYYY-MM-DD 형식 |
| dueDate | string (date) | X | YYYY-MM-DD 형식, startDate 이상 |
| categoryId | UUID | X | 미지정 시 '기본' 카테고리 적용 |

**요청 예시**

```json
{
  "title": "OpenAPI 스펙 작성",
  "description": "swagger.json 파일 작성",
  "startDate": "2026-05-28",
  "dueDate": "2026-05-29",
  "categoryId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**성공 응답 (201 Created)**

```json
{
  "todo": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "categoryId": "550e8400-e29b-41d4-a716-446655440001",
    "title": "OpenAPI 스펙 작성",
    "description": "swagger.json 파일 작성",
    "startDate": "2026-05-28",
    "dueDate": "2026-05-29",
    "status": "NOT_STARTED",
    "isOverdue": false,
    "createdAt": "2026-05-28T12:00:00.000Z",
    "updatedAt": "2026-05-28T12:00:00.000Z"
  }
}
```

**에러 응답**

| HTTP | 에러코드 | 메시지 | 발생 조건 |
|------|---------|--------|---------|
| 400 | VALIDATION_ERROR | 제목은 필수입니다. | 제목 미입력 |
| 400 | VALIDATION_ERROR | 제목은 1~100자여야 합니다. | 제목 길이 오류 |
| 400 | VALIDATION_ERROR | 설명은 최대 1000자입니다. | 설명 길이 초과 |
| 400 | INVALID_DATE_RANGE | 종료일은 시작일보다 같거나 이후여야 합니다. | dueDate < startDate |
| 401 | UNAUTHORIZED | 인증이 필요합니다. | 토큰 없음/만료 |
| 404 | NOT_FOUND | 카테고리를 찾을 수 없습니다. | 잘못된 categoryId |

---

### 할 일 수정

#### PATCH /api/todos/{id}

**설명**: 할 일의 제목·설명·시작일·종료일·카테고리를 수정합니다. 수정할 항목만 포함하여 요청합니다. 본인 소유의 할 일만 수정할 수 있습니다.

**인증**: 필요 (Bearer Token)

**경로 파라미터**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| id | UUID | 수정할 할 일 ID |

**요청 Body** (전부 선택)

| 필드 | 타입 | 규칙 |
|------|------|------|
| title | string | 1~100자 |
| description | string | 최대 1000자, null 가능 |
| startDate | string (date) | YYYY-MM-DD 형식 |
| dueDate | string (date) | YYYY-MM-DD 형식, startDate 이상 |
| categoryId | UUID | - |

**요청 예시**

```json
{
  "title": "OpenAPI 스펙 작성 (수정)",
  "dueDate": "2026-05-30"
}
```

**성공 응답 (200 OK)**

```json
{
  "todo": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "categoryId": "550e8400-e29b-41d4-a716-446655440001",
    "title": "OpenAPI 스펙 작성 (수정)",
    "description": "swagger.json 파일 작성",
    "startDate": "2026-05-28",
    "dueDate": "2026-05-30",
    "status": "IN_PROGRESS",
    "isOverdue": false,
    "createdAt": "2026-05-28T12:00:00.000Z",
    "updatedAt": "2026-05-28T14:00:00.000Z"
  }
}
```

**에러 응답**

| HTTP | 에러코드 | 메시지 | 발생 조건 |
|------|---------|--------|---------|
| 400 | VALIDATION_ERROR | (각 필드별 메시지) | 필드 검증 실패 |
| 400 | INVALID_DATE_RANGE | 종료일은 시작일보다 같거나 이후여야 합니다. | 날짜 범위 오류 |
| 401 | UNAUTHORIZED | 인증이 필요합니다. | 토큰 없음/만료 |
| 403 | FORBIDDEN | 접근 권한이 없습니다. | 본인 소유가 아닌 할 일 |
| 404 | NOT_FOUND | 할 일을 찾을 수 없습니다. | ID 오류 |

---

### 할 일 상태 변경

#### PATCH /api/todos/{id}/status

**설명**: 할 일의 상태를 변경합니다. 상태는 NOT_STARTED, IN_PROGRESS, DONE 중 하나이며 사용자의 명시적 조작으로만 변경됩니다. 본인 소유의 할 일만 변경할 수 있습니다.

**인증**: 필요 (Bearer Token)

**경로 파라미터**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| id | UUID | 상태를 변경할 할 일 ID |

**요청 Body**

| 필드 | 타입 | 필수 | 값 |
|------|------|------|-----|
| status | string | O | NOT_STARTED, IN_PROGRESS, DONE |

**요청 예시**

```json
{
  "status": "DONE"
}
```

**성공 응답 (200 OK)**

```json
{
  "todo": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "categoryId": "550e8400-e29b-41d4-a716-446655440001",
    "title": "OpenAPI 스펙 작성",
    "description": "swagger.json 파일 작성",
    "startDate": "2026-05-28",
    "dueDate": "2026-05-29",
    "status": "DONE",
    "isOverdue": false,
    "createdAt": "2026-05-28T12:00:00.000Z",
    "updatedAt": "2026-05-28T15:00:00.000Z"
  }
}
```

**에러 응답**

| HTTP | 에러코드 | 메시지 | 발생 조건 |
|------|---------|--------|---------|
| 400 | VALIDATION_ERROR | status는 NOT_STARTED, IN_PROGRESS, DONE 중 하나여야 합니다. | 잘못된 status 값 |
| 401 | UNAUTHORIZED | 인증이 필요합니다. | 토큰 없음/만료 |
| 403 | FORBIDDEN | 접근 권한이 없습니다. | 본인 소유가 아닌 할 일 |
| 404 | NOT_FOUND | 할 일을 찾을 수 없습니다. | ID 오류 |

---

### 할 일 삭제

#### DELETE /api/todos/{id}

**설명**: 할 일을 삭제합니다. 본인 소유의 할 일만 삭제할 수 있습니다.

**인증**: 필요 (Bearer Token)

**경로 파라미터**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| id | UUID | 삭제할 할 일 ID |

**요청 예시**

```
DELETE /api/todos/550e8400-e29b-41d4-a716-446655440010
Authorization: Bearer <TOKEN>
```

**성공 응답 (204 No Content)**

응답 본문 없음.

**에러 응답**

| HTTP | 에러코드 | 메시지 | 발생 조건 |
|------|---------|--------|---------|
| 401 | UNAUTHORIZED | 인증이 필요합니다. | 토큰 없음/만료 |
| 403 | FORBIDDEN | 접근 권한이 없습니다. | 본인 소유가 아닌 할 일 |
| 404 | NOT_FOUND | 할 일을 찾을 수 없습니다. | ID 오류 |

---

## 4. 데이터 모델 (TypeScript)

### User (사용자)

```typescript
export interface User {
  id: string;              // UUID
  email: string;           // 로그인 ID (이메일 형식)
  name: string;            // 사용자 이름 (1~50자)
  themeMode: 'LIGHT' | 'DARK';  // UI 테마 모드
  createdAt: string;       // ISO 8601 datetime string
}
```

### Category (카테고리)

```typescript
export interface Category {
  id: string;              // UUID
  userId: string;          // 소유 사용자 ID
  name: string;            // 카테고리명 (1~30자)
  isDefault: boolean;      // 기본 카테고리 여부 (true이면 삭제 불가)
}
```

### Todo (할 일)

```typescript
export interface Todo {
  id: string;              // UUID
  userId: string;          // 소유 사용자 ID
  categoryId: string;      // 소속 카테고리 ID
  title: string;           // 할 일 제목 (1~100자)
  description?: string;    // 상세 내용 (최대 1000자, 선택)
  startDate?: string;      // 시작일 (YYYY-MM-DD 또는 null)
  dueDate?: string;        // 종료일 (YYYY-MM-DD 또는 null)
  status: TodoStatus;      // 저장 상태
  isOverdue: boolean;      // 파생 필드: dueDate < 오늘 AND status !== 'DONE'
  createdAt: string;       // ISO 8601 datetime string
  updatedAt: string;       // ISO 8601 datetime string
}

export type TodoStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE';
```

### TodoStatusFilter (필터링용)

```typescript
export type TodoStatusFilter = 'NOT_STARTED' | 'IN_PROGRESS' | 'DONE' | 'OVERDUE';
```

**참고**: OVERDUE는 저장 상태가 아니며, GET /api/todos 쿼리 파라미터에서만 사용됩니다.

### ThemeMode (테마)

```typescript
export type ThemeMode = 'LIGHT' | 'DARK';
```

### ApiError (공통 에러 응답)

```typescript
export interface ApiError {
  error: {
    code: string;        // 에러 코드 (예: DUPLICATE_EMAIL, UNAUTHORIZED)
    message: string;     // 에러 메시지 (사용자가 읽을 수 있는 한국어)
  };
}
```

### 인증 응답

```typescript
export interface AuthResponse {
  token: string;         // JWT 토큰
  user: User;           // 사용자 정보 (password 필드 제외)
}
```

### API 요청/응답 타입

```typescript
// 인증 요청
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateMeRequest {
  name?: string;
  currentPassword?: string;      // 비밀번호 변경 시 필수
  newPassword?: string;
  themeMode?: ThemeMode;
}

// 카테고리 요청
export interface CreateCategoryRequest {
  name: string;                  // 1~30자
}

// 할 일 요청
export interface CreateTodoRequest {
  title: string;                 // 1~100자 (필수)
  description?: string;          // 최대 1000자
  startDate?: string;            // YYYY-MM-DD
  dueDate?: string;              // YYYY-MM-DD
  categoryId?: string;           // 미지정 시 기본 카테고리 자동 적용
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  categoryId?: string;
}

export interface UpdateTodoStatusRequest {
  status: TodoStatus;
}
```

---

## 5. 에러 처리

### 공통 에러 응답 형식

모든 API 에러 응답은 다음 형식을 따릅니다:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자가 읽을 수 있는 한국어 메시지"
  }
}
```

### 주요 에러 코드 목록

| 코드 | HTTP | 설명 | 대응 방법 |
|------|------|------|---------|
| INVALID_EMAIL | 400 | 이메일 형식 오류 | 사용자에게 유효한 이메일 형식 입력 안내 |
| INVALID_PASSWORD | 400 | 비밀번호 규칙 미충족 | 8자 이상, 영문+숫자 포함 안내 |
| INVALID_NAME | 400 | 이름 길이 오류 | 1~50자 범위 입력 안내 |
| DUPLICATE_EMAIL | 409 | 이메일 중복 | 다른 이메일 입력 안내 |
| VALIDATION_ERROR | 400 | 입력값 검증 실패 | 응답의 message를 사용자에게 표시 |
| INVALID_DATE_RANGE | 400 | 날짜 범위 오류 | dueDate >= startDate 조건 확인 |
| INVALID_CREDENTIALS | 401 | 로그인 실패 또는 현재 비밀번호 불일치 | "이메일 또는 비밀번호가 올바르지 않습니다" 표시 |
| INVALID_THEME | 400 | 잘못된 테마값 | LIGHT 또는 DARK만 허용 |
| UNAUTHORIZED | 401 | 토큰 없음/만료 | 로그인 화면으로 리다이렉트 |
| FORBIDDEN | 403 | 본인 소유가 아닌 리소스 접근 | 사용자에게 권한 없음 안내 |
| NOT_FOUND | 404 | 리소스를 찾을 수 없음 | "요청한 항목을 찾을 수 없습니다" 안내 |
| CANNOT_DELETE_DEFAULT_CATEGORY | 400 | 기본 카테고리 삭제 시도 | "기본 카테고리는 삭제할 수 없습니다" 표시 |

### 프론트엔드 에러 처리 패턴

#### 패턴 1: TanStack Query onError 핸들러

```typescript
// hooks/useTodos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodos, createTodo } from '../api/todoApi';

export function useTodos(status?: string, categoryId?: string) {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['todos', status, categoryId],
    queryFn: () => getTodos({ status, categoryId }),
  });

  const createMutation = useMutation({
    mutationFn: createTodo,
    onError: (error: any) => {
      const code = error.response?.data?.error?.code;
      const message = error.response?.data?.error?.message;
      
      // 에러 코드별 처리
      if (code === 'VALIDATION_ERROR') {
        alert(message);  // 또는 toast 사용
      } else if (code === 'UNAUTHORIZED') {
        window.location.href = '/login';
      } else if (code === 'FORBIDDEN') {
        alert('접근 권한이 없습니다.');
      }
    },
    onSuccess: () => {
      // 할 일 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  return { query, createMutation };
}
```

#### 패턴 2: Axios 전역 인터셉터

```typescript
// api/client.ts
import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// 응답 인터셉터
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const code = error.response?.data?.error?.code;
    
    if (code === 'UNAUTHORIZED') {
      // 토큰 삭제 및 로그인 화면으로 리다이렉트
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default client;
```

#### 패턴 3: 컴포넌트에서 에러 표시

```typescript
// components/TodoForm.tsx
import { useState } from 'react';
import { useTodos } from '../hooks/useTodos';

export function TodoForm() {
  const [error, setError] = useState<string | null>(null);
  const { createMutation } = useTodos();

  const handleSubmit = async (data: CreateTodoRequest) => {
    try {
      setError(null);
      await createMutation.mutateAsync(data);
    } catch (err: any) {
      const message = err.response?.data?.error?.message || '오류가 발생했습니다.';
      setError(message);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit({ /* ... */ });
    }}>
      {error && <div className="error-banner">{error}</div>}
      {/* 폼 필드 */}
    </form>
  );
}
```

### 401 자동 로그아웃 처리

```typescript
// hooks/useAuth.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

export function useAuth() {
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      try {
        // 예: GET /api/auth/me (토큰이 유효한지 확인)
        // 실제로는 로그인 시 토큰을 저장하고,
        // 요청마다 토큰이 포함되므로 자동으로 401 처리됨
        return { authenticated: true };
      } catch (error: any) {
        if (error.response?.status === 401) {
          navigate('/login');
          return { authenticated: false };
        }
        throw error;
      }
    },
  });

  return query;
}
```

---

## 6. 비즈니스 규칙 (프론트엔드 관점)

프론트엔드에서 반드시 알아야 할 규칙들입니다. 서버가 처리하므로, 프론트엔드에서 과도한 검증을 할 필요는 없지만 UX 향상을 위해 선제적으로 처리할 수 있습니다.

### 파생 필드: isOverdue

```typescript
// isOverdue는 서버 응답에 포함된 파생 필드
// 프론트엔드에서 재계산하지 않음

const todo = response.todo;  // { ..., isOverdue: true }

// UI에서 기한 초과 표시
if (todo.isOverdue) {
  return <span className="overdue">기한 초과</span>;
}
```

### OVERDUE 필터는 조회 시에만 존재

```typescript
// GET /api/todos?status=OVERDUE
// → dueDate < 오늘 AND status != 'DONE' 항목들 반환

// OVERDUE는 저장 상태가 아님
// status 필드의 값은 항상 'NOT_STARTED', 'IN_PROGRESS', 'DONE' 중 하나
```

### 기본 카테고리는 삭제 불가

```typescript
// isDefault=true인 카테고리
const defaultCategory = categories.find(c => c.isDefault);

// UI에서 삭제 버튼 비활성화
<button 
  onClick={handleDelete}
  disabled={defaultCategory.isDefault}
>
  삭제
</button>
```

### 카테고리 삭제 시 할 일 자동 이관

```typescript
// DELETE /api/categories/{id} 요청 시
// 서버가 자동으로 해당 카테고리의 할 일을 기본 카테고리로 이관
// 프론트엔드에서 별도 처리 불필요

// 삭제 후 할 일 목록 새로고침
queryClient.invalidateQueries({ queryKey: ['todos'] });
```

### 상태는 사용자 명시적 조작으로만 변경

```typescript
// 날짜 변경으로 상태가 자동으로 전이되지 않음
// PATCH /api/todos/:id (startDate, dueDate 변경)
// → status는 유지됨

// 상태를 변경하려면 명시적으로
// PATCH /api/todos/:id/status { status: 'DONE' }
```

### themeMode는 로그인 응답에 포함

```typescript
// POST /api/auth/login 응답
{
  "token": "...",
  "user": {
    "id": "...",
    "email": "...",
    "name": "...",
    "themeMode": "DARK",  // 저장된 값
    "createdAt": "..."
  }
}

// 로그인 직후 UI 테마 적용
useThemeStore.setState({ theme: user.themeMode });
```

---

## 7. 상태 관리 가이드

### TanStack Query (React Query) 사용 패턴

#### 쿼리 (서버 데이터 조회)

```typescript
// queries/todoQueries.ts
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getTodos } from '../api/todoApi';

export function useTodosQuery(status?: string, categoryId?: string) {
  return useQuery({
    queryKey: ['todos', status, categoryId],
    queryFn: () => getTodos({ status, categoryId }),
    staleTime: 1000 * 60 * 5,  // 5분
  });
}
```

#### 뮤테이션 (데이터 생성/수정/삭제)

```typescript
// queries/todoQueries.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTodo, updateTodo, deleteTodo } from '../api/todoApi';

export function useCreateTodoMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createTodo,
    onSuccess: () => {
      // 할 일 목록 쿼리 무효화 → 자동 재조회
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
    onError: (error) => {
      console.error('Failed to create todo:', error);
    },
  });
}

export function useUpdateTodoMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTodoRequest }) =>
      updateTodo(id, data),
    onSuccess: (updatedTodo) => {
      // 개별 항목 캐시 업데이트 (즉시 반영)
      queryClient.setQueryData(['todo', updatedTodo.id], updatedTodo);
      // 목록도 무효화 (필터가 변경될 수 있음)
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}

export function useDeleteTodoMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
```

### Zustand 사용 범위 (클라이언트 전역 상태)

**Zustand 사용**: 테마 등 **서버와 무관한** 클라이언트 전역 상태

```typescript
// store/themeStore.ts
import { create } from 'zustand';

type ThemeMode = 'LIGHT' | 'DARK';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'LIGHT',
  setTheme: (theme) => set({ theme }),
}));
```

**TanStack Query 사용**: 서버 데이터 (todos, categories, user)

```typescript
// TanStack Query로 관리
const { data: todos } = useTodosQuery();  // O
const { data: user } = useUserQuery();    // O
```

**Zustand 사용 금지**: 서버 데이터

```typescript
// ❌ 하지 말 것
export const useTodoStore = create(() => ({
  todos: [],   // 이것은 TanStack Query로 관리해야 함
}));
```

### 캐시 무효화 전략

```typescript
// 할 일 등록/수정/삭제 후 목록 쿼리 무효화
const { mutate: createTodo } = useMutation({
  mutationFn: createTodoApi,
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['todos'],  // 필터와 관계없이 전체 todos 쿼리 무효화
    });
  },
});

// 선택적 무효화 (현재 필터만 무효화)
onSuccess: () => {
  queryClient.invalidateQueries({
    queryKey: ['todos', currentStatus, currentCategoryId],
  });
};

// 카테고리 변경 후
const { mutate: createCategory } = useMutation({
  mutationFn: createCategoryApi,
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ['categories'],
    });
  },
});
```

### 필터 상태 관리

**권장**: URL query string 사용

```typescript
// pages/MainPage.tsx
import { useSearchParams } from 'react-router-dom';

export function MainPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const status = searchParams.get('status') || undefined;
  const categoryId = searchParams.get('categoryId') || undefined;
  
  const { data: todos } = useTodosQuery(status, categoryId);
  
  const handleStatusFilter = (newStatus: string) => {
    setSearchParams({ status: newStatus });
  };
  
  return (
    <div>
      <button onClick={() => handleStatusFilter('NOT_STARTED')}>미시작</button>
      {/* 필터 UI */}
    </div>
  );
}
```

**이점**:
- 필터 상태가 URL에 반영되므로 북마크/공유 가능
- 새로고침 시에도 필터 유지
- 브라우저 뒤로가기 지원

---

## 8. 페이지별 구현 가이드

### 로그인/회원가입 페이지 (US-01, US-02)

#### 할 일 목록

| 작업 | 관련 API | 상세 |
|------|---------|------|
| 회원가입 | POST /api/auth/register | 이메일, 비밀번호, 이름 입력 → 가입 → 즉시 로그인 |
| 로그인 | POST /api/auth/login | 이메일, 비밀번호 입력 → 로그인 → 토큰 저장 → themeMode 적용 → 메인 화면 이동 |
| 입력값 검증 | 클라이언트 | 이메일 형식, 비밀번호 규칙(8자, 영문+숫자) |
| 에러 처리 | 서버 응답 | DUPLICATE_EMAIL, INVALID_CREDENTIALS 등 |

#### 구현 예시

```typescript
// pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { login } from '../api/authApi';
import { useThemeStore } from '../store/themeStore';

export function LoginPage() {
  const navigate = useNavigate();
  const setTheme = useThemeStore((s) => s.setTheme);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      // 토큰 저장 (메모리 또는 쿠키)
      sessionStorage.setItem('authToken', response.token);
      
      // 테마 적용
      setTheme(response.user.themeMode);
      
      // 메인 화면 이동
      navigate('/');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message ||
        '로그인에 실패했습니다.';
      setError(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    mutate({ email, password });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={isPending}>
        로그인
      </button>
    </form>
  );
}
```

### 메인 페이지 — 할 일 목록 (US-07~US-12)

#### 할 일 목록

| 작업 | 관련 API | 상세 |
|------|---------|------|
| 할 일 목록 조회 | GET /api/todos | 기본 목록 또는 status/categoryId 필터 적용 |
| 상태별 필터링 | GET /api/todos?status=... | NOT_STARTED, IN_PROGRESS, DONE, OVERDUE |
| 카테고리별 필터링 | GET /api/todos?categoryId=... | 카테고리 선택 시 필터 적용 |
| 카테고리 목록 조회 | GET /api/categories | 좌측 사이드바 등에 표시 |
| 할 일 등록 | POST /api/todos | 제목 필수, 설명/날짜/카테고리 선택 |
| 할 일 수정 | PATCH /api/todos/:id | 수정 다이얼로그에서 변경 |
| 상태 변경 | PATCH /api/todos/:id/status | 드롭다운 또는 버튼 클릭 |
| 할 일 삭제 | DELETE /api/todos/:id | 확인 다이얼로그 후 삭제 |
| 카테고리 생성 | POST /api/categories | 모달에서 카테고리명 입력 |
| 카테고리 삭제 | DELETE /api/categories/:id | isDefault=false인 항목만 활성화 |

#### 구현 예시 — 할 일 목록 조회 + 필터링

```typescript
// pages/MainPage.tsx
import { useSearchParams } from 'react-router-dom';
import { useTodosQuery } from '../hooks/useTodos';
import { useCategoriesQuery } from '../hooks/useCategories';

export function MainPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const status = searchParams.get('status') || undefined;
  const categoryId = searchParams.get('categoryId') || undefined;
  
  const { data: todos = [], isLoading: todosLoading } = useTodosQuery(
    status,
    categoryId
  );
  const { data: categories = [] } = useCategoriesQuery();
  
  const handleFilterByStatus = (newStatus: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('status', newStatus);
      return next;
    });
  };
  
  const handleFilterByCategory = (newCategoryId: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('categoryId', newCategoryId);
      return next;
    });
  };

  return (
    <div className="main">
      {/* 좌측 사이드바: 카테고리 */}
      <aside className="sidebar">
        <h3>카테고리</h3>
        <ul>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() => handleFilterByCategory(cat.id)}
                className={categoryId === cat.id ? 'active' : ''}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* 메인: 할 일 목록 */}
      <main className="content">
        {/* 상태 필터 버튼 */}
        <div className="filters">
          <button
            onClick={() => handleFilterByStatus('NOT_STARTED')}
            className={status === 'NOT_STARTED' ? 'active' : ''}
          >
            미시작
          </button>
          <button
            onClick={() => handleFilterByStatus('IN_PROGRESS')}
            className={status === 'IN_PROGRESS' ? 'active' : ''}
          >
            진행 중
          </button>
          <button
            onClick={() => handleFilterByStatus('DONE')}
            className={status === 'DONE' ? 'active' : ''}
          >
            완료
          </button>
          <button
            onClick={() => handleFilterByStatus('OVERDUE')}
            className={status === 'OVERDUE' ? 'active' : ''}
          >
            기한 초과
          </button>
        </div>

        {/* 할 일 목록 */}
        {todosLoading ? (
          <p>로딩 중...</p>
        ) : todos.length === 0 ? (
          <p>할 일이 없습니다.</p>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
```

#### 구현 예시 — 할 일 상태 변경

```typescript
// components/TodoItem.tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTodoStatus } from '../api/todoApi';

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  const queryClient = useQueryClient();
  
  const { mutate: changeStatus } = useMutation({
    mutationFn: ({ todoId, status }: { todoId: string; status: TodoStatus }) =>
      updateTodoStatus(todoId, status),
    onSuccess: (updatedTodo) => {
      // 개별 항목 캐시 업데이트
      queryClient.setQueryData(['todo', updatedTodo.id], updatedTodo);
      // 목록도 무효화 (DONE으로 변경 시 OVERDUE 목록에서 제거될 수 있음)
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });

  const handleStatusChange = (newStatus: TodoStatus) => {
    changeStatus({ todoId: todo.id, status: newStatus });
  };

  return (
    <div className={`todo-item ${todo.isOverdue ? 'overdue' : ''}`}>
      <h4>{todo.title}</h4>
      <p>{todo.description}</p>
      
      {/* 상태 드롭다운 */}
      <select
        value={todo.status}
        onChange={(e) => handleStatusChange(e.target.value as TodoStatus)}
      >
        <option value="NOT_STARTED">미시작</option>
        <option value="IN_PROGRESS">진행 중</option>
        <option value="DONE">완료</option>
      </select>
      
      {/* 기한 초과 표시 */}
      {todo.isOverdue && <span className="overdue-badge">기한 초과</span>}
      
      {/* 기한 */}
      {todo.dueDate && (
        <p className="due-date">기한: {todo.dueDate}</p>
      )}
    </div>
  );
}
```

### 내 정보 수정 페이지 (US-03, US-04, US-13)

#### 할 일 목록

| 작업 | 관련 API | 상세 |
|------|---------|------|
| 이름 변경 | PATCH /api/auth/me | name 필드만 전송 |
| 비밀번호 변경 | PATCH /api/auth/me | currentPassword + newPassword 전송 |
| 테마 변경 | PATCH /api/auth/me | themeMode 전송 |
| 회원 탈퇴 | DELETE /api/auth/me | 확인 다이얼로그 후 실행 |

#### 구현 예시

```typescript
// pages/ProfilePage.tsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { updateMe, deleteMe } from '../api/authApi';
import { useThemeStore } from '../store/themeStore';

export function ProfilePage() {
  const setTheme = useThemeStore((s) => s.setTheme);
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [themeMode, setThemeMode] = useState<'LIGHT' | 'DARK'>('LIGHT');
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { mutate: updateProfile } = useMutation({
    mutationFn: updateMe,
    onSuccess: (response) => {
      setSuccess('정보가 업데이트되었습니다.');
      setTheme(response.user.themeMode);  // 테마 반영
      // 입력값 초기화
      setCurrentPassword('');
      setNewPassword('');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message ||
        '업데이트에 실패했습니다.';
      setError(message);
    },
  });

  const { mutate: withdrawMembership } = useMutation({
    mutationFn: deleteMe,
    onSuccess: () => {
      // 토큰 삭제
      sessionStorage.removeItem('authToken');
      // 로그인 페이지로 이동
      window.location.href = '/login';
    },
    onError: (error: any) => {
      const message = error.response?.data?.error?.message ||
        '탈퇴에 실패했습니다.';
      setError(message);
    },
  });

  const handleUpdateName = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    updateProfile({ name });
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    updateProfile({ currentPassword, newPassword });
  };

  const handleChangeTheme = (newTheme: 'LIGHT' | 'DARK') => {
    setError(null);
    updateProfile({ themeMode: newTheme });
  };

  const handleWithdraw = () => {
    if (window.confirm('정말 회원 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.')) {
      withdrawMembership();
    }
  };

  return (
    <div className="profile-page">
      {success && <div className="success">{success}</div>}
      {error && <div className="error">{error}</div>}

      {/* 이름 변경 */}
      <form onSubmit={handleUpdateName}>
        <h3>이름 변경</h3>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="새 이름"
        />
        <button type="submit">저장</button>
      </form>

      {/* 비밀번호 변경 */}
      <form onSubmit={handleUpdatePassword}>
        <h3>비밀번호 변경</h3>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="현재 비밀번호"
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="새 비밀번호"
        />
        <button type="submit">저장</button>
      </form>

      {/* 테마 변경 */}
      <div>
        <h3>테마</h3>
        <button
          onClick={() => handleChangeTheme('LIGHT')}
          className={themeMode === 'LIGHT' ? 'active' : ''}
        >
          Light
        </button>
        <button
          onClick={() => handleChangeTheme('DARK')}
          className={themeMode === 'DARK' ? 'active' : ''}
        >
          Dark
        </button>
      </div>

      {/* 회원 탈퇴 */}
      <div>
        <h3>계정 관리</h3>
        <button onClick={handleWithdraw} className="danger">
          회원 탈퇴
        </button>
      </div>
    </div>
  );
}
```

---

## 9. 개발 환경 설정

### 환경변수 (.env.local 또는 .env.development)

```dotenv
VITE_API_BASE_URL=http://localhost:3000/api
```

**프로덕션:**

```dotenv
VITE_API_BASE_URL=https://api.example.com/api
```

### CORS 설정

프론트엔드는 `credentials: 'include'`를 설정하여 httpOnly 쿠키를 함께 전송합니다.

**axios 예시:**

```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,  // httpOnly 쿠키 전송 허용
});
```

**fetch 예시:**

```typescript
fetch(`${import.meta.env.VITE_API_BASE_URL}/todos`, {
  method: 'GET',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',  // httpOnly 쿠키 전송 허용
});
```

### Vite 개발 서버 Proxy 설정

개발 중 CORS 이슈를 피하기 위해 proxy를 설정할 수 있습니다.

**vite.config.ts:**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
});
```

이 설정 시 프론트엔드에서 `/api/todos`로 요청하면 자동으로 `http://localhost:3000/api/todos`로 전달됩니다.

```typescript
// vite.config.ts proxy 사용 시
const client = axios.create({
  baseURL: '/api',  // 상대 경로로 변경 가능
  withCredentials: true,
});
```

### 토큰 저장 위치 설정

#### 옵션 1: 메모리 (간단, 새로고침 시 로그아웃)

```typescript
// store/authStore.ts
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  setToken: (token) => set({ token }),
}));

// 로그인 후
useAuthStore.setState({ token: response.token });

// API 요청 시
const token = useAuthStore((s) => s.token);
headers['Authorization'] = `Bearer ${token}`;
```

#### 옵션 2: sessionStorage (세션 유지, 브라우저 종료 시 자동 삭제)

```typescript
// api/client.ts
const getToken = () => sessionStorage.getItem('authToken');

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 로그인 후
sessionStorage.setItem('authToken', response.token);

// 로그아웃
sessionStorage.removeItem('authToken');
```

#### 옵션 3: httpOnly 쿠키 (서버에서 Set-Cookie로 발급)

백엔드에서 응답 헤더에 `Set-Cookie`를 포함하여 httpOnly 쿠키를 발급합니다. 프론트엔드는 `credentials: 'include'` 설정만 하면 자동으로 쿠키가 전송됩니다.

```typescript
// API 요청 시 자동으로 쿠키 포함
const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,  // 쿠키 자동 전송
});

// 로그인 시 서버가 Set-Cookie 헤더로 발급
// 프론트엔드는 별도 처리 불필요
```

---

---

## 10. 캘린더 뷰 구현 가이드

### 개요

메인 화면에서 목록 뷰와 캘린더 뷰를 전환할 수 있습니다. 캘린더 뷰는 월(Month) 보기와 주(Week) 보기를 지원합니다.

### 추가 패키지

```
react-big-calendar   — 월 캘린더 UI
date-fns             — 날짜 파싱·포매팅 (react-big-calendar localizer)
@types/react-big-calendar — 타입 정의
```

### 컴포넌트 구조

```
src/components/calendar/
├── CalendarView.tsx   — 월 보기 (react-big-calendar 래퍼)
└── WeekView.tsx       — 주 보기 (7일 그리드, 커스텀 구현)
```

### 날짜 파싱 주의사항

`new Date("2026-05-30")` 은 UTC 자정으로 파싱되어 로컬 타임존에 따라 날짜가 하루 밀릴 수 있습니다. 반드시 로컬 자정으로 파싱하세요:

```typescript
function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d); // 로컬 자정
}
```

### 이벤트 색상

| 상태 | 색상 | 헥스 |
|------|------|------|
| 미시작 (NOT_STARTED) | 회색 | `#70757a` |
| 진행 중 (IN_PROGRESS) | 오렌지 | `#f9ab00` |
| 완료 (DONE) | 초록 | `#1e8e3e` |
| 기한 초과 (isOverdue=true) | 빨간색 | `#d93025` |

### 뷰 전환 상태 관리

월/주 뷰 상태는 `MainPage`에서 관리하고 `CalendarView`에 prop으로 전달합니다. 목록/캘린더 뷰 상태도 동일하게 `MainPage`에서 관리합니다:

```typescript
// MainPage.tsx
const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
const [calView, setCalView] = useState<'month' | 'week'>('month');
```

### 주 보기 구현 방식

react-big-calendar의 기본 주 보기는 시간 그리드(time slots)를 표시하므로 날짜 기반 할 일 앱에 적합하지 않습니다. 대신 `WeekView` 컴포넌트를 별도로 구현합니다:

- 7열 CSS 그리드 (일~토)
- 각 열에 해당 날짜에 걸친 할 일(startDate <= day <= dueDate) 표시
- 이전/다음 주 네비게이션 및 오늘 버튼 포함

---

## 참고 문서

- `1-domain-definition.md` — 도메인 정의, 비즈니스 규칙
- `2-PRD.md` — 기능 요구사항
- `3-user-scenario.md` — 사용자 시나리오
- `4-project-structure.md` — 프로젝트 구조 및 아키텍처
- `5-arch-diagram.md` — 기술 아키텍처 다이어그램
- `6-ERD.md` — 데이터베이스 스키마
- `swagger/swagger.json` — API OpenAPI 스펙

---

**이 문서는 정기적으로 업데이트됩니다. 최종 수정일: 2026-05-29**
