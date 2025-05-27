const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const pool = require('../db');
const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log('Cloudinary config:', cloudinary.config());

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload-media', upload.array('media', 9), async (req, res) => {
  try {
    console.log('Uploading media:', req.files?.length, 'files');
    const files = req.files || [];
    let mediaUrls = [];
    for (const file of files) {
      const url = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto', folder: 'solace-posts' },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      });
      mediaUrls.push(url);
    }
    res.status(200).json({ images: mediaUrls });
  } catch (err) {
    console.error('Upload media error:', err);
    res.status(500).json({ error: 'Tải ảnh thất bại', detail: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'Missing or invalid request body' });
    }
    console.log('Creating post:', req.body);
    const { content, privacy, user_id, images = [], feeling, location } = req.body;
    if (!content || !privacy || !user_id) {
      return res.status(400).json({ error: 'Thiếu trường bắt buộc: content, privacy, user_id' });
    }
    // Đảm bảo images là mảng string
    const imagesArray = Array.isArray(images) ? images : [];
    // Lưu cảm xúc dạng JSON string (để lưu cả icon và label)
    const feelingStr = feeling && typeof feeling === 'object' ? JSON.stringify(feeling) : (feeling || null);

    const insertQuery = `
      INSERT INTO posts (user_id, content, images, access_modifier, type_post, created_at, feeling, location)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [
      user_id,
      content,
      imagesArray,
      privacy,
      'post',
      new Date().toISOString(),
      feelingStr,
      location || null
    ];
    const { rows } = await pool.query(insertQuery, values);

    // Parse lại cảm xúc trước khi trả về cho FE
    if (rows[0].feeling) {
      try {
        rows[0].feeling = JSON.parse(rows[0].feeling);
      } catch {}
    }

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Post creation error:', err);
    res.status(500).json({ error: 'Đăng bài thất bại', detail: err.message });
  }
});

// Lấy danh sách tất cả bài viết (GET /api/posts)
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM posts ORDER BY created_at DESC');
    // Parse lại cảm xúc cho từng post
    rows.forEach(post => {
      if (post.feeling) {
        try {
          post.feeling = JSON.parse(post.feeling);
        } catch {}
      }
    });
    res.json(rows);
  } catch (err) {
    console.error('Get posts error:', err);
    res.status(500).json({ error: 'Không lấy được danh sách bài viết', detail: err.message });
  }
});

module.exports = router;