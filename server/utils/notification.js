const { pool } = require('../db');
const { getIO } = require('../socket');

exports.createNotification = async (
  userId,
  title,
  content,
  type,
  senderId,
  relatedType,
  relatedId
) => {
  try {
    const result = await pool.query(
      `
      INSERT INTO notifications (user_id, title, content, type, sender_id, related_type, related_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
      `,
      [userId, title, content, type, senderId || null, relatedType || null, relatedId || null]
    );

    const notification = result.rows[0];

    const sender = senderId
      ? await pool.query(
          'SELECT id, first_name, last_name, avatar_url FROM users WHERE id = $1',
          [senderId]
        ).then(res => res.rows[0])
      : undefined;

    // Gửi thông báo qua Socket.IO
    const io = getIO(); 
    if (userId) {
      io.to(`user:${userId}`).emit('newNotification', {
        ...notification,
        sender
      });
    } else {
        io.to(`admin`).emit('newNotification', {
        ...notification
      });
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

exports.createLikeNotification = async (postId, userId, postOwnerId) => {
  if (userId === postOwnerId) return;

  await exports.createNotification( // Sử dụng exports.createNotification để gọi hàm nội bộ
    postOwnerId,
    'Bài viết được yêu thích',
    'đã thích bài viết của bạn',
    'like',
    userId,
    'post',
    postId
  );
};

exports.createCommentNotification = async (postId, userId, postOwnerId, commentContent) => {
  if (userId === postOwnerId) return;

  await exports.createNotification(
    postOwnerId,
    'Bình luận mới',
    `đã bình luận về bài viết của bạn: "${commentContent.substring(0, 50)}..."`,
    'comment',
    userId,
    'post',
    postId
  );
};

exports.createFollowNotification = async (followerId, userId) => {
  await exports.createNotification(
    userId,
    'Người theo dõi mới',
    'đã bắt đầu theo dõi bạn',
    'follow',
    followerId
  );
};

exports.createPostApprovedNotification = async (postId, postAuthorId) => {
  const title = 'Bài viết của bạn đã được duyệt!';
  const content = 'Bài viết của bạn đã được quản trị viên duyệt và hiển thị công khai.';

  await exports.createNotification(
    postAuthorId,
    title,
    content,
    'system',
    null,
    'post',
    postId
  );
};

exports.createPostNotification = async (postId, postAuthorId, postContent) => {
  const adminId = null;
  const adminTitle = 'Bài viết mới cần duyệt';
  const adminContent = `Bài viết của user ${postAuthorId} "${postContent.substring(0, 100)}..." cần được duyệt.`;

  await exports.createNotification(
    adminId,   
    adminTitle, 
    adminContent, 
    'post_approval',
    postAuthorId,
    'post',
    postId
  );

  await exports.createNotification(
    postAuthorId,
    'Bài viết của bạn đang chờ duyệt',
    'Bài viết của bạn đã được gửi và đang chờ quản trị viên xem xét.',
    'system',
    null,
    'post',
    postId
  );
};

exports.createPostForFollowersNotification = async (postId, postAuthorId) => {
  try {
    const authorRes = await pool.query('SELECT first_name, last_name FROM users WHERE id = $1', [postAuthorId]);
    const author = authorRes.rows[0];
    if (!author) {
      console.warn(`Author with ID ${postAuthorId} not found. Cannot send new post notifications to followers.`);
      return;
    }

    const notificationTitle = 'Có bài viết mới từ người bạn theo dõi';
    const notificationContent = `${author.first_name} ${author.last_name} đã đăng một bài viết mới.`;

    const followersRes = await pool.query(
      'SELECT follower_id FROM user_relationships WHERE user_id = $1',
      [postAuthorId]
    );
    const followerIds = followersRes.rows.map(row => row.follower_id);

    const notificationPromises = followerIds.map(followerId => {
      if (followerId === postAuthorId) {
        return Promise.resolve();
      }
      return exports.createNotification(
        followerId,
        notificationTitle,
        notificationContent,
        'new_post',
        postAuthorId,
        'post',
        postId
      );
    });

    await Promise.allSettled(notificationPromises);
    console.log(`Sent new post notifications to ${followerIds.length} followers for post ${postId} by user ${postAuthorId}.`);

  } catch (error) {
    console.error('Error creating new post notification for followers:', error);
    throw error;
  }
};