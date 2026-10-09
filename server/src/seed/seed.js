const bcrypt = require('bcrypt');
const User = require('../models/User');
const Post = require('../models/Post');
const Like = require('../models/Like');
const Comment = require('../models/Comment');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');
const { extractHashtags, extractMentions } = require('../utils/text');
const userData = require('./users');
const postData = require('./posts');
const commentPools = require('./comments');

const DEMO_PASSWORD = 'huddle123';
const HOUR = 60 * 60 * 1000;

// Small seeded PRNG (mulberry32) so every seed run produces the same likes,
// comments and follows. Makes screenshots and manual testing repeatable.
function createRandom(seed) {
  let a = seed;
  return function random() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const IMAGE_SHAPES = [
  [1200, 900],
  [1600, 900],
  [1080, 1350],
];

function seedImages(postIndex, count, random) {
  return Array.from({ length: count }, (_, i) => {
    const [width, height] = count === 1 ? IMAGE_SHAPES[Math.floor(random() * 3)] : [1200, 900];
    return {
      url: `https://picsum.photos/seed/huddle-${postIndex}-${i}/${width}/${height}`,
      width,
      height,
    };
  });
}

function pickSome(items, count, random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

// A random moment up to `maxHours` after `start`, squeezed into the time that
// has actually passed so nothing ends up in the future.
function after(start, maxHours, random, now) {
  const window = Math.max(0, Math.min(maxHours * HOUR, now - start.getTime() - 60 * 1000));
  return new Date(start.getTime() + random() * window);
}

async function clearDatabase() {
  await Promise.all(
    [User, Post, Like, Comment, Follow, Notification].map((Model) => Model.deleteMany({}))
  );
}

// Inserting through the raw collection lets us set createdAt in the past;
// Mongoose's timestamps would otherwise stamp everything with "now".
function insertRaw(Model, docs) {
  if (!docs.length) return null;
  return Model.collection.insertMany(docs.map((doc) => new Model(doc).toObject()));
}

// Ananya is the main demo account, so her follow list is fixed (and leaves a
// few people out for the "Who to follow" box). Everyone else is random.
const FIXED_FOLLOWS = {
  ananya: ['rohan_m', 'priyanair', 'arjunv', 'sneha_k', 'kabir', 'meerajoshi', 'danokafor', 'sofiam'],
};

function buildFollowGraph(users, random, now) {
  const follows = [];
  for (const user of users) {
    const fixed = FIXED_FOLLOWS[user.username];
    const others = users.filter((u) => u !== user);
    const targets = fixed
      ? others.filter((u) => fixed.includes(u.username))
      : pickSome(others, 4 + Math.floor(random() * 5), random);

    for (const target of targets) {
      const start = new Date(Math.max(user.createdAt, target.createdAt));
      follows.push({ follower: user._id, following: target._id, createdAt: after(start, 24 * 20, random, now) });
    }
  }

  // Make sure the demo account has a decent number of followers.
  const ananya = users.find((u) => u.username === 'ananya');
  for (const user of users) {
    if (user === ananya) continue;
    const exists = follows.some((f) => f.follower === user._id && f.following === ananya._id);
    if (!exists && random() < 0.8) {
      follows.push({ follower: user._id, following: ananya._id, createdAt: after(new Date(now - 20 * 24 * HOUR), 24 * 19, random, now) });
    }
  }
  return follows;
}

async function seedDatabase() {
  const random = createRandom(2026);
  const now = Date.now();
  await clearDatabase();

  const password = await bcrypt.hash(DEMO_PASSWORD, 10);
  const users = userData.map((data, i) => {
    const createdAt = new Date(now - (60 - i * 2) * 24 * HOUR);
    return {
      ...new User({ ...data, email: `${data.username.replace(/_/g, '')}@example.com`, password }).toObject(),
      createdAt,
      updatedAt: createdAt,
    };
  });
  const byUsername = new Map(users.map((u) => [u.username, u]));

  const follows = buildFollowGraph(users, random, now);
  for (const follow of follows) {
    users.find((u) => u._id === follow.follower).followingCount += 1;
    users.find((u) => u._id === follow.following).followersCount += 1;
  }

  const notifications = [];
  const addNotification = (data) => {
    if (String(data.recipient) === String(data.actor)) return;
    notifications.push({ ...data, read: now - data.createdAt.getTime() > 6 * HOUR });
  };
  for (const follow of follows) {
    addNotification({ recipient: follow.following, actor: follow.follower, type: 'follow', createdAt: follow.createdAt });
  }

  const posts = [];
  const likes = [];
  const comments = [];

  postData.forEach((data, index) => {
    const author = byUsername.get(data.by);
    const createdAt = new Date(now - data.hours * HOUR - Math.floor(random() * 40) * 60 * 1000);
    const mentions = extractMentions(data.text).map((name) => byUsername.get(name)).filter(Boolean);
    const post = {
      ...new Post({
        author: author._id,
        text: data.text,
        images: seedImages(index, data.images, random),
        hashtags: extractHashtags(data.text),
        mentions: mentions.map((u) => u._id),
      }).toObject(),
      createdAt,
      updatedAt: createdAt,
    };
    posts.push(post);

    for (const user of mentions) {
      addNotification({ recipient: user._id, actor: author._id, type: 'mention', post: post._id, createdAt });
    }

    const others = users.filter((u) => u._id !== author._id);
    const recent = data.hours < 72;
    const likers = pickSome(others, (recent ? 4 : 1) + Math.floor(random() * 7), random);
    for (const liker of likers) {
      const likedAt = after(createdAt, 30, random, now);
      likes.push({ post: post._id, user: liker._id, createdAt: likedAt, updatedAt: likedAt });
      addNotification({ recipient: author._id, actor: liker._id, type: 'like', post: post._id, createdAt: likedAt });
    }
    post.likesCount = likers.length;

    const thread = data.comments
      || pickSome(others, Math.floor(random() * 4), random).map((u) => [
        u.username,
        commentPools[data.kind][Math.floor(random() * commentPools[data.kind].length)],
      ]);
    let lastTime = createdAt;
    for (const [username, text] of thread) {
      const commenter = byUsername.get(username);
      lastTime = after(lastTime, 6, random, now);
      const comment = {
        ...new Comment({ post: post._id, author: commenter._id, text }).toObject(),
        createdAt: lastTime,
        updatedAt: lastTime,
      };
      comments.push(comment);

      const base = { actor: commenter._id, post: post._id, comment: comment._id, createdAt: lastTime };
      addNotification({ ...base, recipient: author._id, type: 'comment' });
      for (const name of extractMentions(text)) {
        const mentioned = byUsername.get(name);
        if (mentioned && mentioned._id !== author._id) {
          addNotification({ ...base, recipient: mentioned._id, type: 'mention' });
        }
      }
    }
    post.commentsCount = thread.length;
  });

  await insertRaw(User, users);
  await Promise.all([
    insertRaw(Follow, follows.map((f) => ({ ...f, updatedAt: f.createdAt }))),
    insertRaw(Post, posts),
    insertRaw(Like, likes),
    insertRaw(Comment, comments),
    insertRaw(Notification, notifications.map((n) => ({ ...n, updatedAt: n.createdAt }))),
  ]);
  await Promise.all([User, Post, Like, Comment, Follow, Notification].map((Model) => Model.syncIndexes()));

  return {
    users: users.length,
    posts: posts.length,
    comments: comments.length,
    likes: likes.length,
    follows: follows.length,
    notifications: notifications.length,
  };
}

module.exports = { seedDatabase, clearDatabase, DEMO_PASSWORD };
