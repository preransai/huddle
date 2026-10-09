const express = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { profileImages } = require('../middleware/upload');
const users = require('../controllers/userController');
const posts = require('../controllers/postController');
const { idParam, cursorQuery } = require('./rules');

const router = express.Router();

router.get('/suggestions', users.suggestions);
router.get(
  '/search',
  query('q').optional().isString().isLength({ max: 50 }),
  validate,
  users.search
);

router.patch(
  '/me',
  profileImages,
  [
    body('name').optional().trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name can be at most 50 characters'),
    body('bio').optional().trim().isLength({ max: 160 }).withMessage('Bio can be at most 160 characters'),
    body('location').optional().trim().isLength({ max: 40 }).withMessage('Location can be at most 40 characters'),
    body('website')
      .optional()
      .trim()
      .customSanitizer((value) => (value && !/^https?:\/\//i.test(value) ? `https://${value}` : value))
      .if((value) => value !== '')
      .isURL({ protocols: ['http', 'https'], require_protocol: true })
      .withMessage('Enter a valid website address')
      .isLength({ max: 100 }),
  ],
  validate,
  users.updateMe
);

router.get(
  '/:username',
  param('username').isString().isLength({ min: 1, max: 30 }),
  validate,
  users.getProfile
);

router.post('/:id/follow', idParam(), validate, users.follow);
router.delete('/:id/follow', idParam(), validate, users.unfollow);
router.get('/:id/followers', [idParam(), cursorQuery], validate, users.followers);
router.get('/:id/following', [idParam(), cursorQuery], validate, users.following);
router.get('/:id/posts', [idParam(), cursorQuery], validate, posts.userPosts);

module.exports = router;
