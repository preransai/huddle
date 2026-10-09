const { param, query } = require('express-validator');

// Profiles live at /:username on the client, so these can't be usernames.
const RESERVED_USERNAMES = new Set([
  'admin', 'api', 'explore', 'home', 'login', 'logout', 'notifications',
  'post', 'register', 'search', 'settings', 'tag', 'uploads', 'huddle',
]);

function usernameRules(chain) {
  return chain
    .trim()
    .toLowerCase()
    .matches(/^[a-z][a-z0-9_]{2,19}$/)
    .withMessage('Username must be 3-20 characters: letters, numbers and underscores, starting with a letter')
    .custom((value) => !RESERVED_USERNAMES.has(value))
    .withMessage('That username is reserved');
}

const idParam = (name = 'id') => param(name).isMongoId().withMessage(`Invalid ${name}`);

const cursorQuery = query('cursor').optional().isString().isLength({ max: 200 });

module.exports = { usernameRules, idParam, cursorQuery, RESERVED_USERNAMES };
