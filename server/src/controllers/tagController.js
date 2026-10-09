const Post = require('../models/Post');
const { escapeRegex } = require('../utils/text');
const { parseLimit } = require('../utils/pagination');

const DAY = 24 * 60 * 60 * 1000;

async function trendingTags(req, res) {
  const since = new Date(Date.now() - 7 * DAY);
  const tags = await Post.aggregate([
    { $match: { createdAt: { $gte: since }, 'hashtags.0': { $exists: true } } },
    { $unwind: '$hashtags' },
    { $group: { _id: '$hashtags', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $limit: parseLimit(req.query.limit, 6) },
  ]);
  res.json({ tags: tags.map((t) => ({ tag: t._id, count: t.count })) });
}

async function searchTags(req, res) {
  const q = (req.query.q || '').trim().replace(/^#/, '').toLowerCase();
  if (!q) return res.json({ tags: [] });

  const tags = await Post.aggregate([
    { $match: { hashtags: { $regex: `^${escapeRegex(q)}` } } },
    { $unwind: '$hashtags' },
    { $match: { hashtags: { $regex: `^${escapeRegex(q)}` } } },
    { $group: { _id: '$hashtags', count: { $sum: 1 } } },
    { $sort: { count: -1, _id: 1 } },
    { $limit: parseLimit(req.query.limit, 5) },
  ]);
  res.json({ tags: tags.map((t) => ({ tag: t._id, count: t.count })) });
}

module.exports = { trendingTags, searchTags };
