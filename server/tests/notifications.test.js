const http = require('http');
const { io: connectClient } = require('socket.io-client');
const Notification = require('../src/models/Notification');
const { initSocket, closeSocket } = require('../src/socket');
const { app, request, connectTestDb, clearTestDb, closeTestDb, createUser, createPost } = require('./helpers');

beforeAll(connectTestDb);
afterEach(clearTestDb);
afterAll(closeTestDb);

const notificationsFor = (user, filter = {}) => Notification.find({ recipient: user._id, ...filter }).lean();

describe('notification rules', () => {
  it('notifies the author when someone likes their post, but not for their own like', async () => {
    const author = await createUser();
    const fan = await createUser();
    const post = (await createPost(author.agent, 'hello')).body.post;

    await author.agent.post(`/api/posts/${post._id}/like`);
    expect(await notificationsFor(author.user)).toHaveLength(0);

    await fan.agent.post(`/api/posts/${post._id}/like`);
    const [notification] = await notificationsFor(author.user);
    expect(notification).toMatchObject({ type: 'like', read: false });
    expect(String(notification.actor)).toBe(fan.user._id);
  });

  it('does not create duplicate like notifications when a like is toggled quickly', async () => {
    const author = await createUser();
    const fan = await createUser();
    const post = (await createPost(author.agent, 'hello')).body.post;

    for (let i = 0; i < 3; i += 1) {
      await fan.agent.post(`/api/posts/${post._id}/like`);
      await fan.agent.delete(`/api/posts/${post._id}/like`);
    }
    await fan.agent.post(`/api/posts/${post._id}/like`);

    expect(await notificationsFor(author.user, { type: 'like' })).toHaveLength(1);
  });

  it('notifies on comments from others only', async () => {
    const author = await createUser();
    const friend = await createUser();
    const post = (await createPost(author.agent, 'hello')).body.post;

    await author.agent.post(`/api/posts/${post._id}/comments`).send({ text: 'replying to myself' });
    await friend.agent.post(`/api/posts/${post._id}/comments`).send({ text: 'nice one' });

    const notifications = await notificationsFor(author.user);
    expect(notifications).toHaveLength(1);
    expect(notifications[0]).toMatchObject({ type: 'comment' });
  });

  it('notifies on follow, once, even after unfollowing and following again', async () => {
    const me = await createUser();
    const them = await createUser();

    await me.agent.post(`/api/users/${them.user._id}/follow`);
    await me.agent.delete(`/api/users/${them.user._id}/follow`);
    await me.agent.post(`/api/users/${them.user._id}/follow`);

    expect(await notificationsFor(them.user, { type: 'follow' })).toHaveLength(1);
  });

  it('notifies people mentioned in a post, except the author mentioning themselves', async () => {
    const author = await createUser({ username: 'kabir' });
    const priya = await createUser({ username: 'priya' });
    await createPost(author.agent, 'Thanks @priya and @kabir and @ghost_user for the demo help');

    expect(await notificationsFor(priya.user, { type: 'mention' })).toHaveLength(1);
    expect(await notificationsFor(author.user)).toHaveLength(0);
  });

  it('mentions in a comment notify the mentioned user, and the post author gets one comment notification', async () => {
    const author = await createUser({ username: 'meera' });
    const commenter = await createUser();
    const friend = await createUser({ username: 'sofia' });
    const post = (await createPost(author.agent, 'Hampi trip!')).body.post;

    await commenter.agent
      .post(`/api/posts/${post._id}/comments`)
      .send({ text: '@sofia you have to see this. @meera take us next time' });

    expect(await notificationsFor(friend.user, { type: 'mention' })).toHaveLength(1);
    const authorNotifications = await notificationsFor(author.user);
    expect(authorNotifications.map((n) => n.type)).toEqual(['comment']);
  });
});

describe('notification endpoints', () => {
  it('lists my notifications with the actor and post, newest first', async () => {
    const author = await createUser();
    const fan = await createUser();
    const post = (await createPost(author.agent, 'hello')).body.post;
    await fan.agent.post(`/api/posts/${post._id}/like`);
    await fan.agent.post(`/api/users/${author.user._id}/follow`);

    const res = await author.agent.get('/api/notifications');
    expect(res.body.notifications.map((n) => n.type)).toEqual(['follow', 'like']);
    expect(res.body.notifications[1].actor).toMatchObject({ username: fan.user.username });
    expect(res.body.notifications[1].actor.password).toBeUndefined();
    expect(res.body.notifications[1].post).toMatchObject({ text: 'hello' });

    const fanView = await fan.agent.get('/api/notifications');
    expect(fanView.body.notifications).toHaveLength(0);
  });

  it('tracks the unread count and marks everything as read', async () => {
    const author = await createUser();
    const fan = await createUser();
    await fan.agent.post(`/api/users/${author.user._id}/follow`);
    await createPost(fan.agent, `hi @${author.user.username}`);

    expect((await author.agent.get('/api/notifications/unread-count')).body.count).toBe(2);
    const res = await author.agent.post('/api/notifications/read-all');
    expect(res.body.updated).toBe(2);
    expect((await author.agent.get('/api/notifications/unread-count')).body.count).toBe(0);
  });
});

describe('real-time delivery', () => {
  let server;
  let url;
  const sockets = [];

  beforeAll(async () => {
    server = http.createServer(app);
    initSocket(server);
    await new Promise((resolve) => server.listen(0, resolve));
    url = `http://localhost:${server.address().port}`;
  });

  afterEach(() => {
    sockets.splice(0).forEach((socket) => socket.disconnect());
  });

  afterAll(async () => {
    closeSocket();
    await new Promise((resolve) => server.close(resolve));
  });

  async function sessionCookie(username, password) {
    const res = await request(app).post('/api/auth/login').send({ identifier: username, password });
    return res.headers['set-cookie'][0].split(';')[0];
  }

  function connect(cookie) {
    const socket = connectClient(url, {
      transports: ['websocket'],
      extraHeaders: cookie ? { Cookie: cookie } : {},
      reconnection: false,
    });
    sockets.push(socket);
    return socket;
  }

  it('refuses a socket connection without a valid session cookie', async () => {
    const socket = connect('huddle_token=forged');
    const error = await new Promise((resolve) => socket.on('connect_error', resolve));
    expect(error.message).toBe('unauthorized');
  });

  it("pushes a new notification to the recipient's room as it happens", async () => {
    const author = await createUser();
    const fan = await createUser();
    const post = (await createPost(author.agent, 'live test')).body.post;

    const socket = connect(await sessionCookie(author.user.username, author.password));
    await new Promise((resolve) => socket.on('connect', resolve));

    const received = new Promise((resolve) => socket.on('notification:new', resolve));
    await fan.agent.post(`/api/posts/${post._id}/like`);

    const notification = await received;
    expect(notification).toMatchObject({ type: 'like', actor: { username: fan.user.username } });
    expect(notification.post).toMatchObject({ text: 'live test' });
  });
});
