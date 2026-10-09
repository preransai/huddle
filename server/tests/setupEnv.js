const os = require('os');
const path = require('path');

// Runs before any app module is loaded, so config/env.js picks these up.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.UPLOAD_DIR = path.join(os.tmpdir(), 'huddle-test-uploads');
