const Like = require('../models/Like');
const User = require('../models/User');

const AUTHOR_POPULATE = { path: 'author', select: User.PUBLIC_FIELDS };

// Adds `liked` for the current viewer with a single query for the whole page,
// instead of one lookup per post.
async function withViewerState(posts, viewerId) {
  if (!posts.length) return posts;
  const likes = await Like.find({ user: viewerId, post: { $in: posts.map((p) => p._id) } })
    .select('post')
    .lean();
  const liked = new Set(likes.map((like) => String(like.post)));

  return posts
    .filter((post) => post.author)
    .map((post) => ({ ...post, liked: liked.has(String(post._id)) }));
}

module.exports = { AUTHOR_POPULATE, withViewerState };
