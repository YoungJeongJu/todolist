# 기술 아키텍처 다이어그램

> 버전: 1.0 | 작성일: 2026-05-27

---

## 버전 이력

| 버전 | 날짜       | 변경 내용 |
| ---- | ---------- | --------- |
| 1.0  | 2026-05-27 | 최초 작성 |

---

## 다이어그램 1 — 전체 시스템 구성

시스템은 3계층으로 구성되며, 사용자의 브라우저에서 시작하여 백엔드를 거쳐 데이터베이스에 도달하는 단방향 흐름을 따릅니다.

```mermaid
graph LR
    A["Browser<br/>(React 19<br/>TypeScript<br/>Vite)"]
    B["Backend<br/>(Node.js<br/>Express<br/>JavaScript)"]
    C["PostgreSQL 17"]

    A -->|API 요청<br/>JSON| B
    B -->|응답| A
    B -->|SQL 쿼리| C
    C -->|결과| B

    style A fill:#e1f5ff
    style B fill:#f3e5f5
    style C fill:#e8f5e9
```

---

## 다이어그램 2 — 프론트엔드 레이어

프론트엔드는 UI에서 API까지 4단계 계층으로 구성되며, 컴포넌트는 항상 Hook을 통해 상태 및 서버 데이터에 접근합니다.

```mermaid
graph TD
    A["Page / Component<br/>(React)"]
    B["Custom Hook<br/>(useTodos, useAuth, etc.)"]
    C["Store / Query<br/>(Zustand, TanStack Query)"]
    D["API Client<br/>(fetch, axios)"]
    E["Backend API"]

    A -->|렌더링 및 이벤트| B
    B -->|상태 및 데이터| A
    B -->|접근| C
    C -->|요청| D
    D -->|응답| C
    C -->|결과| B
    D -->|HTTP 요청| E
    E -->|응답| D

    style A fill:#e1f5ff
    style B fill:#fff9c4
    style C fill:#f3e5f5
    style D fill:#fce4ec
    style E fill:#f3e5f5
```

---

## 다이어그램 3 — 백엔드 레이어

백엔드는 라우팅에서 데이터베이스까지 5단계 계층으로 구성되며, 비즈니스 로직은 Service 계층에서 집중 관리됩니다.

```mermaid
graph TD
    A["Route<br/>(Express Router)"]
    B["Controller"]
    C["Service"]
    D["Repository"]
    E["PostgreSQL 17"]

    A -->|URL 매핑<br/>미들웨어| B
    B -->|파싱·검증| C
    C -->|비즈니스 로직<br/>BR-* 규칙| D
    D -->|SQL 쿼리| E
    E -->|결과| D
    D -->|데이터| C
    C -->|처리| B
    B -->|응답| A

    style A fill:#fff9c4
    style B fill:#f1f8e9
    style C fill:#e0f2f1
    style D fill:#fce4ec
    style E fill:#e8f5e9
```
