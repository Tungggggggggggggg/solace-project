const express = require('express');
const pool = require('../db');
const router = express.Router();

// API: GET /api/admin/notifications
router.get('/notifications', async (req, res) => {
  try {
    const reportQuery = `
      SELECT 
        r.id,
        r.post_id,
        r.reason,
        r.status,
        r.created_at,
        u1.first_name AS reporter_first_name,
        u1.last_name AS reporter_last_name
      FROM reports r
      LEFT JOIN users u1 ON r.reporter_id = u1.id
      WHERE r.status = 'pending'
      ORDER BY r.created_at DESC
      LIMIT 10
    `;
    const { rows: reports } = await pool.query(reportQuery);

    const postQuery = `
      SELECT 
        p.id,
        p.content,
        p.created_at
      FROM posts p
      WHERE p.is_approved = false
      ORDER BY p.created_at DESC
      LIMIT 10
    `;
    const { rows: posts } = await pool.query(postQuery);

    const notiList = [
      ...reports.map((r) => ({
        id: `report-${r.id}`,
        title: 'Báo cáo mới',
        content: `Lý do: ${r.reason} (từ ${((r.reporter_first_name || '') + ' ' + (r.reporter_last_name || '')).trim()})`,
        created_at: r.created_at,
      })),
      ...posts.map((p) => ({
        id: `post-${p.id}`,
        title: 'Bài đăng chờ duyệt',
        content: p.content,
        created_at: p.created_at,
      })),
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(notiList);
  } catch (err) {
    console.error('Lỗi lấy thông báo admin:', err);
    res.status(500).json({ error: 'Lỗi server', detail: err.message });
  }
});

module.exports = router;
