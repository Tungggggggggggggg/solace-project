const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth.middleware');
const notificationController = require('../controllers/notification.controller');

router.get('/', isAuthenticated, notificationController.getNotifications);
// Đánh dấu 1 thông báo đã đọc
router.post('/:id/read', isAuthenticated, notificationController.markAsRead);
// Đánh dấu tất cả đã đọc
router.post('/read-all', isAuthenticated, notificationController.markAllAsRead);

module.exports = router; 