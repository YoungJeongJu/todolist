-- =============================================================
-- TodoList 데이터베이스 스키마
-- 작성일: 2026-05-27
-- 대상: PostgreSQL 17
-- 참조: docs/6-ERD.md v1.0
-- =============================================================

-- -------------------------------------------------------------
-- ENUM 타입 정의
-- -------------------------------------------------------------

CREATE TYPE theme_mode AS ENUM ('LIGHT', 'DARK');

CREATE TYPE todo_status AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'DONE');

-- -------------------------------------------------------------
-- 테이블 생성
-- -------------------------------------------------------------

-- User (사용자)
-- BR-03: 탈퇴 시 연관된 카테고리·할 일은 CASCADE 삭제
CREATE TABLE "user" (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,
    name        VARCHAR(50)   NOT NULL,
    theme_mode  theme_mode    NOT NULL DEFAULT 'LIGHT',
    created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Category (카테고리)
-- BR-07: 카테고리 삭제 시 할 일 이관은 Service 계층에서 처리
--        DB 레벨에서는 직접 삭제를 막기 위해 ON DELETE RESTRICT 적용
CREATE TABLE category (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID          NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    name        VARCHAR(30)   NOT NULL,
    is_default  BOOLEAN       NOT NULL DEFAULT FALSE
);

-- Todo (할 일)
-- BR-09: due_date >= start_date (CHECK 제약)
-- BR-10: status 자동 전이 없음 — 애플리케이션 레벨에서 보장
-- OVERDUE: 파생 상태, DB 미저장 — 조회 시 계산
CREATE TABLE todo (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID         NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    category_id  UUID         NOT NULL REFERENCES category(id) ON DELETE RESTRICT,
    title        VARCHAR(100) NOT NULL,
    description  VARCHAR(1000),
    start_date   DATE,
    due_date     DATE,
    status       todo_status  NOT NULL DEFAULT 'NOT_STARTED',
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_due_date CHECK (
        due_date IS NULL
        OR start_date IS NULL
        OR due_date >= start_date
    )
);

-- -------------------------------------------------------------
-- updated_at 자동 갱신 트리거
-- -------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_todo_updated_at
BEFORE UPDATE ON todo
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- -------------------------------------------------------------
-- 인덱스
-- -------------------------------------------------------------

-- 사용자별 카테고리 조회 (REQ-CAT)
CREATE INDEX idx_category_user_id ON category(user_id);

-- 사용자별 할 일 조회 (REQ-TODO)
CREATE INDEX idx_todo_user_id ON todo(user_id);

-- 카테고리별 필터링 (UC-12)
CREATE INDEX idx_todo_category_id ON todo(category_id);

-- 상태별 필터링 (UC-11)
CREATE INDEX idx_todo_user_status ON todo(user_id, status);

-- 기한 초과(OVERDUE) 계산: due_date 기준 조회 (UC-11 AC-04)
CREATE INDEX idx_todo_due_date ON todo(due_date) WHERE due_date IS NOT NULL;
