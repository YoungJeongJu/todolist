import 'dotenv/config';
import app from './src/app.js';
import pool from './src/db/pool.js';

const PORT = process.env.PORT || 4000;

pool.connect()
  .then((client) => {
    client.release();
    console.log('DB 연결 성공');
    app.listen(PORT, () => {
      console.log(`서버 실행 중: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('DB 연결 실패:', err.message);
    process.exit(1);
  });
