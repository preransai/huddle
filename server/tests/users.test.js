const { connectTestDb, clearTestDb, closeTestDb, createUser, createPost, pngBuffer } = require('./helpers');

beforeAll(connectTestDb);
afterEach(clearTestDb);
afterAll(closeTestDb);

describe('following', () => {
  it('updates both counts on follow and unfollow', async () => {
    const me = await createUser();
    const them = await createUser();

    const follow = await me.agent.post(`/api/users/${them.user._id}/follow`);
    expect(follow.body).toEqual({ isFollowing: true, followersCount: 1 });
    expect((await me.agent.get('/api/auth/me')).body.user.followingCount).toBe(1);

    const unfollow = await me.agent.delete(`/api/users/${them.user._id}/follow`);
    expect(unfollow.body).toEqual({ isFollowing: false, followersCount: 0 });
    expect((await me.agent.get('/api/auth/me')).body.user.followingCount).toBe(0);
  });

  it('is idempotent', async () => {
    const me = await createUser();
    const them = await createUser();
    await me.agent.post(`/api/users/${them.user._id}/follow`);
    const again = await me.agent.post(`/api/users/${them.user._id}/follow`);
    expect(again.body.followersCount).toBe(1);
  });

  it("doesn't let you follow yourself", async () => {
    const me = await createUser();
    const res = await me.agent.post(`/api/users/${me.user._id}/follow`);
    expect(res.status).toBe(400);
  });

  it('returns 404 for an unknown user', async () => {
    const me = await createUser();
    const res = await me.agent.post('/api/users/64b7f0c2a1b2c3d4e5f60718/follow');
    expect(res.status).toBe(404);
  });

  it('lists followers and following', async () => {
    const a = await createUser();
    const b = await createUser();
    const c = await createUser();
    await b.agent.post(`/api/users/${a.user._id}/follow`);
    await c.agent.post(`/api/users/${a.user._id}/follow`);
    await a.agent.post(`/api/users/${c.user._id}/follow`);

    const followers = await a.agent.get(`/api/users/${a.user._id}/followers`);
    const following = await a.agent.get(`/api/users/${a.user._id}/following`);

    expect(followers.body.users.map((u) => u.username)).toEqual([c.user.username, b.user.username]);
    expect(followers.body.users.find((u) => u._id === c.user._id).isFollowing).toBe(true);
    expect(following.body.users.map((u) => u.username)).toEqual([c.user.username]);
  });
});

describe('profiles', () => {
  it('returns a public profile with counts and follow state, but no private fields', async () => {
    const me = await createUser();
    const them = await createUser({ username: 'meera' });
    await createPost(them.agent, 'first');
    await me.agent.post(`/api/users/${them.user._id}/follow`);

    const res = await me.agent.get('/api/users/Meera');
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ username: 'meera', postsCount: 1, followersCount: 1, isFollowing: true });
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.email).toBeUndefined();
  });

  it('returns 404 for an unknown username', async () => {
    const me = await createUser();
    expect((await me.agent.get('/api/users/nobody_here')).status).toBe(404);
  });

  it('updates profile fields and normalises the website', async () => {
    const me = await createUser();
    const res = await me.agent
      .patch('/api/users/me')
      .field('bio', 'Third year CSE')
      .field('location', 'Chennai')
      .field('website', 'ananya.dev');

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ bio: 'Third year CSE', location: 'Chennai', website: 'https://ananya.dev' });
    expect(res.body.user.password).toBeUndefined();
  });

  it('uploads an avatar and a cover image', async () => {
    const me = await createUser();
    const res = await me.agent
      .patch('/api/users/me')
      .attach('avatar', await pngBuffer(800, 800), 'me.png')
      .attach('cover', await pngBuffer(3000, 1000), 'cover.png');

    expect(res.status).toBe(200);
    expect(res.body.user.avatar).toMatch(/^\/uploads\/.+\.webp$/);
    expect(res.body.user.cover).toMatch(/^\/uploads\/.+\.webp$/);
  });

  it('rejects an invalid website and an overlong bio', async () => {
    const me = await createUser();
    const website = await me.agent.patch('/api/users/me').field('website', 'not a url');
    const bio = await me.agent.patch('/api/users/me').field('bio', 'b'.repeat(161));
    expect(website.status).toBe(400);
    expect(bio.status).toBe(400);
  });

  it('rejects a non-image avatar', async () => {
    const me = await createUser();
    const res = await me.agent
      .patch('/api/users/me')
      .attach('avatar', Buffer.from('%PDF-1.4'), { filename: 'cv.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(400);
  });
});

describe('discovery', () => {
  it('searches people by username or name, prefix matches first', async () => {
    const me = await createUser();
    await createUser({ username: 'priya_n', name: 'Priya Nair' });
    await createUser({ username: 'supriya', name: 'Supriya Das' });
    await createUser({ username: 'rohan', name: 'Rohan Mehta' });

    const res = await me.agent.get('/api/users/search').query({ q: 'priya' });
    expect(res.body.users.map((u) => u.username)).toEqual(['priya_n', 'supriya']);
  });

  it("treats search input as text, not as a regex", async () => {
    const me = await createUser();
    const res = await me.agent.get('/api/users/search').query({ q: '.*' });
    expect(res.status).toBe(200);
    expect(res.body.users).toEqual([]);
  });

  it('suggests people I do not follow yet, never myself', async () => {
    const me = await createUser();
    const followed = await createUser();
    const other = await createUser();
    await me.agent.post(`/api/users/${followed.user._id}/follow`);

    const res = await me.agent.get('/api/users/suggestions');
    const ids = res.body.users.map((u) => u._id);
    expect(ids).toEqual([other.user._id]);
  });
});
