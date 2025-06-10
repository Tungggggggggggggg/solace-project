const express = require('express');
const pool = require('../db');
const router = express.Router();

// Lấy danh sách báo cáo
router.get('/', async (req, res) => {
  try {
    const { search, status } = req.query;
    let query = `
      SELECT 
        r.id,
        r.post_id,
        r.created_at,
        r.reason,
        r.description,
        r.status,
        u1.first_name AS reporter_first_name,
        u1.last_name AS reporter_last_name,
        u2.first_name AS reported_first_name,
        u2.last_name AS reported_last_name
      FROM reports r
      LEFT JOIN users u1 ON r.reporter_id = u1.id
      LEFT JOIN users u2 ON r.reported_user_id = u2.id
    `;
    let where = [];
    let params = [];
    if (status && status !== 'all') {
      where.push('r.status = $' + (params.length + 1));
      params.push(status);
    }
    if (search) {
      where.push(`(
        LOWER(u1.first_name) LIKE $${params.length + 1} OR
        LOWER(u1.last_name) LIKE $${params.length + 1} OR
        LOWER(u2.first_name) LIKE $${params.length + 1} OR
        LOWER(u2.last_name) LIKE $${params.length + 1}
      )`);
      params.push(`%${search.toLowerCase()}%`);
    }
    if (where.length > 0) {
      query += ' WHERE ' + where.join(' AND ');
    }
    query += ' ORDER BY r.created_at DESC;';
    const { rows } = await pool.query(query, params);

    const reports = rows.map((report, index) => ({
      stt: index + 1,
      report_id: report.id,
      date_reported: new Date(report.created_at).toLocaleDateString('en-US'),
      reported_by: ((report.reporter_first_name || '') + ' ' + (report.reporter_last_name || '')).trim() || 'Không xác định',
      reported_account: ((report.reported_first_name || '') + ' ' + (report.reported_last_name || '')).trim() || 'Không xác định',
      content: report.reason + (report.description ? `: ${report.description}` : ''),
      status: report.status === 'pending' ? 'Chưa xử lý' : 'Đã xử lý',
    }));

    res.status(200).json({ success: true, reports });
  } catch (err) {
    console.error('Get reports error:', err);
    res.status(500).json({ error: 'Lỗi server', detail: err.message });
  }
});

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

    // Lấy email của reporter và reported_user
    const userQuery = 'SELECT id, email FROM users WHERE id = ANY($1)';
    const userResult = await pool.query(userQuery, [[reporter_id, reported_user_id]]);
    const users = userResult.rows;
    const reporterEmail = users.find((u) => u.id === reporter_id)?.email || 'Không xác định';
    const reportedUserEmail = users.find((u) => u.id === reported_user_id)?.email || 'Không xác định';

    // Thêm report vào DB
    const insertQuery = `
      INSERT INTO reports (post_id, reporter_id, reported_user_id, reason, description)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [post_id, reporter_id, reported_user_id, reason, description || null];
    const { rows } = await pool.query(insertQuery, values);

    const report = {
      ...rows[0],
      reporter_email: reporterEmail,
      reported_user_email: reportedUserEmail,
    };

    res.status(201).json({ success: true, report });
  } catch (err) {
    console.error('Report error:', err);
    res.status(500).json({ error: 'Lỗi server', detail: err.message });
  }
});

// Đánh dấu báo cáo đã xử lý
router.put('/:id/process', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE reports SET status = $1 WHERE id = $2', ['processed', id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Xóa báo cáo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM reports WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;