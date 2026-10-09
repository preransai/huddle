const User = require('../src/models/User');
const { app, request, connectTestDb, clearTestDb, closeTestDb, createUser } = require('./helpers');

beforeAll(connectTestDb);
afterEach(clearTestDb);
afterAll(closeTestDb);

const valid = {
  name: 'Ananya Iyer',
  username: 'ananya',
  email: 'ananya@example.com',
  password: 'password123',
};

describe('POST /api/auth/register', () => {
  it('creates the account and sets an httpOnly session cookie', async () => {
    const res = await request(app).post('/api/auth/register').send(valid);

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({ name: 'Ananya Iyer', username: 'ananya', email: 'ananya@example.com' });
    const cookie = res.headers['set-cookie'].join(';');
    expect(cookie).toMatch(/huddle_token=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
  });

  it('stores a bcrypt hash and never sends the password back', async () => {
    const res = await request(app).post('/api/auth/register').send(valid);

    expect(res.body.user.password).toBeUndefined();
    const stored = await User.findOne({ username: 'ananya' }).select('+password');
    expect(stored.password).not.toBe(valid.password);
    expect(stored.password).toMatch(/^\$2[aby]\$/);
  });

  it('returns field errors for missing or invalid input', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: '', username: 'ok_name', email: 'not-an-email', password: 'short' });

    expect(res.status).toBe(400);
    const fields = res.body.errors.map((e) => e.field);
    expect(fields).toEqual(expect.arrayContaining(['name', 'email', 'password']));
  });

  it.each(['ab', '1starts_with_digit', 'has space', 'dash-name', 'waytoolongusername_123'])(
    'rejects the username "%s"',
    async (username) => {
      const res = await request(app).post('/api/auth/register').send({ ...valid, username });
      expect(res.status).toBe(400);
      expect(res.body.errors[0].field).toBe('username');
    }
  );

  it('rejects usernames that clash with app routes', async () => {
    const res = await request(app).post('/api/auth/register').send({ ...valid, username: 'explore' });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/reserved/i);
  });

  it('rejects a duplicate username', async () => {
    await createUser({ username: 'ananya' });
    const res = await request(app).post('/api/auth/register').send(valid);

    expect(res.status).toBe(409);
    expect(res.body.errors[0].field).toBe('username');
  });

  it('rejects a duplicate email regardless of case', async () => {
    await createUser({ email: 'ananya@example.com' });
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...valid, username: 'someone_else', email: 'Ananya@Example.com' });

    expect(res.status).toBe(409);
    expect(res.body.errors[0].field).toBe('email');
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(() => createUser({ username: 'ananya', email: 'ananya@example.com', password: 'password123' }));

  it('logs in with the email address', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'ananya@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('ananya');
    expect(res.body.user.password).toBeUndefined();
    expect(res.headers['set-cookie'].join(';')).toMatch(/huddle_token=/);
  });

  it('logs in with the username too', async () => {
    const res = await request(app).post('/api/auth/login').send({ identifier: '@Ananya', password: 'password123' });
    expect(res.status).toBe(200);
  });

  it('uses the same message for a wrong password and an unknown account', async () => {
    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'ananya@example.com', password: 'nope-nope' });
    const unknown = await request(app)
      .post('/api/auth/login')
      .send({ identifier: 'ghost@example.com', password: 'password123' });

    expect(wrongPassword.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect(wrongPassword.body.message).toBe(unknown.body.message);
  });
});

describe('session', () => {
  it('GET /me returns the logged-in user', async () => {
    const { agent, user } = await createUser();
    const res = await agent.get('/api/auth/me');

    expect(res.status).toBe(200);
    expect(res.body.user._id).toBe(user._id);
    expect(res.body.user.password).toBeUndefined();
  });

  it('GET /me returns null for a guest instead of an error', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(200);
    expect(res.body.user).toBeNull();
  });

  it('ignores a tampered token', async () => {
    const res = await request(app).get('/api/auth/me').set('Cookie', 'huddle_token=not.a.real.token');
    expect(res.body.user).toBeNull();
  });

  it('logout clears the cookie so later requests are anonymous', async () => {
    const { agent } = await createUser();
    const logout = await agent.post('/api/auth/logout');
    expect(logout.status).toBe(204);

    const me = await agent.get('/api/auth/me');
    expect(me.body.user).toBeNull();
  });

  it('protects the rest of the API', async () => {
    const res = await request(app).get('/api/posts/feed');
    expect(res.status).toBe(401);
  });
});
