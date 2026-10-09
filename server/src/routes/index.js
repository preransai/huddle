const express = require('express');
const { query } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { deleteComment } = require('../controllers/commentController');
const notifications = require('../controllers/notificationController');
const tags = require('../controllers/tagController');
const { idParam, cursorQuery } = require('./rules');

const router = express.Router();

router.use('/auth', require('./auth'));

// Everything below needs a logged-in user.
router.use(requireAuth);

router.use('/posts', require('./posts'));
router.use('/users', require('./users'));

router.delete('/comments/:id', idParam(), validate, deleteComment);

router.get('/notifications', cursorQuery, validate, notifications.listNotifications);
router.get('/notifications/unread-count', notifications.unreadCount);
router.post('/notifications/read-all', notifications.markAllRead);

router.get('/tags/trending', tags.trendingTags);
router.get(
  '/tags/search',
  query('q').optional().isString().isLength({ max: 50 }),
  validate,
  tags.searchTags
);

module.exports = router;
