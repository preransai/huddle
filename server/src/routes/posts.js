const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { postImages } = require('../middleware/upload');
const posts = require('../controllers/postController');
const likes = require('../controllers/likeController');
const comments = require('../controllers/commentController');
const { idParam, cursorQuery } = require('./rules');

const router = express.Router();

router.get('/feed', cursorQuery, validate, posts.homeFeed);
router.get('/latest', cursorQuery, validate, posts.latest);
router.get('/trending', posts.trending);
router.get(
  '/tag/:tag',
  [param('tag').matches(/^[a-zA-Z][a-zA-Z0-9_]{0,49}$/).withMessage('Invalid hashtag'), cursorQuery],
  validate,
  posts.tagPosts
);

router.post(
  '/',
  postImages,
  body('text').optional().isString().isLength({ max: 500 }).withMessage('Posts can be at most 500 characters'),
  validate,
  posts.createPost
);

router.get('/:id', idParam(), validate, posts.getPost);
router.delete('/:id', idParam(), validate, posts.deletePost);

router.post('/:id/like', idParam(), validate, likes.likePost);
router.delete('/:id/like', idParam(), validate, likes.unlikePost);
router.get('/:id/likes', [idParam(), cursorQuery], validate, likes.listLikes);

router.get('/:id/comments', [idParam(), cursorQuery], validate, comments.listComments);
router.post(
  '/:id/comments',
  [
    idParam(),
    body('text')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Comment cannot be empty')
      .isLength({ max: 300 })
      .withMessage('Comments can be at most 300 characters'),
  ],
  validate,
  comments.addComment
);

module.exports = router;
