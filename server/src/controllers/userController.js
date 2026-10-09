const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const HttpError = require('../utils/HttpError');
const { findPage, parseLimit } = require('../utils/pagination');
const { escapeRegex } = require('../utils/text');
const { saveImage, removeImage } = require('../utils/images');
const { notify } = require('../utils/notify');
const { withFollowState } = require('../utils/users');

const LIST_FIELDS = `${User.PUBLIC_FIELDS} bio`;

async function getProfile(req, res) {
  const user = await User.findOne({ username: req.params.username.toLowerCase() }).lean();
  if (!user) throw new HttpError(404, `@${req.params.username} doesn't exist`);

  const [postsCount, follow] = await Promise.all([
    Post.countDocuments({ author: user._id }),
    Follow.exists({ follower: req.userId, following: user._id }),
  ]);
  delete user.password;
  delete user.__v;
  // Email addresses are private; only the account owner sees their own.
  if (String(user._id) !== req.userId) delete user.email;
  res.json({ user: { ...user, postsCount, isFollowing: Boolean(follow) } });
}

const EDITABLE_FIELDS = ['name', 'bio', 'location', 'website'];

async function updateMe(req, res) {
  const user = await User.findById(req.userId);
  if (!user) throw new HttpError(401, 'Please log in to continue');

  for (const field of EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  }

  const oldImages = [];
  for (const kind of ['avatar', 'cover']) {
    const file = req.files?.[kind]?.[0];
    if (file) {
      oldImages.push(user[kind]);
      user[kind] = (await saveImage(file, kind)).url;
    } else if (req.body[`remove_${kind}`] === 'true') {
      oldImages.push(user[kind]);
      user[kind] = '';
    }
  }

  await user.save();
  await Promise.all(oldImages.map(removeImage));
  res.json({ user });
}

async function follow(req, res) {
  const targetId = req.params.id;
  if (targetId === req.userId) throw new HttpError(400, "You can't follow yourself");
  if (!(await User.exists({ _id: targetId }))) throw new HttpError(404, 'User not found');

  let created = false;
  try {
    const result = await Follow.updateOne(
      { follower: req.userId, following: targetId },
      { $setOnInsert: { follower: req.userId, following: targetId } },
      { upsert: true }
    );
    created = result.upsertedCount === 1;
  } catch (err) {
    if (err.code !== 11000) throw err;
  }

  if (created) {
    await Promise.all([
      User.updateOne({ _id: targetId }, { $inc: { followersCount: 1 } }),
      User.updateOne({ _id: req.userId }, { $inc: { followingCount: 1 } }),
    ]);
    await notify({ recipient: targetId, actor: req.userId, type: 'follow' });
  }

  const target = await User.findById(targetId).select('followersCount').lean();
  res.json({ isFollowing: true, followersCount: target.followersCount });
}

async function unfollow(req, res) {
  const targetId = req.params.id;
  const { deletedCount } = await Follow.deleteOne({ follower: req.userId, following: targetId });

  if (deletedCount) {
    await Promise.all([
      User.updateOne({ _id: targetId }, { $inc: { followersCount: -1 } }),
      User.updateOne({ _id: req.userId }, { $inc: { followingCount: -1 } }),
    ]);
  }

  const target = await User.findById(targetId).select('followersCount').lean();
  if (!target) throw new HttpError(404, 'User not found');
  res.json({ isFollowing: false, followersCount: target.followersCount });
}

function connectionList(direction) {
  // Both lists read the same Follow documents, just from opposite ends.
  const [matchField, showField] = direction === 'followers'
    ? ['following', 'follower']
    : ['follower', 'following'];

  return async function list(req, res) {
    const { docs, nextCursor } = await findPage(Follow, { [matchField]: req.params.id }, {
      cursor: req.query.cursor,
      limit: parseLimit(req.query.limit, 20),
      populate: { path: showField, select: LIST_FIELDS },
    });
    const users = docs.map((doc) => doc[showField]).filter(Boolean);
    res.json({ users: await withFollowState(users, req.userId), nextCursor });
  };
}

// People you don't follow yet, most-followed first. A random sample from the
// top 20 keeps the sidebar from showing the exact same three people forever.
async function suggestions(req, res) {
  const following = await Follow.distinct('following', { follower: req.userId });
  const exclude = [...following, req.userId].map((id) => new mongoose.Types.ObjectId(String(id)));

  const users = await User.aggregate([
    { $match: { _id: { $nin: exclude } } },
    { $sort: { followersCount: -1, createdAt: -1 } },
    { $limit: 20 },
    { $sample: { size: parseLimit(req.query.limit, 3) } },
    { $project: { name: 1, username: 1, avatar: 1, bio: 1, followersCount: 1 } },
  ]);
  res.json({ users: users.map((u) => ({ ...u, isFollowing: false })) });
}

async function search(req, res) {
  const q = (req.query.q || '').trim().replace(/^@/, '');
  if (!q) return res.json({ users: [] });

  const pattern = new RegExp(escapeRegex(q), 'i');
  const prefix = new RegExp(`^${escapeRegex(q)}`, 'i');
  const users = await User.find({ $or: [{ username: pattern }, { name: pattern }] })
    .select(`${LIST_FIELDS} followersCount`)
    .limit(30)
    .lean();

  // Prefix matches on the username are what people usually mean, so they go first.
  users.sort((a, b) => {
    const rank = (u) => (prefix.test(u.username) ? 0 : prefix.test(u.name) ? 1 : 2);
    return rank(a) - rank(b) || b.followersCount - a.followersCount;
  });

  const limited = users.slice(0, parseLimit(req.query.limit, 8));
  res.json({ users: await withFollowState(limited, req.userId) });
}

module.exports = {
  getProfile,
  updateMe,
  follow,
  unfollow,
  followers: connectionList('followers'),
  following: connectionList('following'),
  suggestions,
  search,
};
