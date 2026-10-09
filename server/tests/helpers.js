const fs = require('fs');
const mongoose = require('mongoose');
const request = require('supertest');
const sharp = require('sharp');
const createApp = require('../src/app');
const env = require('../src/config/env');

const app = createApp();
let counter = 0;

async function connectTestDb() {
  const dbName = `huddle_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await mongoose.connect(process.env.MONGO_TEST_URI, {
    dbName,
    // The driver loads `os` with a dynamic import(), which Jest's module
    // sandbox refuses without --experimental-vm-modules. Without it the
    // handshake metadata comes out empty and the server rejects the connection.
    runtimeAdapters: { os: require('os') },
  });
  // Build the unique indexes up front; the idempotency tests depend on them.
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
}

async function clearTestDb() {
  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((c) => c.deleteMany({})));
}

async function closeTestDb() {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  fs.rmSync(env.uploadDir, { recursive: true, force: true });
}

// Registers a fresh user and returns a supertest agent that keeps its cookie.
async function createUser(overrides = {}) {
  counter += 1;
  const details = {
    name: `Test User ${counter}`,
    username: `user${counter}`,
    email: `user${counter}@example.com`,
    password: 'password123',
    ...overrides,
  };
  const agent = request.agent(app);
  const res = await agent.post('/api/auth/register').send(details);
  if (res.status !== 201) throw new Error(`register failed: ${JSON.stringify(res.body)}`);
  return { agent, user: res.body.user, password: details.password };
}

function createPost(agent, text = 'Hello Huddle') {
  return agent.post('/api/posts').field('text', text);
}

function pngBuffer(width = 40, height = 30) {
  return sharp({ create: { width, height, channels: 3, background: '#0f766e' } }).png().toBuffer();
}

module.exports = {
  app,
  request,
  connectTestDb,
  clearTestDb,
  closeTestDb,
  createUser,
  createPost,
  pngBuffer,
};
