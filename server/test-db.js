const pool = require('./db');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Kết nối thất bại:', err.message);
  } else {
    console.log('✅ Kết nối thành công:', res.rows[0]);
  }
});
