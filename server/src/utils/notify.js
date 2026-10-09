const Notification = require('../models/Notification');
const User = require('../models/User');
const { emitToUser } = require('../socket');

const POPULATE = [
  { path: 'actor', select: User.PUBLIC_FIELDS },
  { path: 'post', select: 'text images' },
  { path: 'comment', select: 'text' },
];

// Likes and follows are upserted on (recipient, actor, type, post) so that
// someone toggling a like on and off ten times produces one notification, not
// ten. Comments and mentions are always new events.
const DEDUPED_TYPES = new Set(['like', 'follow']);

async function notify({ recipient, actor, type, post, comment }) {
  if (!recipient || String(recipient) === String(actor)) return null;

  let notification;
  if (DEDUPED_TYPES.has(type)) {
    const filter = { recipient, actor, type, post: post || null };
    const result = await Notification.findOneAndUpdate(
      filter,
      { $setOnInsert: { ...filter, read: false } },
      { upsert: true, returnDocument: 'after', includeResultMetadata: true }
    );
    if (result.lastErrorObject?.updatedExisting) return null;
    notification = result.value;
  } else {
    notification = await Notification.create({ recipient, actor, type, post, comment });
  }

  const populated = await Notification.findById(notification._id).populate(POPULATE).lean();
  emitToUser(recipient, 'notification:new', populated);
  return populated;
}

// Mentions are resolved to user ids by the caller (the post/comment needs
// them anyway), so this only filters out people who are already notified.
async function notifyMentions({ recipients, actor, post, comment, skip = [] }) {
  const skipIds = new Set([...skip, actor].map(String));
  const targets = recipients.filter((id) => !skipIds.has(String(id)));
  return Promise.all(
    targets.map((recipient) => notify({ recipient, actor, type: 'mention', post, comment }))
  );
}

module.exports = { notify, notifyMentions, NOTIFICATION_POPULATE: POPULATE };
