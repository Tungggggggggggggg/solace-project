const express = require('express');
const pool = require('../db');
const router = express.Router();

// Lấy danh sách từ cấm
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT id, word, added_at, status FROM forbidden_words';
    let params = [];
    if (search) {
      query += ' WHERE LOWER(word) LIKE $1';
      params.push(`%${search.toLowerCase()}%`);
    }
    query += ' ORDER BY added_at DESC;';
    const { rows } = await pool.query(query, params);
    const forbiddenWords = rows.map((fw, index) => ({
      stt: index + 1,
      id: fw.id,
      word: fw.word,
      added_at: fw.added_at ? new Date(fw.added_at).toLocaleDateString('en-CA') : '',
      status: fw.status || 'Chưa duyệt',
    }));
    res.status(200).json({ success: true, forbiddenWords });
  } catch (err) {
    console.error('Get forbidden words error:', err);
    res.status(500).json({ error: 'Lỗi server', detail: err.message });
  }
});

module.exports = router;
