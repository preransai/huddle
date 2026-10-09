const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const validate = require('../middleware/validate');
const auth = require('../controllers/authController');
const { usernameRules } = require('./rules');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => env.isTest,
  message: { message: 'Too many attempts. Please wait a few minutes and try again.' },
});

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 50 }).withMessage('Name can be at most 50 characters'),
    usernameRules(body('username')),
    body('email').trim().isEmail().withMessage('Enter a valid email address').normalizeEmail({ gmail_remove_dots: false }),
    body('password').isLength({ min: 8, max: 72 }).withMessage('Password must be 8 to 72 characters'),
  ],
  validate,
  auth.register
);

router.post(
  '/login',
  authLimiter,
  [
    body('identifier').trim().notEmpty().withMessage('Enter your email or username'),
    body('password').notEmpty().withMessage('Enter your password'),
  ],
  validate,
  auth.login
);

router.post('/logout', auth.logout);
router.get('/me', auth.me);

module.exports = router;
