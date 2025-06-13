const express = require('express');
const router = express.Router();
const pool = require('../db');
const { isAuthenticated } = require('../middlewares/auth.middleware');

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

// Lấy thông tin follow của user
router.get('/:id/follow-stats', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM user_relationships WHERE user_id = $1) as followers_count,
        (SELECT COUNT(*) FROM user_relationships WHERE follower_id = $1) as following_count,
        EXISTS(
          SELECT 1 FROM user_relationships 
          WHERE user_id = $1 AND follower_id = $2
        ) as is_following
      FROM users WHERE id = $1
    `, [id, req.user?.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting follow stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Lấy danh sách người theo dõi
router.get('/:id/followers', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.avatar_url, u.email,
             r.created_at as followed_at,
             EXISTS(
               SELECT 1 FROM user_relationships 
               WHERE user_id = u.id AND follower_id = $2
             ) as is_following
      FROM user_relationships r
      JOIN users u ON r.follower_id = u.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
    `, [id, req.user?.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting followers:', error);
    res.status(500).json({ error: error.message });
  }
});

// Lấy danh sách đang theo dõi
router.get('/:id/following', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.avatar_url, u.email,
             r.created_at as followed_at,
             EXISTS(
               SELECT 1 FROM user_relationships 
               WHERE user_id = u.id AND follower_id = $2
             ) as is_following
      FROM user_relationships r
      JOIN users u ON r.user_id = u.id
      WHERE r.follower_id = $1
      ORDER BY r.created_at DESC
    `, [id, req.user?.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting following:', error);
    res.status(500).json({ error: error.message });
  }
});

// Follow user
router.post('/:id/follow', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const followerId = req.user?.id;

  if (!followerId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (id === followerId) {
    return res.status(400).json({ error: 'Cannot follow yourself' });
  }

  try {
    // Begin transaction
    await pool.query('BEGIN');

    // Check if already following with FOR UPDATE to prevent race conditions
    const existingFollow = await pool.query(
      'SELECT * FROM user_relationships WHERE user_id = $1 AND follower_id = $2 FOR UPDATE',
      [id, followerId]
    );

    if (existingFollow.rows.length > 0) {
      await pool.query('ROLLBACK');
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Add new follow relationship
    await pool.query(
      'INSERT INTO user_relationships (user_id, follower_id) VALUES ($1, $2)',
      [id, followerId]
    );

    // Send notification to followed user
    await pool.query(
      `INSERT INTO notifications (user_id, title, content, type)
       VALUES ($1, 'Người theo dõi mới', $2, 'follow')`,
      [id, `${req.user.first_name} ${req.user.last_name} đã bắt đầu theo dõi bạn`]
    );

    // Get updated stats
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM user_relationships WHERE user_id = $1) as followers_count,
        (SELECT COUNT(*) FROM user_relationships WHERE follower_id = $1) as following_count,
        true as is_following
      FROM users WHERE id = $1
    `, [id]);

    await pool.query('COMMIT');

    res.json({
      success: true,
      ...stats.rows[0]
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error following user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Unfollow user
router.delete('/:id/follow', isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const followerId = req.user?.id;

  if (!followerId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Begin transaction
    await pool.query('BEGIN');

    // Check if relationship exists
    const followRelationship = await pool.query(
      'SELECT * FROM user_relationships WHERE user_id = $1 AND follower_id = $2 FOR UPDATE',
      [id, followerId]
    );

    if (followRelationship.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Follow relationship not found' });
    }

    // Delete the relationship
    await pool.query(
      'DELETE FROM user_relationships WHERE user_id = $1 AND follower_id = $2',
      [id, followerId]
    );

    // Get updated stats
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM user_relationships WHERE user_id = $1) as followers_count,
        (SELECT COUNT(*) FROM user_relationships WHERE follower_id = $1) as following_count,
        false as is_following
      FROM users WHERE id = $1
    `, [id]);

    await pool.query('COMMIT');

    res.json({
      success: true,
      ...stats.rows[0]
    });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT u.id, u.first_name, u.last_name, u.email, u.avatar_url,
             json_build_object(
               'is_active', ui.is_active,
               'created_at', ui.created_at
             ) AS user_info
      FROM users u
      JOIN user_info ui ON u.id = ui.id
      WHERE u.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: error.message });
  }
});

// Lấy tổng số bài viết của user
router.get('/:id/post-stats', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT COUNT(*) AS total_posts FROM posts WHERE user_id = $1',
      [id]
    );
    res.json({ total_posts: parseInt(result.rows[0].total_posts, 10) });
  } catch (error) {
    console.error('Error getting post stats:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
