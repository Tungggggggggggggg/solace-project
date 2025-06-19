const express = require('express');
const router = express.Router(); 
const pool = require('../db');
const { getUserPosts, getUserPostStats } = require('../controllers/post.controller');
const { getIO } = require('../socket');

// GET /api/posts/user/:id - Get user posts with access control
router.get('/user/:id', getUserPosts);

// GET /api/posts/user/:id/stats - Get user post statistics
router.get('/user/:id/post-stats', getUserPostStats);

// GET /api/posts?type=positive&status=approved&search=keyword
router.get('/', async (req, res) => {
  const { type, status, search } = req.query;

  try {
    let query = `
      SELECT p.*, u.first_name, u.last_name, u.avatar_url
      FROM posts p
      JOIN users u ON p.user_id = u.id
    `;
    const conditions = [];
    const values = [];

    if (type) {
      values.push(type);
      conditions.push(`p.type_post = $${values.length}`);
    }

    if (status === 'approved') {
      conditions.push(`p.is_approved = true`);
    } else if (status === 'pending') {
      conditions.push(`p.is_approved = false`);
    }

    if (search) {
      values.push(`%${search.toLowerCase()}%`);
      conditions.push(`LOWER(p.content) LIKE $${values.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/posts/:id/approve
router.put('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE posts SET is_approved = true WHERE id = $1', [id]);
    // Emit event cho tất cả client khi bài được duyệt
    try {
      const io = getIO();
      io.emit('postApproved', { postId: id });
    } catch (e) { console.error('Socket emit postApproved error:', e); }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/posts/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM posts WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy chi tiết một bài đăng (và bài gốc nếu là bài chia sẻ)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Lấy thông tin bài đăng
    const postRes = await pool.query(
      `SELECT p.*, u.first_name, u.last_name, u.avatar_url
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`, [id]
    );
    if (postRes.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy bài đăng' });
    }
    const post = postRes.rows[0];

    // Nếu là bài share, lấy thêm bài gốc
    let shared_post = null;
    if (post.shared_post_id) {
      const sharedRes = await pool.query(
        `SELECT p.*, u.first_name, u.last_name, u.avatar_url
         FROM posts p
         JOIN users u ON p.user_id = u.id
         WHERE p.id = $1`, [post.shared_post_id]
      );
      shared_post = sharedRes.rows[0] || null;
    }

    res.json({
      success: true,
      post,
      shared_post,
    });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi server', detail: err.message });
  }
});

module.exports = router;
