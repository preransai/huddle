const http = require('http');
const env = require('./config/env');
const { connectDB, disconnectDB, startMemoryServer } = require('./config/db');
const { initSocket, closeSocket } = require('./socket');
const createApp = require('./app');
const { seedDatabase, DEMO_PASSWORD } = require('./seed/seed');

async function resolveDatabase() {
  if (env.mongoUri) return { uri: env.mongoUri, inMemory: false };
  console.log('MONGODB_URI is not set, starting an in-memory MongoDB...');
  return { uri: await startMemoryServer(), inMemory: true };
}

async function start() {
  const { uri, inMemory } = await resolveDatabase();
  await connectDB(uri);

  if (inMemory) {
    const summary = await seedDatabase();
    console.log(
      `Using in-memory MongoDB: data is reset every time the server restarts.\n` +
        `Seeded ${summary.users} users and ${summary.posts} posts. ` +
        `Log in as ananya@example.com / ${DEMO_PASSWORD}`
    );
  } else {
    console.log('Connected to MongoDB');
  }

  const server = http.createServer(createApp());
  initSocket(server);
  server.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });

  const shutdown = async () => {
    closeSocket();
    server.close();
    await disconnectDB();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  console.error('Failed to start the server:', err);
  process.exit(1);
});
