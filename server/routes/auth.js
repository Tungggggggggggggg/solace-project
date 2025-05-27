const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/google', async (req, res) => {
  const { id, email, first_name, last_name, avatar } = req.body;
  if (!id || !email) return res.status(400).json({ error: 'Thiếu thông tin user' });

  try {
    // Kiểm tra user đã tồn tại chưa
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (rows.length === 0) {
      // Nếu chưa có thì thêm mới
      await pool.query(
        `INSERT INTO users (id, email, first_name, last_name, avatar) VALUES ($1, $2, $3, $4, $5)`,
        [id, email, first_name, last_name, avatar]
      );
    }
    return res.json({ success: true });
  } catch (err) {
    console.error('Google login error:', err);
    return res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
