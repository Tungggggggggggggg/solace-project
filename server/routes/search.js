const express = require('express');
const pool = require('../db');
const router = express.Router();

// API gợi ý tìm kiếm
router.get('/search-suggestions', async (req, res) => {
  const query = (req.query.query || '').toLowerCase();
  if (!query) return res.json([]);

  try {
    // Lấy user
    const users = await pool.query(
      "SELECT id, (first_name || ' ' || last_name) AS name, avatar AS avatar, 'user' AS type FROM users WHERE first_name IS NOT NULL AND last_name IS NOT NULL AND LOWER(first_name || ' ' || last_name) LIKE $1 LIMIT 5",
      [`%${query}%`]
    );
    // Lấy post
    const posts = await pool.query(
      "SELECT id, content AS name, '' AS avatar, 'post' AS type FROM posts WHERE content IS NOT NULL AND LOWER(content) LIKE $1 LIMIT 5",
      [`%${query}%`]
    );
    // Gộp lại
    const suggestions = [...users.rows, ...posts.rows];
    res.json(suggestions);
  } catch (err) {
    console.error('Search API error:', err); // Log chi tiết lỗi ra terminal
    res.status(500).json({ error: 'Lỗi lấy gợi ý tìm kiếm', detail: err.message });
  }
});

module.exports = router; 