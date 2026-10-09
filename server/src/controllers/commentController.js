const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const HttpError = require('../utils/HttpError');
const { findPage, parseLimit } = require('../utils/pagination');
const { notify, notifyMentions } = require('../utils/notify');
const { resolveMentions } = require('../utils/users');
const { AUTHOR_POPULATE } = require('../utils/posts');

async function listComments(req, res) {
  const exists = await Post.exists({ _id: req.params.id });
  if (!exists) throw new HttpError(404, 'This post does not exist or was deleted');

  const { docs, nextCursor } = await findPage(Comment, { post: req.params.id }, {
    cursor: req.query.cursor,
    limit: parseLimit(req.query.limit),
    populate: AUTHOR_POPULATE,
  });
  res.json({ comments: docs.filter((c) => c.author), nextCursor });
}

async function addComment(req, res) {
  const post = await Post.findById(req.params.id).select('author').lean();
  if (!post) throw new HttpError(404, 'This post does not exist or was deleted');

  const comment = await Comment.create({ post: post._id, author: req.userId, text: req.body.text });
  const { commentsCount } = await Post.findByIdAndUpdate(
    post._id,
    { $inc: { commentsCount: 1 } },
    { returnDocument: 'after' }
  )
    .select('commentsCount')
    .lean();

  const base = { actor: req.userId, post: post._id, comment: comment._id };
  await notify({ ...base, recipient: post.author, type: 'comment' });
  // The post author already gets a "commented" notification, so an @mention of
  // them in the same comment would just be noise.
  await notifyMentions({ ...base, recipients: await resolveMentions(comment.text), skip: [post.author] });

  await comment.populate(AUTHOR_POPULATE);
  res.status(201).json({ comment, commentsCount });
}

// A comment can be removed by whoever wrote it, or by the owner of the post
// it's on (so people can clean up their own threads).
async function deleteComment(req, res) {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new HttpError(404, 'Comment not found');

  const post = await Post.findById(comment.post).select('author').lean();
  const isAuthor = String(comment.author) === req.userId;
  const isPostOwner = post && String(post.author) === req.userId;
  if (!isAuthor && !isPostOwner) {
    throw new HttpError(403, 'You can only delete your own comments');
  }

  await Promise.all([
    comment.deleteOne(),
    Notification.deleteMany({ comment: comment._id }),
  ]);
  const updated = await Post.findByIdAndUpdate(
    comment.post,
    { $inc: { commentsCount: -1 } },
    { returnDocument: 'after' }
  )
    .select('commentsCount')
    .lean();

  res.json({ commentsCount: updated?.commentsCount ?? 0 });
}

module.exports = { listComments, addComment, deleteComment };
