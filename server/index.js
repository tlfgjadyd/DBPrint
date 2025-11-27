require('dotenv').config(); // .env 파일의 환경 변수를 로드합니다.

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 5000;

// PostgreSQL 연결 설정
// .env 파일에서 설정된 환경 변수를 사용합니다.
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: true, // 외부 데이터베이스 연결을 위한 SSL 활성화
});

app.use(cors());
app.use(express.json());

// 루트 경로 핸들러 (기존)
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// 모든 테이블 이름을 가져오는 API 엔드포인트
app.get('/api/tables', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';"
    );
    res.json(result.rows.map((row) => row.tablename));
  } catch (err) {
    console.error('Error fetching table names:', err);
    res.status(500).json({ error: 'Failed to fetch table names' });
  }
});

// 특정 테이블의 데이터를 가져오는 API 엔드포인트
app.get('/api/table/:tableName', async (req, res) => {
  const { tableName } = req.params;
  try {
    // SQL 인젝션 방지를 위해 테이블 이름을 직접 쿼리에 넣지 않고,
    // 허용된 테이블 이름인지 먼저 확인하는 로직이 필요할 수 있습니다.
    // 여기서는 간단히 구현하지만, 실제 프로덕션에서는 더 견고한 검증이 필요합니다.
    const result = await pool.query(`SELECT * FROM "${tableName}"`); // 테이블 이름에 큰따옴표를 사용하여 예약어 문제 방지
    res.json(result.rows);
  } catch (err) {
    console.error(`Error fetching data for table ${tableName}:`, err);
    res.status(500).json({ error: `Failed to fetch data for table ${tableName}` });
  }
});

// 서버 시작 (기존)
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
