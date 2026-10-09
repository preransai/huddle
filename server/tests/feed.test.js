const mongoose = require('mongoose');
const Post = require('../src/models/Post');
const { connectTestDb, clearTestDb, closeTestDb, createUser, createPost, pngBuffer } = require('./helpers');

beforeAll(connectTestDb);
afterEach(clearTestDb);
afterAll(closeTestDb);

const texts = (res) => res.body.posts.map((p) => p.text);

describe('home feed', () => {
  it('shows only my posts and posts from people I follow, newest first', async () => {
    const me = await createUser();
    const friend = await createUser();
    const stranger = await createUser();
    await me.agent.post(`/api/users/${friend.user._id}/follow`);

    await createPost(friend.agent, 'friend old');
    await createPost(stranger.agent, 'stranger');
    await createPost(me.agent, 'mine');
    await createPost(friend.agent, 'friend new');

    const res = await me.agent.get('/api/posts/feed');
    expect(res.status).toBe(200);
    expect(texts(res)).toEqual(['friend new', 'mine', 'friend old']);
  });

  it('stops showing someone after unfollowing them', async () => {
    const me = await createUser();
    const friend = await createUser();
    await me.agent.post(`/api/users/${friend.user._id}/follow`);
    await createPost(friend.agent, 'hello');
    await me.agent.delete(`/api/users/${friend.user._id}/follow`);

    const res = await me.agent.get('/api/posts/feed');
    expect(res.body.posts).toHaveLength(0);
  });

  it('pages through the feed with a cursor without repeating or skipping posts', async () => {
    const { agent } = await createUser();
    for (let i = 1; i <= 25; i += 1) await createPost(agent, `post ${i}`);

    const seen = [];
    let cursor;
    const pageSizes = [];
    do {
      const res = await agent.get('/api/posts/feed').query({ limit: 10, cursor });
      pageSizes.push(res.body.posts.length);
      seen.push(...texts(res));
      cursor = res.body.nextCursor;
    } while (cursor);

    expect(pageSizes).toEqual([10, 10, 5]);
    expect(new Set(seen).size).toBe(25);
    expect(seen[0]).toBe('post 25');
    expect(seen[24]).toBe('post 1');
  });

  it('keeps pages stable when new posts arrive between requests', async () => {
    const { agent } = await createUser();
    for (let i = 1; i <= 6; i += 1) await createPost(agent, `post ${i}`);

    const first = await agent.get('/api/posts/feed').query({ limit: 3 });
    await createPost(agent, 'brand new');
    const second = await agent.get('/api/posts/feed').query({ limit: 3, cursor: first.body.nextCursor });

    // With skip/limit the new post would push "post 4" onto page two again.
    expect(texts(first)).toEqual(['post 6', 'post 5', 'post 4']);
    expect(texts(second)).toEqual(['post 3', 'post 2', 'post 1']);
  });

  it('rejects a malformed cursor', async () => {
    const { agent } = await createUser();
    const res = await agent.get('/api/posts/feed').query({ cursor: 'garbage' });
    expect(res.status).toBe(400);
  });
});

describe('other post lists', () => {
  it("lists a user's posts, and only the ones with images on the media tab", async () => {
    const { agent, user } = await createUser();
    await createPost(agent, 'just text');
    await agent.post('/api/posts').field('text', 'with photo').attach('images', await pngBuffer(), 'p.png');

    const all = await agent.get(`/api/users/${user._id}/posts`);
    const media = await agent.get(`/api/users/${user._id}/posts`).query({ media: 'true' });

    expect(texts(all)).toEqual(['with photo', 'just text']);
    expect(texts(media)).toEqual(['with photo']);
  });

  it('lists posts for a hashtag, case-insensitively, with a total', async () => {
    const { agent } = await createUser();
    await createPost(agent, 'Placement prep #DSA');
    await createPost(agent, 'More #dsa practice');
    await createPost(agent, 'Unrelated #travel');

    const res = await agent.get('/api/posts/tag/Dsa');
    expect(res.body.total).toBe(2);
    expect(texts(res)).toEqual(['More #dsa practice', 'Placement prep #DSA']);
  });

  it('ranks trending posts by engagement within the last week', async () => {
    const author = await createUser();
    const fans = await Promise.all([createUser(), createUser(), createUser()]);
    const quiet = (await createPost(author.agent, 'quiet')).body.post;
    const popular = (await createPost(author.agent, 'popular')).body.post;
    const discussed = (await createPost(author.agent, 'discussed')).body.post;
    const old = (await createPost(author.agent, 'old but loved')).body.post;

    for (const fan of fans) {
      await fan.agent.post(`/api/posts/${popular._id}/like`);
      await fan.agent.post(`/api/posts/${old._id}/like`);
    }
    // Two comments (worth 2 each) beat three likes.
    await fans[0].agent.post(`/api/posts/${discussed._id}/comments`).send({ text: 'a' });
    await fans[1].agent.post(`/api/posts/${discussed._id}/comments`).send({ text: 'b' });
    // Raw collection update: Mongoose treats createdAt as immutable.
    await Post.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(old._id) },
      { $set: { createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) } }
    );

    const res = await author.agent.get('/api/posts/trending');
    expect(texts(res)).toEqual(['discussed', 'popular']);
    expect(texts(res)).not.toContain(quiet.text);
  });
});
