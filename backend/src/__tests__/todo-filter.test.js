import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';
process.env.BCRYPT_ROUNDS = '1';

const mockQuery = jest.fn();

await jest.unstable_mockModule('../db/pool.js', () => ({
  default: { query: mockQuery },
}));

const { default: app } = await import('../app.js');
const request = (await import('supertest')).default;

const validToken = jwt.sign({ id: 'user-uuid-1', email: 'test@test.com' }, 'test-secret');
const authHeader = `Bearer ${validToken}`;

// 픽스처
const futureTodo = {
  id: 'todo-1',
  userId: 'user-uuid-1',
  categoryId: 'cat-1',
  title: '미래 할 일',
  description: null,
  startDate: null,
  dueDate: '2099-12-31',
  status: 'NOT_STARTED',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const overdueTodo = {
  id: 'todo-2',
  userId: 'user-uuid-1',
  categoryId: 'cat-1',
  title: '기한 초과 할 일',
  description: null,
  startDate: null,
  dueDate: '2020-01-01',
  status: 'IN_PROGRESS',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const doneTodo = {
  id: 'todo-3',
  userId: 'user-uuid-1',
  categoryId: 'cat-2',
  title: '완료 할 일',
  description: null,
  startDate: null,
  dueDate: '2020-01-01',
  status: 'DONE',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ───────────────────────────────────────────────
// status 필터
// ───────────────────────────────────────────────
describe('GET /api/todos - status 필터', () => {
  beforeEach(() => mockQuery.mockReset());

  test('1. ?status=NOT_STARTED → 200, todos 배열 반환, mockQuery 1회 호출', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [futureTodo] });

    const res = await request(app)
      .get('/api/todos?status=NOT_STARTED')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.todos)).toBe(true);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(res.body.todos[0].status).toBe('NOT_STARTED');
  });

  test('2. ?status=IN_PROGRESS → 200, todos 배열 반환', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [overdueTodo] });

    const res = await request(app)
      .get('/api/todos?status=IN_PROGRESS')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.todos)).toBe(true);
    expect(res.body.todos[0].status).toBe('IN_PROGRESS');
  });

  test('3. ?status=DONE → 200, isOverdue false (DONE이므로)', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [doneTodo] });

    const res = await request(app)
      .get('/api/todos?status=DONE')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body.todos[0].isOverdue).toBe(false);
  });

  test('4. ?status=OVERDUE → 200, isOverdue true', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [overdueTodo] });

    const res = await request(app)
      .get('/api/todos?status=OVERDUE')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body.todos[0].isOverdue).toBe(true);
  });

  test('5. ?status=INVALID_VALUE → 400, VALIDATION_ERROR', async () => {
    const res = await request(app)
      .get('/api/todos?status=INVALID_VALUE')
      .set('Authorization', authHeader);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('6. status 파라미터 없음 → 200, 전체 목록', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [futureTodo, overdueTodo, doneTodo] });

    const res = await request(app)
      .get('/api/todos')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.todos)).toBe(true);
    expect(res.body.todos).toHaveLength(3);
  });
});

// ───────────────────────────────────────────────
// categoryId 필터
// ───────────────────────────────────────────────
describe('GET /api/todos - categoryId 필터', () => {
  beforeEach(() => mockQuery.mockReset());

  test('7. ?categoryId=cat-1 → 200, 해당 카테고리 todos', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [futureTodo, overdueTodo] });

    const res = await request(app)
      .get('/api/todos?categoryId=cat-1')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.todos)).toBe(true);
    expect(res.body.todos).toHaveLength(2);
    expect(res.body.todos.every((t) => t.categoryId === 'cat-1')).toBe(true);
  });

  test('8. ?categoryId=cat-999 (없는 카테고리) → 200, 빈 배열', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/api/todos?categoryId=cat-999')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ todos: [] });
  });
});

// ───────────────────────────────────────────────
// 복합 필터 (AND 결합)
// ───────────────────────────────────────────────
describe('GET /api/todos - 복합 필터 (AND 결합)', () => {
  beforeEach(() => mockQuery.mockReset());

  test('9. ?status=DONE&categoryId=cat-2 → 200, categoryId=cat-2이고 status=DONE', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [doneTodo] });

    const res = await request(app)
      .get('/api/todos?status=DONE&categoryId=cat-2')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body.todos[0].categoryId).toBe('cat-2');
    expect(res.body.todos[0].status).toBe('DONE');
  });

  test('10. ?status=NOT_STARTED&categoryId=cat-1 → 200', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [futureTodo] });

    const res = await request(app)
      .get('/api/todos?status=NOT_STARTED&categoryId=cat-1')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body.todos[0].status).toBe('NOT_STARTED');
    expect(res.body.todos[0].categoryId).toBe('cat-1');
  });

  test('11. ?status=OVERDUE&categoryId=cat-999 → 200, 빈 배열', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/api/todos?status=OVERDUE&categoryId=cat-999')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ todos: [] });
  });
});
