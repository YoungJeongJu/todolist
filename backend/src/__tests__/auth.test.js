import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';
process.env.BCRYPT_ROUNDS = '1';

const mockQuery = jest.fn();

await jest.unstable_mockModule('../db/pool.js', () => ({
  default: { query: mockQuery },
}));

const { default: app } = await import('../app.js');

const request = (await import('supertest')).default;

// 테스트 전반에서 공유할 픽스처
const USER_ID = 'user-uuid-1';
const USER_EMAIL = 'test@test.com';
const USER_NAME = '홍길동';
const RAW_PASSWORD = 'password1';

let hashedPassword;

beforeAll(async () => {
  hashedPassword = await bcrypt.hash(RAW_PASSWORD, 1);
});

function makeUserRow(overrides = {}) {
  return {
    id: USER_ID,
    email: USER_EMAIL,
    name: USER_NAME,
    password: hashedPassword,
    themeMode: 'LIGHT',
    createdAt: new Date(),
    ...overrides,
  };
}

function validToken(id = USER_ID, email = USER_EMAIL) {
  return jwt.sign({ id, email }, 'test-secret');
}

// ───────────────────────────────────────────────
// POST /api/auth/register
// ───────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  test('1. 유효한 요청 → 201, { token, user } 반환 (user에 password 없음)', async () => {
    // findUserByEmail → 없음
    mockQuery.mockResolvedValueOnce({ rows: [] });
    // createUser → 새 유저
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: USER_ID, email: USER_EMAIL, name: USER_NAME, themeMode: 'LIGHT', createdAt: new Date() }],
    });
    // createDefaultCategory → 성공
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'cat-uuid-1', name: '기본', isDefault: true }] });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: USER_EMAIL, password: RAW_PASSWORD, name: USER_NAME });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).not.toHaveProperty('password');
    expect(res.body.user.email).toBe(USER_EMAIL);
  });

  test('2. 잘못된 이메일 → 400, INVALID_EMAIL', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: RAW_PASSWORD, name: USER_NAME });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_EMAIL');
  });

  test('3. 짧은 비밀번호(7자) → 400, INVALID_PASSWORD', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: USER_EMAIL, password: 'pass1a', name: USER_NAME }); // 6자

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PASSWORD');
  });

  test('4. 숫자 없는 비밀번호 → 400, INVALID_PASSWORD', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: USER_EMAIL, password: 'passwordonly', name: USER_NAME });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PASSWORD');
  });

  test('5. 빈 이름 → 400, INVALID_NAME', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: USER_EMAIL, password: RAW_PASSWORD, name: '' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_NAME');
  });

  test('6. 51자 이름 → 400, INVALID_NAME', async () => {
    const longName = 'a'.repeat(51);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: USER_EMAIL, password: RAW_PASSWORD, name: longName });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_NAME');
  });

  test('7. 중복 이메일 → 409, DUPLICATE_EMAIL', async () => {
    // findUserByEmail → 기존 유저 존재
    mockQuery.mockResolvedValueOnce({ rows: [makeUserRow()] });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: USER_EMAIL, password: RAW_PASSWORD, name: USER_NAME });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
  });
});

// ───────────────────────────────────────────────
// POST /api/auth/login
// ───────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  test('8. 올바른 자격증명 → 200, { token, user }', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [makeUserRow()] });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: USER_EMAIL, password: RAW_PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).not.toHaveProperty('password');
  });

  test('9. 존재하지 않는 이메일 → 401, INVALID_CREDENTIALS', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noone@test.com', password: RAW_PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  test('10. 비밀번호 불일치 → 401, INVALID_CREDENTIALS (이메일 존재 여부 노출 안 함)', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [makeUserRow()] });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: USER_EMAIL, password: 'wrongPass1' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    // 케이스 9와 동일한 message여야 함 (이메일 존재 여부 노출 금지)
    expect(res.body.error.message).toBe('이메일 또는 비밀번호가 올바르지 않습니다.');
  });
});

// ───────────────────────────────────────────────
// PATCH /api/auth/me
// ───────────────────────────────────────────────
describe('PATCH /api/auth/me', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  test('11. 인증 헤더 없음 → 401', async () => {
    const res = await request(app)
      .patch('/api/auth/me')
      .send({ name: '새이름' });

    expect(res.status).toBe(401);
  });

  test('12. 이름 변경 성공 → 200, { user }', async () => {
    const updatedUser = { id: USER_ID, email: USER_EMAIL, name: '새이름', themeMode: 'LIGHT', createdAt: new Date() };
    // updateUser → 업데이트된 유저
    mockQuery.mockResolvedValueOnce({ rows: [updatedUser] });

    const res = await request(app)
      .patch('/api/auth/me')
      .set('Authorization', `Bearer ${validToken()}`)
      .send({ name: '새이름' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.name).toBe('새이름');
  });

  test('13. 비밀번호 변경 성공 → 200, { user }', async () => {
    // findUserById (updateMe 내부에서 email 조회용)
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: USER_ID, email: USER_EMAIL, name: USER_NAME, themeMode: 'LIGHT', createdAt: new Date() }],
    });
    // findUserByEmail (password 비교용, password 컬럼 포함)
    mockQuery.mockResolvedValueOnce({ rows: [makeUserRow()] });
    // updateUser → 업데이트된 유저
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: USER_ID, email: USER_EMAIL, name: USER_NAME, themeMode: 'LIGHT', createdAt: new Date() }],
    });

    const res = await request(app)
      .patch('/api/auth/me')
      .set('Authorization', `Bearer ${validToken()}`)
      .send({ currentPassword: RAW_PASSWORD, newPassword: 'newPass1' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
  });

  test('14. 잘못된 새 비밀번호 → 400, INVALID_PASSWORD', async () => {
    const res = await request(app)
      .patch('/api/auth/me')
      .set('Authorization', `Bearer ${validToken()}`)
      .send({ currentPassword: RAW_PASSWORD, newPassword: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_PASSWORD');
  });

  test('15. 현재 비밀번호 불일치 → 401, INVALID_CREDENTIALS', async () => {
    // findUserById
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: USER_ID, email: USER_EMAIL, name: USER_NAME, themeMode: 'LIGHT', createdAt: new Date() }],
    });
    // findUserByEmail (password 비교용)
    mockQuery.mockResolvedValueOnce({ rows: [makeUserRow()] });

    const res = await request(app)
      .patch('/api/auth/me')
      .set('Authorization', `Bearer ${validToken()}`)
      .send({ currentPassword: 'wrongPass1', newPassword: 'newPass1' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });
});

// ───────────────────────────────────────────────
// DELETE /api/auth/me
// ───────────────────────────────────────────────
describe('DELETE /api/auth/me', () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  test('16. 인증 헤더 없음 → 401', async () => {
    const res = await request(app).delete('/api/auth/me');

    expect(res.status).toBe(401);
  });

  test('17. 탈퇴 성공 → 204, 응답 본문 없음', async () => {
    // deleteUser → 완료
    mockQuery.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .delete('/api/auth/me')
      .set('Authorization', `Bearer ${validToken()}`);

    expect(res.status).toBe(204);
    expect(res.text).toBe('');
  });
});
