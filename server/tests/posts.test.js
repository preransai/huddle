const fs = require('fs');
const path = require('path');
const env = require('../src/config/env');
const Like = require('../src/models/Like');
const Comment = require('../src/models/Comment');
const Notification = require('../src/models/Notification');
const { connectTestDb, clearTestDb, closeTestDb, createUser, createPost, pngBuffer } = require('./helpers');

beforeAll(connectTestDb);
afterEach(clearTestDb);
afterAll(closeTestDb);

const uploadedFile = (url) => path.join(env.uploadDir, path.basename(url));

describe('creating posts', () => {
  it('creates a text post and indexes its hashtags and mentions', async () => {
    const { user: priya } = await createUser({ username: 'priya' });
    const { agent } = await createUser();

    const res = await createPost(agent, 'Demo day at the #Hackathon with @priya and @nobody_here #campuslife');

    expect(res.status).toBe(201);
    expect(res.body.post.hashtags).toEqual(['hackathon', 'campuslife']);
    expect(res.body.post.mentions).toEqual([priya._id]);
    expect(res.body.post.author).toMatchObject({ username: expect.any(String), name: expect.any(String) });
    expect(res.body.post.liked).toBe(false);
  });

  it('accepts images, re-encodes them to webp and caps the size at 1600px', async () => {
    const { agent } = await createUser();
    const res = await agent
      .post('/api/posts')
      .field('text', 'Sunset from the hostel roof')
      .attach('images', await pngBuffer(2400, 1200), 'sunset.png')
      .attach('images', await pngBuffer(), 'small.png');

    expect(res.status).toBe(201);
    const [big, small] = res.body.post.images;
    expect(big.url).toMatch(/^\/uploads\/.+\.webp$/);
    expect(big).toMatchObject({ width: 1600, height: 800 });
    expect(small).toMatchObject({ width: 40, height: 30 });
    expect(fs.existsSync(uploadedFile(big.url))).toBe(true);
  });

  it('allows an image-only post', async () => {
    const { agent } = await createUser();
    const res = await agent.post('/api/posts').attach('images', await pngBuffer(), 'only.png');
    expect(res.status).toBe(201);
    expect(res.body.post.text).toBe('');
  });

  it('rejects a post with no text and no images', async () => {
    const { agent } = await createUser();
    const res = await createPost(agent, '   ');
    expect(res.status).toBe(400);
  });

  it('rejects text longer than 500 characters', async () => {
    const { agent } = await createUser();
    const res = await createPost(agent, 'a'.repeat(501));
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/500/);
  });

  it('rejects more than four images', async () => {
    const { agent } = await createUser();
    const image = await pngBuffer();
    let req = agent.post('/api/posts').field('text', 'too many');
    for (let i = 0; i < 5; i += 1) req = req.attach('images', image, `img${i}.png`);

    const res = await req;
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/up to 4 images/);
  });

  it('rejects files that are not images', async () => {
    const { agent } = await createUser();
    const res = await agent
      .post('/api/posts')
      .field('text', 'my notes')
      .attach('images', Buffer.from('just some text'), { filename: 'notes.txt', contentType: 'text/plain' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/JPG, PNG, WebP or GIF/);
  });

  it('rejects a file that claims to be an image but is not one', async () => {
    const { agent } = await createUser();
    const res = await agent
      .post('/api/posts')
      .field('text', 'sneaky')
      .attach('images', Buffer.from('<?php echo "hi"; ?>'), { filename: 'photo.png', contentType: 'image/png' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/could not be read as an image/);
  });
});

describe('reading and deleting posts', () => {
  it('returns a single post with the viewer\'s like state', async () => {
    const { agent } = await createUser();
    const { body } = await createPost(agent, 'hello');
    await agent.post(`/api/posts/${body.post._id}/like`);

    const res = await agent.get(`/api/posts/${body.post._id}`);
    expect(res.status).toBe(200);
    expect(res.body.post).toMatchObject({ text: 'hello', liked: true, likesCount: 1 });
  });

  it('returns 404 for a missing post and 400 for a malformed id', async () => {
    const { agent } = await createUser();
    expect((await agent.get('/api/posts/64b7f0c2a1b2c3d4e5f60718')).status).toBe(404);
    expect((await agent.get('/api/posts/not-an-id')).status).toBe(400);
  });

  it('lets the author delete a post along with its likes, comments, notifications and images', async () => {
    const { agent } = await createUser();
    const { agent: friend } = await createUser();
    const created = await agent.post('/api/posts').field('text', 'bye').attach('images', await pngBuffer(), 'a.png');
    const { _id, images } = created.body.post;
    await friend.post(`/api/posts/${_id}/like`);
    await friend.post(`/api/posts/${_id}/comments`).send({ text: 'nice' });

    const res = await agent.delete(`/api/posts/${_id}`);

    expect(res.status).toBe(204);
    expect((await agent.get(`/api/posts/${_id}`)).status).toBe(404);
    expect(await Like.countDocuments({ post: _id })).toBe(0);
    expect(await Comment.countDocuments({ post: _id })).toBe(0);
    expect(await Notification.countDocuments({ post: _id })).toBe(0);
    expect(fs.existsSync(uploadedFile(images[0].url))).toBe(false);
  });

  it("refuses to delete someone else's post", async () => {
    const { agent: author } = await createUser();
    const { agent: stranger } = await createUser();
    const { body } = await createPost(author, 'mine');

    const res = await stranger.delete(`/api/posts/${body.post._id}`);
    expect(res.status).toBe(403);
    expect((await author.get(`/api/posts/${body.post._id}`)).status).toBe(200);
  });
});
