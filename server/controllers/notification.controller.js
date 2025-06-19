const { pool } = require('../db');
const { getIO, userSockets } = require('../socket');

// Lấy danh sách thông báo với phân trang, lọc, search
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const tab = req.query.tab || 'all';

    let baseQuery = `
      SELECT n.*, 
             u.id as sender_id,
             u.first_name as sender_first_name, 
             u.last_name as sender_last_name,
             u.avatar_url as sender_avatar_url
      FROM notifications n
      LEFT JOIN users u ON n.sender_id = u.id
      WHERE n.user_id = $1
      AND n.type != 'admin'
    `;
    const params = [userId];
    if (tab === 'unread') {
      baseQuery += ' AND n.is_read = false';
    } else if (tab === 'system') {
      baseQuery += " AND n.type = 'system'";
    }

    baseQuery += ' ORDER BY n.created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const { rows } = await pool.query(baseQuery, params);
    const countQuery = `
      SELECT COUNT(*) 
      FROM notifications n
      WHERE user_id = $1
      ${tab === 'unread' ? 'AND n.is_read = false' : tab === 'system' ? "AND type = 'system'" : ''}
    `;
    const countParams = [userId];
    const { rows: [{ count }] } = await pool.query(countQuery, countParams);

    const notifications = rows.map(row => ({
      ...row,
      sender: row.sender_id ? {
        id: row.sender_id,
        first_name: row.sender_first_name,
        last_name: row.sender_last_name,
        avatar_url: row.sender_avatar_url
      } : undefined
    }));

    res.json({
      notifications,
      hasMore: offset + rows.length < parseInt(count)
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Lỗi server', detail: err.message });
  }
};

// Đánh dấu 1 thông báo đã đọc
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await pool.query('UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2', [id, userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error mark notification as read:', err);
    res.status(500).json({ error: 'Lỗi server', detail: err.message });
  }
};

// Đánh dấu tất cả đã đọc
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.query('UPDATE notifications SET is_read = true WHERE user_id = $1', [userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error mark all notifications as read:', err);
    res.status(500).json({ error: 'Lỗi server', detail: err.message });
  }
}; 