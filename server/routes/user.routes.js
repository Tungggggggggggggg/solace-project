const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabaseClient');

// GET /api/users?status=Hoạt động&search=Nguyễn
router.get('/', async (req, res) => {
  const { status, search } = req.query;

  // Luôn fetch đầy đủ user + user_info + posts
  const { data, error } = await supabase
    .from('users')
    .select(`
      id,
      full_name,
      email,
      role,
      avatar_url,
      user_info (
        is_active,
        created_at
      ),
      posts ( id )
    `);

  if (error) return res.status(500).json({ error: error.message });

  let filtered = data;

  // Lọc theo trạng thái hoạt động
  if (status === 'Hoạt động') {
    filtered = filtered.filter(user => user.user_info?.is_active === true);
  } else if (status === 'Đã khóa') {
    filtered = filtered.filter(user => user.user_info?.is_active === false);
  }

  // Tìm kiếm theo tên
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(user =>
      user.full_name.toLowerCase().includes(searchLower)
    );
  }

  // 👉 Tính tổng số bài đăng
  const usersWithPostCount = filtered.map(user => ({
    ...user,
    posts_count: user.posts?.length || 0,
  }));

  res.json(usersWithPostCount);
});

module.exports = router;

// PUT /api/users/:id/status
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  const { error } = await supabase
    .from('user_info')
    .update({ is_active })
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
});

// PUT /api/users/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { full_name, email } = req.body;

  const { error } = await supabase
    .from('users')
    .update({ full_name, email })
    .eq('id', id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
});


