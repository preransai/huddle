const Post = require('../models/Post');
const Like = require('../models/Like');
const User = require('../models/User');
const HttpError = require('../utils/HttpError');
const { findPage, parseLimit } = require('../utils/pagination');
const { notify } = require('../utils/notify');
const { withFollowState } = require('../utils/users');

async function changeLikesCount(postId, delta) {
  const updated = await Post.findByIdAndUpdate(
    postId,
    { $inc: { likesCount: delta } },
    { returnDocument: 'after' }
  )
    .select('likesCount')
    .lean();
  return updated.likesCount;
}

async function findPostOr404(id) {
  const post = await Post.findById(id).select('author likesCount').lean();
  if (!post) throw new HttpError(404, 'This post does not exist or was deleted');
  return post;
}

// Liking twice is a no-op rather than an error, so a double click or a retried
// request can't inflate the count. The counter only moves when a Like document
// was actually inserted or removed.
async function likePost(req, res) {
  const post = await findPostOr404(req.params.id);
  let created = false;
  try {
    const result = await Like.updateOne(
      { post: post._id, user: req.userId },
      { $setOnInsert: { post: post._id, user: req.userId } },
      { upsert: true }
    );
    created = result.upsertedCount === 1;
  } catch (err) {
    // Two concurrent upserts can both miss and one then hits the unique index.
    if (err.code !== 11000) throw err;
  }

  let { likesCount } = post;
  if (created) {
    likesCount = await changeLikesCount(post._id, 1);
    await notify({ recipient: post.author, actor: req.userId, type: 'like', post: post._id });
  }

  res.json({ liked: true, likesCount });
}

async function unlikePost(req, res) {
  const post = await findPostOr404(req.params.id);
  const { deletedCount } = await Like.deleteOne({ post: post._id, user: req.userId });

  let { likesCount } = post;
  if (deletedCount) {
    likesCount = await changeLikesCount(post._id, -1);
  }

  res.json({ liked: false, likesCount });
}

async function listLikes(req, res) {
  await findPostOr404(req.params.id);
  const { docs, nextCursor } = await findPage(Like, { post: req.params.id }, {
    cursor: req.query.cursor,
    limit: parseLimit(req.query.limit, 20),
    populate: { path: 'user', select: `${User.PUBLIC_FIELDS} bio` },
  });
  const users = docs.map((like) => like.user).filter(Boolean);
  res.json({ users: await withFollowState(users, req.userId), nextCursor });
}

module.exports = { likePost, unlikePost, listLikes };
