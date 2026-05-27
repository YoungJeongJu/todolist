# TodoList 도메인 정의서

> 버전: 1.2 | 최종 수정일: 2026-05-27

---

## 1. 개요

### 앱 목적
인증된 사용자가 개인별로 할 일을 생성·관리할 수 있는 웹 애플리케이션이다.

### 핵심 문제
- 사용자별로 격리된 할 일 관리 공간이 없다.
- 할 일에 시작일과 종료일을 지정하고, 이를 기준으로 상태를 추적할 수 없다.

---

## 2. 도메인 용어 정의 (Ubiquitous Language)

| 용어 | 정의 |
|------|------|
| 사용자 (User) | 회원가입 후 로그인한 인증된 개인 |
| 할 일 (Todo) | 사용자가 등록한 단일 작업 단위로, 시작일·종료일·저장 상태를 갖는다 |
| 카테고리 (Category) | 할 일을 분류하는 그룹. 미지정 시 '기본' 카테고리가 자동 적용된다 |
| 시작일 (Start Date) | 할 일을 시작하는 날짜 |
| 종료일 (Due Date) | 할 일을 완료해야 하는 기한 날짜 |
| 저장 상태 (Stored Status) | DB에 저장되는 상태값 (미시작 / 진행 중 / 완료) |
| 기한 초과 (Overdue) | 종료일이 지났으나 완료되지 않은 상태. 조회 시 파생되며 DB에 저장되지 않는다 |
| 테마 (Theme) | 앱 UI의 색상 모드. LIGHT(기본) 또는 DARK 중 하나이며 User 레코드에 저장된다 |
| 다국어 (i18n) | UI 텍스트를 사용자 선택 언어로 표시하는 기능. 브라우저에 저장되며 DB에 저장되지 않는다 |

---

## 3. 핵심 도메인 엔티티

### User (사용자) — REQ-AUTH

| 속성 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | NOT NULL, PK | 고유 식별자 |
| email | String | NOT NULL, UNIQUE, 이메일 형식 | 로그인 ID |
| password | String | NOT NULL, 최소 8자, 영문+숫자 포함 | 암호화된 비밀번호 |
| name | String | NOT NULL, 1~50자 | 사용자 이름 |
| themeMode | Enum | NOT NULL, default: LIGHT | UI 테마: LIGHT \| DARK (v2) |
| createdAt | DateTime | NOT NULL | 가입 일시 |

### Category (카테고리) — REQ-CAT

| 속성 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | NOT NULL, PK | 고유 식별자 |
| userId | UUID | NOT NULL, FK(User) | 소유 사용자 |
| name | String | NOT NULL, 1~30자 | 카테고리명 |
| isDefault | Boolean | NOT NULL, default: false | '기본' 카테고리 여부 |

### Todo (할 일) — REQ-TODO

| 속성 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | UUID | NOT NULL, PK | 고유 식별자 |
| userId | UUID | NOT NULL, FK(User) | 소유 사용자 |
| categoryId | UUID | NOT NULL, FK(Category) | 소속 카테고리 (기본값: 기본 카테고리) |
| title | String | NOT NULL, 1~100자 | 할 일 제목 |
| description | String | 최대 1000자 | 상세 내용 (선택) |
| startDate | Date | nullable | 시작일 (선택) |
| dueDate | Date | nullable, startDate 이상 | 종료일 (선택) |
| status | Enum | NOT NULL, default: NOT_STARTED | 저장 상태: NOT_STARTED \| IN_PROGRESS \| DONE |
| createdAt | DateTime | NOT NULL | 등록 일시 |
| updatedAt | DateTime | NOT NULL | 최종 수정 일시 |

---

## 4. 할 일 상태 정의

### 4-1. 저장 상태 (DB 저장값)

| 상태 | 코드 | 진입 조건 |
|------|------|-----------|
| 미시작 | NOT_STARTED | 등록 시 기본값. 사용자가 수동으로 지정 가능 |
| 진행 중 | IN_PROGRESS | 사용자가 수동으로 지정 |
| 완료 | DONE | 사용자가 수동으로 지정 |

> 저장 상태는 **항상 사용자의 명시적 조작**으로만 변경된다. 날짜가 변경되어도 저장 상태는 자동으로 바뀌지 않는다.

### 4-2. 파생 상태 (조회 시 계산, DB 미저장)

| 상태 | 코드 | 판정 조건 |
|------|------|-----------|
| 기한 초과 | OVERDUE | dueDate < 오늘 날짜 AND status != DONE |

> OVERDUE는 저장 상태(status)와 독립적이다. 저장 상태가 NOT_STARTED 또는 IN_PROGRESS인 항목이 종료일을 경과하면 조회 시 OVERDUE로 표시된다.

### 4-3. 필터링 기준 매핑 — REQ-FILTER

| 필터 항목 | 판정 기준 |
|-----------|-----------|
| 미시작 목록 | status = NOT_STARTED AND OVERDUE 조건 미해당 |
| 진행 중 목록 | status = IN_PROGRESS AND OVERDUE 조건 미해당 |
| 완료 목록 | status = DONE |
| 기한 초과 목록 | dueDate < 오늘 날짜 AND status != DONE |
| 카테고리별 | categoryId = 선택한 카테고리 |

---

## 5. 비즈니스 규칙

### 인증 (REQ-AUTH)
- **BR-01** 회원가입 후 로그인(인증)해야만 모든 앱 기능을 사용할 수 있다.
- **BR-02** 사용자는 자신의 계정 정보(이름, 비밀번호)를 수정할 수 있다.
- **BR-03** 회원 탈퇴 시 해당 사용자의 모든 할 일과 카테고리('기본' 포함)는 함께 삭제된다.

### 데이터 소유권 (REQ-TODO, REQ-CAT)
- **BR-04** 할 일과 카테고리는 생성한 사용자에 귀속되며, 본인 외 접근·수정·삭제가 불가능하다.

### 카테고리 (REQ-CAT)
- **BR-05** 회원가입 시 '기본' 카테고리가 자동 생성된다.
- **BR-06** '기본' 카테고리는 삭제할 수 없다.
- **BR-07** 사용자 정의 카테고리 삭제 시, 해당 카테고리에 속한 할 일은 '기본' 카테고리로 자동 이관된다.
- **BR-08** 할 일 등록 시 카테고리를 지정하지 않으면 '기본' 카테고리가 자동 적용된다.

### 할 일 날짜 (REQ-TODO)
- **BR-09** 종료일(dueDate)은 시작일(startDate)과 같거나 이후여야 한다.
- **BR-10** 상태는 사용자의 명시적 조작으로만 변경되며, 날짜 변경에 의해 자동으로 바뀌지 않는다.

### 테마 (REQ-THEME) — v2
- **BR-11** 사용자는 LIGHT / DARK 중 하나를 선택할 수 있으며, 선택값은 User 레코드에 즉시 저장된다.
- **BR-12** 로그인 시 저장된 themeMode가 자동 적용된다.
- **BR-13** 미인증 상태(로그인·회원가입 화면)에서는 기본값 LIGHT가 적용된다.

### 다국어 (REQ-I18N) — v2
- **BR-14** 지원 언어는 한국어(ko)와 영어(en)이다.
- **BR-15** 언어 설정은 브라우저 로컬스토리지에 저장되며, User 레코드에는 저장되지 않는다.

---

## 6. 주요 기능 요약

| 기능 영역 | 세부 기능 | 관련 규칙 | 버전 |
|-----------|-----------|-----------|------|
| 인증 (REQ-AUTH) | 회원가입, 로그인, 내 정보 수정, 회원 탈퇴 | BR-01, BR-02, BR-03 | v1 |
| 카테고리 관리 (REQ-CAT) | 카테고리 생성·삭제, 기본 카테고리 자동 지정 | BR-05, BR-06, BR-07, BR-08 | v1 |
| 할 일 관리 (REQ-TODO) | 등록(시작일·종료일 캘린더 선택), 수정, 삭제, 상태 변경 | BR-04, BR-09, BR-10 | v1 |
| 필터링 (REQ-FILTER) | 카테고리별 / 상태별 / 기한 초과 필터링 | 4-3절 참조 | v1 |
| 테마 (REQ-THEME) | Dark/Light 모드 선택·저장, 로그인 시 자동 복원 | BR-11, BR-12, BR-13 | v2 |
| 다국어 (REQ-I18N) | 한국어/영어 전환, 브라우저 로컬스토리지 저장 | BR-14, BR-15 | v2 |
