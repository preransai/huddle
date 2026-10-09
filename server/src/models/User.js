const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z][a-z0-9_]{2,19}$/,
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    bio: { type: String, default: '', maxlength: 160 },
    location: { type: String, default: '', maxlength: 40 },
    website: { type: String, default: '', maxlength: 100 },
    avatar: { type: String, default: '' },
    cover: { type: String, default: '' },
    // Denormalised so profile headers and "who to follow" don't need a count query per user.
    followersCount: { type: Number, default: 0, min: 0 },
    followingCount: { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

userSchema.methods.checkPassword = function checkPassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Fields that are safe to embed wherever a user appears next to content.
userSchema.statics.PUBLIC_FIELDS = 'name username avatar';

module.exports = mongoose.model('User', userSchema);
