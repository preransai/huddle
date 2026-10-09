const Notification = require('../models/Notification');
const { findPage, parseLimit } = require('../utils/pagination');
const { NOTIFICATION_POPULATE } = require('../utils/notify');
const { emitToUser } = require('../socket');

async function listNotifications(req, res) {
  const { docs, nextCursor } = await findPage(Notification, { recipient: req.userId }, {
    cursor: req.query.cursor,
    limit: parseLimit(req.query.limit, 20),
    populate: NOTIFICATION_POPULATE,
  });
  // Drop notifications whose actor deleted their account.
  res.json({ notifications: docs.filter((n) => n.actor), nextCursor });
}

async function unreadCount(req, res) {
  const count = await Notification.countDocuments({ recipient: req.userId, read: false });
  res.json({ count });
}

async function markAllRead(req, res) {
  const { modifiedCount } = await Notification.updateMany(
    { recipient: req.userId, read: false },
    { $set: { read: true } }
  );
  // Other open tabs of the same user clear their badge too.
  emitToUser(req.userId, 'notification:read-all');
  res.json({ updated: modifiedCount });
}

module.exports = { listNotifications, unreadCount, markAllRead };
