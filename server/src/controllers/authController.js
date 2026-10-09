const User = require('../models/User');
const HttpError = require('../utils/HttpError');
const { setAuthCookie, clearAuthCookie, readUserId } = require('../middleware/auth');

async function register(req, res) {
  const { name, username, email, password } = req.body;

  const existing = await User.findOne({ $or: [{ username }, { email }] }).select('username email').lean();
  if (existing) {
    const field = existing.username === username ? 'username' : 'email';
    const message = field === 'username' ? 'That username is taken' : 'An account with that email already exists';
    throw new HttpError(409, message, [{ field, message }]);
  }

  const user = await User.create({ name, username, email, password });
  setAuthCookie(res, user._id);
  res.status(201).json({ user });
}

async function login(req, res) {
  const identifier = req.body.identifier.toLowerCase();
  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier.replace(/^@/, '') }],
  }).select('+password');

  // Same message for "no such user" and "wrong password" so the form can't be
  // used to check which emails have accounts.
  if (!user || !(await user.checkPassword(req.body.password))) {
    throw new HttpError(401, 'Incorrect email/username or password');
  }

  setAuthCookie(res, user._id);
  res.json({ user });
}

function logout(req, res) {
  clearAuthCookie(res);
  res.status(204).end();
}

// Returns { user: null } instead of a 401 when logged out: the client calls
// this on every page load to restore the session, and a guest visit is not an
// error.
async function me(req, res) {
  const userId = readUserId(req);
  const user = userId ? await User.findById(userId) : null;
  if (userId && !user) clearAuthCookie(res);
  res.json({ user });
}

module.exports = { register, login, logout, me };
