const express = require('express');
const pool = require('../db');
const router = express.Router();

// Tạo report mới cho bài viết
router.post('/', async (req, res) => {
  try {
    const { post_id, reporter_id, reason, description } = req.body;
    if (!post_id || !reporter_id || !reason) {
      return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
    }

    // Lấy chủ bài viết
    const postResult = await pool.query('SELECT user_id FROM posts WHERE id = $1', [post_id]);
    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Bài viết không tồn tại' });
    }
    const reported_user_id = postResult.rows[0].user_id;

    // Thêm report vào DB
    const insertQuery = `
      INSERT INTO reports (post_id, reporter_id, reported_user_id, reason, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [post_id, reporter_id, reported_user_id, reason, description || null];
    const { rows } = await pool.query(insertQuery, values);

    res.status(201).json({ success: true, report: rows[0] });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ error: 'Lỗi server', detail: err.message });
  }
});

module.exports = router; 