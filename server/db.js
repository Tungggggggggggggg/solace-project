const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

pool.connect((err, client, release) => {
  if (err) {
    console.error('Kết nối PostgreSQL thất bại:', err.stack);
    return;
  }
  console.log('Kết nối PostgreSQL thành công');
  release();
});

module.exports = pool;