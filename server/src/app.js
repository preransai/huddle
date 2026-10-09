const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Seeded demo content uses these hosts for avatars and photos.
const IMAGE_HOSTS = ['https://randomuser.me', 'https://picsum.photos', 'https://fastly.picsum.photos'];

function createApp() {
  const app = express();

  if (env.isProduction) app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          'img-src': ["'self'", 'data:', 'blob:', ...IMAGE_HOSTS],
          'connect-src': ["'self'", 'ws:', 'wss:'],
          // Helmet adds this by default. Over plain http on a LAN address the
          // browser would rewrite every asset to https and the page stays blank,
          // so only send it in production, where the app sits behind HTTPS.
          'upgrade-insecure-requests': env.isProduction ? [] : null,
        },
      },
    })
  );
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  if (!env.isTest) app.use(morgan(env.isProduction ? 'combined' : 'dev'));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.use(
    '/uploads',
    express.static(env.uploadDir, { maxAge: '30d', immutable: true, fallthrough: false })
  );

  app.get('/api/health', (req, res) => res.json({ ok: true }));
  app.use('/api', routes);
  app.use('/api', notFound);

  // When the client has been built, Express serves it too, so the whole app
  // deploys as one service. Any non-API GET falls back to index.html and React
  // Router takes over from there.
  const indexHtml = path.join(env.clientDist, 'index.html');
  if (!env.isTest && fs.existsSync(indexHtml)) {
    app.use(express.static(env.clientDist, { index: false }));
    app.get(/^\/(?!api\/|uploads\/|socket\.io\/).*/, (req, res) => res.sendFile(indexHtml));
  }

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = createApp;
