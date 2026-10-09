const Post = require('../models/Post');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');
const HttpError = require('../utils/HttpError');
const { findPage, parseLimit } = require('../utils/pagination');
const { extractHashtags } = require('../utils/text');
const { saveImage, removeImage } = require('../utils/images');
const { notifyMentions } = require('../utils/notify');
const { resolveMentions } = require('../utils/users');
const { AUTHOR_POPULATE, withViewerState } = require('../utils/posts');

const TRENDING_WINDOW_DAYS = 7;

async function sendPage(res, filter, req) {
  const { docs, nextCursor } = await findPage(Post, filter, {
    cursor: req.query.cursor,
    limit: parseLimit(req.query.limit),
    populate: AUTHOR_POPULATE,
  });
  res.json({ posts: await withViewerState(docs, req.userId), nextCursor });
}

async function createPost(req, res) {
  const text = (req.body.text || '').trim();
  const files = req.files || [];
  if (!text && !files.length) {
    throw new HttpError(400, 'Write something or add at least one image');
  }

  const images = [];
  try {
    for (const file of files) images.push(await saveImage(file, 'post'));

    const mentions = await resolveMentions(text);
    const post = await Post.create({
      author: req.userId,
      text,
      images,
      hashtags: extractHashtags(text),
      mentions,
    });

    await notifyMentions({ recipients: mentions, actor: req.userId, post: post._id });

    const saved = await Post.findById(post._id).populate(AUTHOR_POPULATE).lean();
    res.status(201).json({ post: { ...saved, liked: false } });
  } catch (err) {
    await Promise.all(images.map((image) => removeImage(image.url)));
    throw err;
  }
}

async function getPost(req, res) {
  const post = await Post.findById(req.params.id).populate(AUTHOR_POPULATE).lean();
  if (!post || !post.author) throw new HttpError(404, 'This post does not exist or was deleted');
  const [withState] = await withViewerState([post], req.userId);
  res.json({ post: withState });
}

async function deletePost(req, res) {
  const post = await Post.findById(req.params.id);
  if (!post) throw new HttpError(404, 'This post does not exist or was deleted');
  if (String(post.author) !== req.userId) {
    throw new HttpError(403, 'You can only delete your own posts');
  }

  await Promise.all([
    post.deleteOne(),
    Like.deleteMany({ post: post._id }),
    Comment.deleteMany({ post: post._id }),
    Notification.deleteMany({ post: post._id }),
    ...post.images.map((image) => removeImage(image.url)),
  ]);
  res.status(204).end();
}

async function homeFeed(req, res) {
  const following = await Follow.distinct('following', { follower: req.userId });
  await sendPage(res, { author: { $in: [...following, req.userId] } }, req);
}

async function latest(req, res) {
  await sendPage(res, {}, req);
}

async function userPosts(req, res) {
  const filter = { author: req.params.id };
  if (req.query.media === 'true') filter['images.0'] = { $exists: true };
  await sendPage(res, filter, req);
}

async function tagPosts(req, res) {
  const tag = req.params.tag.toLowerCase();
  const total = req.query.cursor ? undefined : await Post.countDocuments({ hashtags: tag });
  const { docs, nextCursor } = await findPage(Post, { hashtags: tag }, {
    cursor: req.query.cursor,
    limit: parseLimit(req.query.limit),
    populate: AUTHOR_POPULATE,
  });
  res.json({ posts: await withViewerState(docs, req.userId), nextCursor, total });
}

// "Trending" is deliberately simple: engagement in the last week, with a
// comment counting double because it takes more effort than a like.
async function trending(req, res) {
  const since = new Date(Date.now() - TRENDING_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const posts = await Post.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $addFields: { score: { $add: ['$likesCount', { $multiply: ['$commentsCount', 2] }] } } },
    { $match: { score: { $gt: 0 } } },
    { $sort: { score: -1, createdAt: -1 } },
    { $limit: parseLimit(req.query.limit, 20) },
  ]);
  await Post.populate(posts, AUTHOR_POPULATE);
  res.json({ posts: await withViewerState(posts, req.userId) });
}

module.exports = {
  createPost,
  getPost,
  deletePost,
  homeFeed,
  latest,
  userPosts,
  tagPosts,
  trending,
};
