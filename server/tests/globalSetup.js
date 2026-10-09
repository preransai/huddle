const { MongoMemoryServer } = require('mongodb-memory-server');

// One mongod for the whole run; each test file uses its own database on it.
module.exports = async function globalSetup() {
  const mongod = await MongoMemoryServer.create();
  globalThis.__MONGOD__ = mongod;
  process.env.MONGO_TEST_URI = mongod.getUri();
};
