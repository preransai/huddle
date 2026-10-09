const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// The unique index is what actually makes liking idempotent, even when two
// requests race each other.
likeSchema.index({ post: 1, user: 1 }, { unique: true });
likeSchema.index({ post: 1, createdAt: -1, _id: -1 });

module.exports = mongoose.model('Like', likeSchema);
