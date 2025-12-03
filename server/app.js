require('dotenv').config();
const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const helmet = require('helmet');
const router = require('./router.js');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redis = require('redis');

const port = process.env.PORT || process.env.NODE_PORT || 3000;
const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/AnimeTracker';

// --- Redis Setup ---
const redisClient = redis.createClient({
  url: process.env.REDISCLOUD_URL,
});

redisClient.on('error', (err) => console.error('Redis Client Error:', err));

// --- MongoDB Setup ---
mongoose.connect(dbURI).catch((err) => {
  console.error('Could not connect to MongoDB:', err);
  throw err;
});

mongoose.connection.once('open', () => {
  console.log(`Connected to MongoDB at ${dbURI}`);
});

// --- Connect to Redis, then start the server ---
redisClient.connect().then(() => {
  console.log('Connected to Redis Cloud');

  const app = express();

  // --- Middleware ---
  app.use(helmet());
  app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted`)));
  app.use(favicon(`${__dirname}/../hosted/img/favicon.png`));
  app.use(compression());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // --- Session Setup using Redis ---
  app.use(session({
    key: 'sessionid',
    store: new RedisStore({
      client: redisClient,
      prefix: 'session:',
    }),
    secret: process.env.SESSION_SECRET || 'AnimeTrackerSessionSecret',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true },
  }));

  // --- View Engine ---
  app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '' }));
  app.set('view engine', 'handlebars');
  app.set('views', `${__dirname}/../views`);

  // --- Routes ---
  router(app);

  // --- Start Server ---
  app.listen(port, (err) => {
    if (err) throw err;
    console.log(`Listening on port ${port}`);
  });
}).catch((err) => {
  console.error('Failed to connect to Redis:', err);
});
