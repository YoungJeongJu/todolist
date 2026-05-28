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

// ───────────────────────────────────────────────
// GET /api/categories
// ───────────────────────────────────────────────
describe('GET /api/categories', () => {
  beforeEach(() => mockQuery.mockReset());

  test('1. 인증 헤더 없음 → 401', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(401);
  });

  test('2. 유효한 요청 → 200, { categories: [...] }', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'cat-id-1', userId: USER_ID, name: '기본', isDefault: true }],
    });

    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('categories');
    expect(Array.isArray(res.body.categories)).toBe(true);
    expect(res.body.categories.length).toBe(1);
    expect(res.body.categories[0].name).toBe('기본');
  });

  test('3. 카테고리 없을 때 → 200, { categories: [] }', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .get('/api/categories')
      .set('Authorization', authHeader);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('categories');
    expect(res.body.categories).toEqual([]);
  });
});

// ───────────────────────────────────────────────
// POST /api/categories
// ───────────────────────────────────────────────
describe('POST /api/categories', () => {
  beforeEach(() => mockQuery.mockReset());

  test('4. 인증 헤더 없음 → 401', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({ name: '업무' });
    expect(res.status).toBe(401);
  });

  test('5. 유효한 이름 → 201, { category: { id, userId, name, isDefault: false } }', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'cat-new-id', userId: USER_ID, name: '업무', isDefault: false }],
    });

    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', authHeader)
      .send({ name: '업무' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('category');
    expect(res.body.category.userId).toBe(USER_ID);
    expect(res.body.category.name).toBe('업무');
    expect(res.body.category.isDefault).toBe(false);
  });

  test('6. 빈 이름("") → 400, VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', authHeader)
      .send({ name: '' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('7. 31자 이름 → 400, VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', authHeader)
      .send({ name: 'a'.repeat(31) });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('8. name 필드 누락(undefined) → 400, VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', authHeader)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

// ───────────────────────────────────────────────
// DELETE /api/categories/:id
// ───────────────────────────────────────────────
describe('DELETE /api/categories/:id', () => {
  beforeEach(() => mockQuery.mockReset());

  test('9. 인증 헤더 없음 → 401', async () => {
    const res = await request(app).delete('/api/categories/cat-id');
    expect(res.status).toBe(401);
  });

  test('10. 존재하지 않는 카테고리 → 404, NOT_FOUND', async () => {
    // findCategoryById → rows: []
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete('/api/categories/non-existent-id')
      .set('Authorization', authHeader);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  test('11. 타인의 카테고리 삭제 → 403, FORBIDDEN', async () => {
    // findCategoryById → rows: [{ id, userId: 'other-user', isDefault: false }]
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'cat-id', userId: 'other-user', name: '타인카테고리', isDefault: false }],
    });

    const res = await request(app)
      .delete('/api/categories/cat-id')
      .set('Authorization', authHeader);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  test('12. 기본 카테고리 삭제 시도 → 400, CANNOT_DELETE_DEFAULT_CATEGORY', async () => {
    // findCategoryById → rows: [{ id, userId: USER_ID, isDefault: true }]
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'cat-id', userId: USER_ID, name: '기본', isDefault: true }],
    });

    const res = await request(app)
      .delete('/api/categories/cat-id')
      .set('Authorization', authHeader);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('CANNOT_DELETE_DEFAULT_CATEGORY');
  });

  test('13. 정상 삭제 → 204', async () => {
    // 1. findCategoryById
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'cat-id', userId: USER_ID, name: '업무', isDefault: false }],
    });
    // 2. findDefaultCategoryByUserId
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'default-cat-id' }],
    });
    // 3. reassignTodosToCategory (UPDATE)
    mockQuery.mockResolvedValueOnce({ rows: [] });
    // 4. deleteCategory (DELETE)
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete('/api/categories/cat-id')
      .set('Authorization', authHeader);

    expect(res.status).toBe(204);
    expect(res.text).toBe('');
  });
});
