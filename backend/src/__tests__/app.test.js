import { describe, it, expect, beforeAll } from '@jest/globals';
import request from 'supertest';

// app.js가 dotenv/config를 import하기 전에 환경변수를 미리 설정한다.
// CORS_ORIGIN을 설정하지 않으면 cors origin이 undefined가 되어 CORS 헤더가 응답에 포함되지 않는다.
process.env.CORS_ORIGIN = 'http://localhost:5173';

// app은 동적으로 import해야 위의 환경변수 설정이 반영된다.
let app;

beforeAll(async () => {
  const module = await import('../app.js');
  app = module.default;
});

describe('GET /api/health', () => {
  it('200과 { status: "ok" }를 반환한다', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('존재하지 않는 경로', () => {
  it('GET /api/unknown → 404를 반환한다', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not Found' });
  });
});

describe('CORS 헤더', () => {
  it('Origin: http://localhost:5173 요청 시 Access-Control-Allow-Origin 헤더가 응답에 포함된다', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });
});

describe('JSON 파싱', () => {
  it('POST /api/health에 application/json 본문 전송 시 파싱 오류 없이 404를 반환한다', async () => {
    const res = await request(app)
      .post('/api/health')
      .set('Content-Type', 'application/json')
      .send({ dummy: 'data' });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not Found' });
  });
});
