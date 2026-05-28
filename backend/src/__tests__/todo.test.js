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

const USER_ID = 'user-uuid-1';
const USER_EMAIL = 'test@test.com';

const validToken = jwt.sign({ id: USER_ID, email: USER_EMAIL }, 'test-secret');
const authHeader = `Bearer ${validToken}`;

const sampleTodo = {
  id: 'todo-uuid-1',
  userId: 'user-uuid-1',
  categoryId: 'cat-uuid-1',
  title: '테스트 할 일',
  description: null,
  startDate: null,
  dueDate: null,
  status: 'NOT_STARTED',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

// ───────────────────────────────────────────────
// GET /api/todos
// ───────────────────────────────────────────────
describe('GET /api/todos', () => {
  beforeEach(() => mockQuery.mockReset());

  test('1. 인증 헤더 없음 → 401', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(401);
  });

  test('2. 정상 요청 → 200, { todos: [...] }, isOverdue 포함', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [sampleTodo] });

    const res = await request(app)
      .get('/api/todos')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('todos');
    expect(Array.isArray(res.body.todos)).toBe(true);
    expect(res.body.todos[0]).toHaveProperty('isOverdue');
    expect(res.body.todos[0].isOverdue).toBe(false);
  });

  test('3. 기한 초과 todo → isOverdue: true', async () => {
    const overdueTodo = { ...sampleTodo, dueDate: '2020-01-01', status: 'NOT_STARTED' };
    mockQuery.mockResolvedValueOnce({ rows: [overdueTodo] });

    const res = await request(app)
      .get('/api/todos')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body.todos[0].isOverdue).toBe(true);
  });

  test('4. DONE 상태는 기한 초과여도 isOverdue: false', async () => {
    const doneTodo = { ...sampleTodo, dueDate: '2020-01-01', status: 'DONE' };
    mockQuery.mockResolvedValueOnce({ rows: [doneTodo] });

    const res = await request(app)
      .get('/api/todos')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body.todos[0].isOverdue).toBe(false);
  });
});

// ───────────────────────────────────────────────
// POST /api/todos
// ───────────────────────────────────────────────
describe('POST /api/todos', () => {
  beforeEach(() => mockQuery.mockReset());

  test('5. 인증 헤더 없음 → 401', async () => {
    const res = await request(app)
      .post('/api/todos')
      .send({ title: '할 일', categoryId: 'cat-uuid-1' });
    expect(res.status).toBe(401);
  });

  test('6. 유효한 요청 (categoryId 지정) → 201, { todo }', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [sampleTodo] });

    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', authHeader)
      .send({ title: '테스트 할 일', categoryId: 'cat-uuid-1' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('todo');
    expect(res.body.todo.id).toBe(sampleTodo.id);
  });

  test('7. categoryId 미지정 → 기본 카테고리 자동 적용 → 201', async () => {
    // 1. findDefaultCategoryByUserId
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'default-cat-id' }] });
    // 2. createTodo
    mockQuery.mockResolvedValueOnce({ rows: [sampleTodo] });

    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', authHeader)
      .send({ title: '테스트 할 일' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('todo');
  });

  test('8. 빈 title → 400, VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', authHeader)
      .send({ title: '', categoryId: 'cat-uuid-1' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('9. 101자 title → 400, VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', authHeader)
      .send({ title: 'a'.repeat(101), categoryId: 'cat-uuid-1' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('10. 1001자 description → 400, VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', authHeader)
      .send({ title: '할 일', description: 'a'.repeat(1001), categoryId: 'cat-uuid-1' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('11. dueDate < startDate → 400, INVALID_DATE_RANGE', async () => {
    const res = await request(app)
      .post('/api/todos')
      .set('Authorization', authHeader)
      .send({ title: '할 일', categoryId: 'cat-uuid-1', startDate: '2026-06-10', dueDate: '2026-06-01' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_DATE_RANGE');
  });
});

// ───────────────────────────────────────────────
// PATCH /api/todos/:id
// ───────────────────────────────────────────────
describe('PATCH /api/todos/:id', () => {
  beforeEach(() => mockQuery.mockReset());

  test('12. 인증 헤더 없음 → 401', async () => {
    const res = await request(app)
      .patch('/api/todos/todo-uuid-1')
      .send({ title: '수정된 제목' });
    expect(res.status).toBe(401);
  });

  test('13. 존재하지 않는 todo → 404, NOT_FOUND', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .patch('/api/todos/non-existent-id')
      .set('Authorization', authHeader)
      .send({ title: '수정된 제목' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  test('14. 타인의 todo → 403, FORBIDDEN', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ ...sampleTodo, userId: 'other-user' }] });

    const res = await request(app)
      .patch('/api/todos/todo-uuid-1')
      .set('Authorization', authHeader)
      .send({ title: '수정된 제목' });

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  test('15. 유효한 수정 → 200, { todo }', async () => {
    // 1. findTodoById
    mockQuery.mockResolvedValueOnce({ rows: [sampleTodo] });
    // 2. updateTodo
    mockQuery.mockResolvedValueOnce({ rows: [{ ...sampleTodo, title: '수정된 제목' }] });

    const res = await request(app)
      .patch('/api/todos/todo-uuid-1')
      .set('Authorization', authHeader)
      .send({ title: '수정된 제목' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('todo');
    expect(res.body.todo.title).toBe('수정된 제목');
  });

  test('16. 날짜 범위 오류 (기존 startDate 있는 todo에 dueDate만 변경 시 범위 위반) → 400', async () => {
    const todoWithDate = { ...sampleTodo, startDate: '2026-06-10', dueDate: '2026-06-20' };
    mockQuery.mockResolvedValueOnce({ rows: [todoWithDate] });

    const res = await request(app)
      .patch('/api/todos/todo-uuid-1')
      .set('Authorization', authHeader)
      .send({ dueDate: '2026-06-01' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_DATE_RANGE');
  });
});

// ───────────────────────────────────────────────
// PATCH /api/todos/:id/status
// ───────────────────────────────────────────────
describe('PATCH /api/todos/:id/status', () => {
  beforeEach(() => mockQuery.mockReset());

  test('17. 인증 헤더 없음 → 401', async () => {
    const res = await request(app)
      .patch('/api/todos/todo-uuid-1/status')
      .send({ status: 'IN_PROGRESS' });
    expect(res.status).toBe(401);
  });

  test('18. 유효하지 않은 status 값 → 400, VALIDATION_ERROR', async () => {
    const res = await request(app)
      .patch('/api/todos/todo-uuid-1/status')
      .set('Authorization', authHeader)
      .send({ status: 'INVALID_STATUS' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('19. 존재하지 않는 todo → 404, NOT_FOUND', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .patch('/api/todos/non-existent-id/status')
      .set('Authorization', authHeader)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  test('20. 정상 상태 변경 → 200, { todo }', async () => {
    // 1. findTodoById
    mockQuery.mockResolvedValueOnce({ rows: [sampleTodo] });
    // 2. updateTodoStatus
    mockQuery.mockResolvedValueOnce({ rows: [{ ...sampleTodo, status: 'IN_PROGRESS' }] });

    const res = await request(app)
      .patch('/api/todos/todo-uuid-1/status')
      .set('Authorization', authHeader)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('todo');
    expect(res.body.todo.status).toBe('IN_PROGRESS');
  });
});

// ───────────────────────────────────────────────
// DELETE /api/todos/:id
// ───────────────────────────────────────────────
describe('DELETE /api/todos/:id', () => {
  beforeEach(() => mockQuery.mockReset());

  test('21. 인증 헤더 없음 → 401', async () => {
    const res = await request(app).delete('/api/todos/todo-uuid-1');
    expect(res.status).toBe(401);
  });

  test('22. 존재하지 않는 todo → 404, NOT_FOUND', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete('/api/todos/non-existent-id')
      .set('Authorization', authHeader);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  test('23. 타인의 todo → 403, FORBIDDEN', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ ...sampleTodo, userId: 'other-user' }] });

    const res = await request(app)
      .delete('/api/todos/todo-uuid-1')
      .set('Authorization', authHeader);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  test('24. 정상 삭제 → 204', async () => {
    // 1. findTodoById
    mockQuery.mockResolvedValueOnce({ rows: [sampleTodo] });
    // 2. deleteTodo
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete('/api/todos/todo-uuid-1')
      .set('Authorization', authHeader);

    expect(res.status).toBe(204);
    expect(res.text).toBe('');
  });
});
