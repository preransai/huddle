const env = require('../config/env');
const { connectDB, disconnectDB } = require('../config/db');
const { seedDatabase, DEMO_PASSWORD } = require('./seed');

async function run() {
  if (!env.mongoUri) {
    console.log(
      'MONGODB_URI is not set. In zero-setup mode the dev server seeds its in-memory\n' +
        'database on every start, so there is nothing to do. Set MONGODB_URI in\n' +
        'server/.env to seed a real database.'
    );
    return;
  }

  await connectDB(env.mongoUri);
  console.log('Clearing existing data and seeding demo content...');
  const summary = await seedDatabase();
  console.log(
    `Done: ${summary.users} users, ${summary.posts} posts, ${summary.comments} comments, ` +
      `${summary.likes} likes, ${summary.follows} follows, ${summary.notifications} notifications.`
  );
  console.log(`Every demo account uses the password "${DEMO_PASSWORD}", e.g. ananya@example.com`);
}

run()
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
