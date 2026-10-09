const Follow = require('../models/Follow');
const User = require('../models/User');
const { extractMentions } = require('./text');

async function resolveMentions(text) {
  const usernames = extractMentions(text);
  if (!usernames.length) return [];
  const users = await User.find({ username: { $in: usernames } }).select('_id').lean();
  return users.map((u) => u._id);
}

// Adds `isFollowing` to each user in a list (followers, likers, search results)
// so the client can render follow buttons without a request per row.
async function withFollowState(users, viewerId) {
  if (!users.length) return users;
  const follows = await Follow.find({
    follower: viewerId,
    following: { $in: users.map((u) => u._id) },
  })
    .select('following')
    .lean();
  const following = new Set(follows.map((f) => String(f.following)));

  return users.map((user) => ({ ...user, isFollowing: following.has(String(user._id)) }));
}

module.exports = { resolveMentions, withFollowState };
