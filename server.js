import express from 'express';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import mongoSanitize from 'express-mongo-sanitize';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { getCacheStats, getCachedValue, invalidateCache, setCachedValue } from './cache.js';
import taskEvents from './events.js';
import { Task } from './models/Task.js';
import { User } from './models/User.js';
import { protect } from './middleware/auth.js';
import './listeners.js';
import aiRouter from './routes/ai.js';

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-me';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/auth/github/callback';
const githubOAuthStates = new Map();
const githubAuthCodes = new Map();

app.use(cors());
app.use(express.json());
// Prevent NoSQL query operator injection (A2)
app.use(mongoSanitize());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

app.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      return res.status(400).json({ error: 'Content-Type must be application/json' });
    }
  }
  next();
});

async function connectDB() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MongoDB connection error: Neither MONGO_URI nor MONGODB_URI is set.');
    process.exit(1);
  }
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
}

function validateId(req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  req.taskId = req.params.id;
  next();
}

function generateToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
}

function createTemporaryValue(store, value) {
  const key = crypto.randomBytes(32).toString('hex');
  store.set(key, { value, expiresAt: Date.now() + 10 * 60 * 1000 });
  return key;
}

function consumeTemporaryValue(store, key) {
  const entry = store.get(key);
  store.delete(key);
  if (!entry || entry.expiresAt < Date.now()) return null;
  return entry.value;
}

// protect middleware imported from ./middleware/auth.js (P7)

function validateTaskPayload(req, res, next) {
  const { title, description, priority, completed } = req.body || {};

  if (req.method === 'POST' && (!title || !String(title).trim())) {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (title !== undefined && (!String(title).trim())) {
    return res.status(400).json({ error: 'Title cannot be empty' });
  }

  if (description !== undefined && typeof description !== 'string') {
    return res.status(400).json({ error: 'Description must be a string' });
  }

  if (priority !== undefined && !['low', 'medium', 'high'].includes(priority)) {
    return res.status(400).json({ error: 'Priority must be low, medium, or high' });
  }

  if (completed !== undefined && typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'Completed must be a boolean' });
  }

  next();
}

const CACHE_ENABLED = process.env.CACHE_ENABLED !== 'false';

function allTasksCacheKey(userId) {
  return `tasks:all:${userId || 'global'}`;
}

function taskCacheKey(taskId) {
  return `tasks:${taskId}`;
}

function clearTaskCaches(taskId, userId) {
  const keys = [taskCacheKey(taskId), 'tasks:all'];
  if (userId) keys.push(allTasksCacheKey(userId));
  invalidateCache(keys);
}

const router = express.Router();

app.get('/auth/github', (req, res) => {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    return res.status(503).json({ error: 'GitHub authentication is not configured' });
  }

  const state = createTemporaryValue(githubOAuthStates, {
    redirect: typeof req.query.redirect === 'string' && req.query.redirect.startsWith('/') ? req.query.redirect : '/projects',
  });
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_CALLBACK_URL,
    scope: 'read:user user:email',
    state,
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

app.get('/auth/github/callback', async (req, res) => {
  const { code, state, error } = req.query;
  const stateData = typeof state === 'string' ? consumeTemporaryValue(githubOAuthStates, state) : null;

  if (error || !code || !stateData) {
    return res.redirect(`${FRONTEND_URL}/projects?github_error=${encodeURIComponent(error || 'Invalid GitHub authorization request')}`);
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_CALLBACK_URL,
      }),
    });
    const tokenBody = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenBody.access_token) {
      throw new Error('GitHub token exchange failed');
    }

    const githubHeaders = {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${tokenBody.access_token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    };
    const profileResponse = await fetch('https://api.github.com/user', { headers: githubHeaders });
    const profile = await profileResponse.json();
    if (!profileResponse.ok || !profile.id || !profile.login) {
      throw new Error('GitHub profile lookup failed');
    }

    const emailsResponse = await fetch('https://api.github.com/user/emails', { headers: githubHeaders });
    const emails = await emailsResponse.json();
    const primaryEmail = Array.isArray(emails)
      ? emails.find((item) => item.primary && item.verified)?.email
      : null;
    const email = String(primaryEmail || profile.email || `${profile.login}@users.noreply.github.com`).toLowerCase();

    let user = await User.findOne({ githubId: String(profile.id) });
    if (!user) user = await User.findOne({ email });
    if (user) {
      user.githubId = String(profile.id);
      user.githubLogin = profile.login;
      if (!user.email) user.email = email;
      await user.save();
    } else {
      user = await User.create({ email, githubId: String(profile.id), githubLogin: profile.login });
    }

    const authCode = createTemporaryValue(githubAuthCodes, generateToken(user));
    res.redirect(`${FRONTEND_URL}${stateData.redirect}?github_code=${encodeURIComponent(authCode)}`);
  } catch (err) {
    console.error('GitHub authentication error:', err);
    res.redirect(`${FRONTEND_URL}/projects?github_error=GitHub%20authentication%20failed`);
  }
});

router.post('/auth/github/exchange', (req, res) => {
  const token = consumeTemporaryValue(githubAuthCodes, req.body?.code);
  if (!token) return res.status(401).json({ error: 'GitHub authorization code is invalid or expired' });
  res.json({ token });
});

router.post('/register', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email: normalizedEmail, password: hashedPassword });
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { _id: user._id, email: user.email },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = user.password ? await bcrypt.compare(String(password), user.password) : false;
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.json({
      message: 'Login successful',
      token,
      user: { _id: user._id, email: user.email },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: { _id: user._id, email: user.email } });
  } catch (err) {
    next(err);
  }
});

router.use(protect);

router.get('/tasks', async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const cacheKey = allTasksCacheKey(userId);

    if (CACHE_ENABLED) {
      const cachedTasks = getCachedValue(cacheKey);
      if (cachedTasks) {
        res.set('X-Cache', 'HIT');
        return res.json({ tasks: cachedTasks });
      }
    }

    // Return tasks belonging to this user, plus existing tasks with no owner (P7 multi-user)
    const filter = userId
      ? { $or: [{ user: userId }, { user: { $exists: false } }, { user: null }] }
      : {};
    const tasks = await Task.find(filter).sort({ createdAt: -1 }).lean();

    if (CACHE_ENABLED) {
      setCachedValue(cacheKey, tasks);
    }
    res.set('X-Cache', 'MISS');
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
});

router.get(['/tasks/:id', '/task/:id'], validateId, async (req, res, next) => {
  try {
    const cacheKey = taskCacheKey(req.taskId);
    if (CACHE_ENABLED) {
      const cachedTask = getCachedValue(cacheKey);
      if (cachedTask) {
        res.set('X-Cache', 'HIT');
        return res.json({ task: cachedTask });
      }
    }

    const task = await Task.findById(req.taskId).lean();
    if (!task) return res.status(404).json({ error: 'Task not found' });
    if (CACHE_ENABLED) {
      setCachedValue(cacheKey, task);
    }
    res.set('X-Cache', 'MISS');
    res.json({ task });
  } catch (err) {
    next(err);
  }
});

router.post('/tasks', validateTaskPayload, async (req, res, next) => {
  try {
    const { title, description, priority } = req.body;
    const task = new Task({
      title: String(title).trim(),
      description: description ? String(description).trim() : '',
      priority: priority || 'medium',
      user: req.user?.id || req.user?._id, // Link task to authenticated user (P7)
    });
    await task.save();
    clearTaskCaches(task._id.toString(), req.user?.id);
    res.status(201).json({ task });
    console.log(`[API] Response sent at ${new Date().toISOString()} for task "${task.title}"`);
    taskEvents.emit('task-created', {
      task: task.toObject(),
      assignedUser: req.user.email || req.user.id,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    next(err);
  }
});

router.put('/tasks/:id', validateId, validateTaskPayload, async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = String(title).trim();
    if (description !== undefined) updateData.description = String(description).trim();
    if (completed !== undefined) updateData.completed = Boolean(completed);
    if (priority !== undefined) updateData.priority = priority;

    const task = await Task.findByIdAndUpdate(req.taskId, updateData, {
      new: true,
      runValidators: true,
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    clearTaskCaches(task._id.toString(), req.user?.id);
    res.json({ task });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    next(err);
  }
});

router.get(['/cache-stats', '/debug/cache-stats'], (_req, res) => {
  res.json(getCacheStats());
});

router.delete('/tasks/:id', validateId, async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    clearTaskCaches(req.taskId, req.user?.id);
    res.json({ deleted: task });
    console.log(`[API] Response sent at ${new Date().toISOString()} for deleted task "${task.title}"`);
    taskEvents.emit('task-deleted', {
      task: task.toObject(),
      assignedUser: req.user.email || req.user.id,
    });
  } catch (err) {
    next(err);
  }
});

// P13 – AI API Integration (behind auth middleware via router)
app.use('/api/ai', protect, aiRouter);

app.use('/', router);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler as the LAST middleware (P4, P5)
// Converts Mongoose ValidationError into structured JSON (400) and prevents stack trace leakage
app.use((err, req, res, _next) => {
  console.error('[ServerError]', err.stack || err.message);

  if (err.name === 'ValidationError') {
    const details = Object.keys(err.errors || {}).map((field) => ({
      field,
      message: err.errors[field].message,
    }));
    return res.status(400).json({
      error: 'Validation failed',
      details,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` });
  }

  res.status(err.status || 500).json({ error: 'Something went wrong' });
});

// Export app for testing (P12 CI/CD)
export { app, connectDB };

const PORT = process.env.PORT || 5000;

// Only start the server when this file is run directly, not when imported by tests
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    // Optional HTTPS server on port 5443 (A2)
    const HTTPS_PORT = process.env.HTTPS_PORT || 5443;
    const certPath = path.resolve('localhost.pem');
    const keyPath = path.resolve('localhost-key.pem');

    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      try {
        const httpsOptions = {
          key: fs.readFileSync(keyPath),
          cert: fs.readFileSync(certPath),
        };
        https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
          console.log(`Optional HTTPS server running on port ${HTTPS_PORT}`);
        });
      } catch (httpsErr) {
        console.warn(`[HTTPS] Failed to bind HTTPS server: ${httpsErr.message}`);
      }
    } else {
      // Certs not present; HTTP server continues uninterrupted
    }
  });
}
