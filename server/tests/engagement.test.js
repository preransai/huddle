const Like = require('../src/models/Like');
const { connectTestDb, clearTestDb, closeTestDb, createUser, createPost } = require('./helpers');

beforeAll(connectTestDb);
afterEach(clearTestDb);
afterAll(closeTestDb);

async function setup() {
  const author = await createUser();
  const reader = await createUser();
  const post = (await createPost(author.agent, 'Rate my hostel maggi')).body.post;
  return { author, reader, post };
}

describe('likes', () => {
  it('liking twice counts once', async () => {
    const { reader, post } = await setup();

    const first = await reader.agent.post(`/api/posts/${post._id}/like`);
    const second = await reader.agent.post(`/api/posts/${post._id}/like`);

    expect(first.body).toEqual({ liked: true, likesCount: 1 });
    expect(second.body).toEqual({ liked: true, likesCount: 1 });
    expect(await Like.countDocuments({ post: post._id })).toBe(1);
  });

  it('survives a burst of concurrent like requests', async () => {
    const { reader, post } = await setup();
    await Promise.all(Array.from({ length: 5 }, () => reader.agent.post(`/api/posts/${post._id}/like`)));

    const res = await reader.agent.get(`/api/posts/${post._id}`);
    expect(res.body.post.likesCount).toBe(1);
  });

  it('unliking decrements once and never goes below zero', async () => {
    const { reader, post } = await setup();
    await reader.agent.post(`/api/posts/${post._id}/like`);

    const first = await reader.agent.delete(`/api/posts/${post._id}/like`);
    const second = await reader.agent.delete(`/api/posts/${post._id}/like`);

    expect(first.body).toEqual({ liked: false, likesCount: 0 });
    expect(second.body).toEqual({ liked: false, likesCount: 0 });
  });

  it('counts likes from different people separately', async () => {
    const { author, reader, post } = await setup();
    await reader.agent.post(`/api/posts/${post._id}/like`);
    const res = await author.agent.post(`/api/posts/${post._id}/like`);
    expect(res.body.likesCount).toBe(2);
  });

  it('lists who liked a post, with follow state for the viewer', async () => {
    const { author, reader, post } = await setup();
    await reader.agent.post(`/api/posts/${post._id}/like`);
    await author.agent.post(`/api/users/${reader.user._id}/follow`);

    const res = await author.agent.get(`/api/posts/${post._id}/likes`);
    expect(res.body.users).toHaveLength(1);
    expect(res.body.users[0]).toMatchObject({ username: reader.user.username, isFollowing: true });
    expect(res.body.users[0].password).toBeUndefined();
    expect(res.body.users[0].email).toBeUndefined();
  });

  it('returns 404 when liking a post that does not exist', async () => {
    const { reader } = await setup();
    const res = await reader.agent.post('/api/posts/64b7f0c2a1b2c3d4e5f60718/like');
    expect(res.status).toBe(404);
  });
});

describe('comments', () => {
  it('adds a comment and bumps the count', async () => {
    const { reader, post } = await setup();
    const res = await reader.agent.post(`/api/posts/${post._id}/comments`).send({ text: '  Ten out of ten  ' });

    expect(res.status).toBe(201);
    expect(res.body.comment).toMatchObject({ text: 'Ten out of ten', author: { username: reader.user.username } });
    expect(res.body.commentsCount).toBe(1);
  });

  it('validates comment text', async () => {
    const { reader, post } = await setup();
    const empty = await reader.agent.post(`/api/posts/${post._id}/comments`).send({ text: '   ' });
    const long = await reader.agent.post(`/api/posts/${post._id}/comments`).send({ text: 'x'.repeat(301) });

    expect(empty.status).toBe(400);
    expect(long.status).toBe(400);
  });

  it('returns comments newest first with cursor pagination', async () => {
    const { reader, post } = await setup();
    for (let i = 1; i <= 12; i += 1) {
      await reader.agent.post(`/api/posts/${post._id}/comments`).send({ text: `comment ${i}` });
    }

    const first = await reader.agent.get(`/api/posts/${post._id}/comments`);
    const second = await reader.agent.get(`/api/posts/${post._id}/comments`).query({ cursor: first.body.nextCursor });

    expect(first.body.comments).toHaveLength(10);
    expect(first.body.comments[0].text).toBe('comment 12');
    expect(second.body.comments.map((c) => c.text)).toEqual(['comment 2', 'comment 1']);
    expect(second.body.nextCursor).toBeNull();
  });

  it('lets the commenter delete their own comment', async () => {
    const { reader, post } = await setup();
    const { body } = await reader.agent.post(`/api/posts/${post._id}/comments`).send({ text: 'oops' });

    const res = await reader.agent.delete(`/api/comments/${body.comment._id}`);
    expect(res.status).toBe(200);
    expect(res.body.commentsCount).toBe(0);
  });

  it("lets the post's author remove comments on their post", async () => {
    const { author, reader, post } = await setup();
    const { body } = await reader.agent.post(`/api/posts/${post._id}/comments`).send({ text: 'spam' });

    const res = await author.agent.delete(`/api/comments/${body.comment._id}`);
    expect(res.status).toBe(200);
  });

  it("does not let anyone else delete a comment", async () => {
    const { reader, post } = await setup();
    const stranger = await createUser();
    const { body } = await reader.agent.post(`/api/posts/${post._id}/comments`).send({ text: 'mine' });

    const res = await stranger.agent.delete(`/api/comments/${body.comment._id}`);
    expect(res.status).toBe(403);
  });
});
