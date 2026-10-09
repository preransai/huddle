const mongoose = require('mongoose');

// url is either an absolute URL (seeded demo images) or a local path like /uploads/abc.webp.
const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    width: Number,
    height: Number,
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, default: '', trim: true, maxlength: 500 },
    images: {
      type: [imageSchema],
      validate: [(images) => images.length <= 4, 'A post can have at most 4 images'],
    },
    hashtags: [{ type: String, lowercase: true }],
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0, min: 0 },
    commentsCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1, _id: -1 });
postSchema.index({ createdAt: -1, _id: -1 });
postSchema.index({ hashtags: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
