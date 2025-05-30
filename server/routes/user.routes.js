const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/users?status=Hoạt động&search=Nguyễn
router.get('/', async (req, res) => {
  const { status, search } = req.query;

  try {
    let baseQuery = `
      SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.avatar_url,
             json_build_object(
               'is_active', ui.is_active,
               'created_at', ui.created_at
             ) AS user_info,
             COUNT(p.id) AS posts_count
      FROM users u
      JOIN user_info ui ON u.id = ui.id
      LEFT JOIN posts p ON p.user_id = u.id
    `;

    const conditions = [];
    const values = [];

    if (status === 'Hoạt động') {
      conditions.push(`ui.is_active = true`);
    } else if (status === 'Đã khóa') {
      conditions.push(`ui.is_active = false`);
    }

    if (search) {
      values.push(`%${search.toLowerCase()}%`);
      conditions.push(`LOWER(u.first_name || ' ' || u.last_name) LIKE $${values.length}`);
    }

    if (conditions.length > 0) {
      baseQuery += ` WHERE ` + conditions.join(' AND ');
    }

    baseQuery += `
      GROUP BY u.id, ui.is_active, ui.created_at
      ORDER BY u.first_name, u.last_name
    `;

    const result = await pool.query(baseQuery, values);
    res.json(result.rows);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id/status
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  try {
    await pool.query(
      `UPDATE user_info SET is_active = $1 WHERE id = $2`,
      [is_active, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Lỗi khi cập nhật trạng thái:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email } = req.body;

  try {
    await pool.query(
      `UPDATE users SET first_name = $1, last_name = $2, email = $3 WHERE id = $4`,
      [first_name, last_name, email, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Lỗi khi cập nhật thông tin người dùng:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
