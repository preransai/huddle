const jwt = require('jsonwebtoken');
const env = require('../config/env');
const HttpError = require('../utils/HttpError');

const COOKIE_NAME = 'huddle_token';

// The token lives in an httpOnly cookie rather than localStorage, so injected
// script can't read it. SameSite=Lax blocks it from being sent on cross-site
// POSTs, which covers the usual CSRF case for a same-origin app.
const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.isProduction,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, env.jwtSecret).sub;
  } catch {
    return null;
  }
}

function setAuthCookie(res, userId) {
  res.cookie(COOKIE_NAME, signToken(userId), cookieOptions);
}

function clearAuthCookie(res) {
  const { maxAge, ...options } = cookieOptions;
  res.clearCookie(COOKIE_NAME, options);
}

function readUserId(req) {
  const token = req.cookies?.[COOKIE_NAME];
  return token ? verifyToken(token) : null;
}

function requireAuth(req, res, next) {
  const userId = readUserId(req);
  if (!userId) return next(new HttpError(401, 'Please log in to continue'));
  req.userId = userId;
  next();
}

module.exports = {
  COOKIE_NAME,
  setAuthCookie,
  clearAuthCookie,
  readUserId,
  verifyToken,
  requireAuth,
};
