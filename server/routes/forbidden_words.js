const express = require('express');
const pool = require('../db');
const router = express.Router();

// Lấy danh sách từ cấm
router.get('/', async (req, res) => {
  try {
    const query = 'SELECT id, word, added_at, added_by, status FROM forbidden_words ORDER BY added_at DESC;';
    const { rows } = await pool.query(query);
    const forbiddenWords = rows.map((fw, index) => ({
      stt: index + 1,
      id: fw.id,
      word: fw.word,
      added_at: fw.added_at ? new Date(fw.added_at).toLocaleDateString('en-CA') : '',
      added_by: fw.added_by || 'Không xác định',
      status: fw.status || 'Chưa duyệt',
    }));
    res.status(200).json({ success: true, forbiddenWords });
  } catch (err) {
    console.error('Get forbidden words error:', err);
    res.status(500).json({ error: 'Lỗi server', detail: err.message });
  }
});

module.exports = router;
