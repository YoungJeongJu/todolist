import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

// JWT_SECRET 환경변수를 app import 전에 설정한다.
process.env.JWT_SECRET = 'test-secret';

// --- auth.middleware.js 테스트 ---

describe('authenticate 미들웨어', () => {
  let authenticate;

  beforeEach(async () => {
    // 모듈 캐시를 무력화하여 환경변수가 반영된 상태로 import한다.
    const mod = await import('../middlewares/auth.middleware.js');
    authenticate = mod.authenticate;
  });

  function makeReqRes(authHeader) {
    const req = { headers: {} };
    if (authHeader !== undefined) {
      req.headers.authorization = authHeader;
    }
    const res = {
      _status: null,
      _body: null,
      status(code) {
        this._status = code;
        return this;
      },
      json(body) {
        this._body = body;
        return this;
      },
    };
    const next = jest.fn();
    return { req, res, next };
  }

  it('1. Authorization 헤더 없음 → 401, UNAUTHORIZED', () => {
    const { req, res, next } = makeReqRes(undefined);
    authenticate(req, res, next);
    expect(res._status).toBe(401);
    expect(res._body.error.code).toBe('UNAUTHORIZED');
    expect(next).not.toHaveBeenCalled();
  });

  it('2. Bearer 형식 아님 ("Token xxx") → 401, UNAUTHORIZED', () => {
    const { req, res, next } = makeReqRes('Token some-value');
    authenticate(req, res, next);
    expect(res._status).toBe(401);
    expect(res._body.error.code).toBe('UNAUTHORIZED');
    expect(next).not.toHaveBeenCalled();
  });

  it('3. 유효하지 않은 토큰 문자열 → 401, INVALID_TOKEN', () => {
    const { req, res, next } = makeReqRes('Bearer this.is.invalid');
    authenticate(req, res, next);
    expect(res._status).toBe(401);
    expect(res._body.error.code).toBe('INVALID_TOKEN');
    expect(next).not.toHaveBeenCalled();
  });

  it('4. 만료된 토큰 → 401, INVALID_TOKEN', () => {
    const expiredToken = jwt.sign(
      { id: 1, email: 'user@example.com' },
      'test-secret',
      { expiresIn: '0s' }
    );
    const { req, res, next } = makeReqRes(`Bearer ${expiredToken}`);
    authenticate(req, res, next);
    expect(res._status).toBe(401);
    expect(res._body.error.code).toBe('INVALID_TOKEN');
    expect(next).not.toHaveBeenCalled();
  });

  it('5. 유효한 토큰 → req.user에 { id, email } 주입, next() 호출', () => {
    const token = jwt.sign(
      { id: 42, email: 'valid@example.com' },
      'test-secret',
      { expiresIn: '1h' }
    );
    const { req, res, next } = makeReqRes(`Bearer ${token}`);
    authenticate(req, res, next);
    expect(req.user).toEqual({ id: 42, email: 'valid@example.com' });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res._status).toBeNull();
  });
});

// --- error.middleware.js 테스트 ---

describe('errorHandler 미들웨어', () => {
  let errorHandler;

  beforeEach(async () => {
    const mod = await import('../middlewares/error.middleware.js');
    errorHandler = mod.errorHandler;
  });

  function makeErrReqRes() {
    const req = {};
    const res = {
      _status: null,
      _body: null,
      status(code) {
        this._status = code;
        return this;
      },
      json(body) {
        this._body = body;
        return this;
      },
    };
    const next = jest.fn();
    return { req, res, next };
  }

  it('6. err.status, err.code, err.message 있는 에러 → 해당 status와 { error: { code, message } } 응답', () => {
    const { req, res, next } = makeErrReqRes();
    const err = { status: 403, code: 'FORBIDDEN', message: '접근이 거부되었습니다.' };
    errorHandler(err, req, res, next);
    expect(res._status).toBe(403);
    expect(res._body).toEqual({ error: { code: 'FORBIDDEN', message: '접근이 거부되었습니다.' } });
  });

  it('7. status 없는 에러 → 500 응답', () => {
    const { req, res, next } = makeErrReqRes();
    const err = { code: 'SOME_ERROR', message: '알 수 없는 오류' };
    errorHandler(err, req, res, next);
    expect(res._status).toBe(500);
  });

  it('8. code 없는 에러 → code: "INTERNAL_ERROR"', () => {
    const { req, res, next } = makeErrReqRes();
    const err = { status: 500, message: '서버 오류' };
    errorHandler(err, req, res, next);
    expect(res._body.error.code).toBe('INTERNAL_ERROR');
  });

  it('9. 스택 트레이스가 응답 body에 포함되지 않음', () => {
    const { req, res, next } = makeErrReqRes();
    const err = new Error('내부 오류 발생');
    err.status = 500;
    err.code = 'INTERNAL_ERROR';
    errorHandler(err, req, res, next);
    const bodyStr = JSON.stringify(res._body);
    expect(bodyStr).not.toContain('at ');
    expect(bodyStr).not.toContain('.js:');
  });
});
