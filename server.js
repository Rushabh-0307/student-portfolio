import express from 'express';
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
import './listeners.js';

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-me';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const GITHUB_CALLBACK_URL = process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/auth/github/callback';
const githubOAuthStates = new Map();
const githubAuthCodes = new Map();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

app.use((req, res, next) => {
  if ((req.method === 'POST' || req.method === 'PUT') && req.headers['content-type'] !== 'application/json') {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }
  next();
});

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
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

function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ error: 'Authorization token missing' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

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

const ALL_TASKS_CACHE_KEY = 'tasks:all';

function taskCacheKey(taskId) {
  return `tasks:${taskId}`;
}

function clearTaskCaches(taskId) {
  invalidateCache([ALL_TASKS_CACHE_KEY, taskCacheKey(taskId)]);
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

    const user = await User.findOne({ email: normalizedEmail });
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
    const cachedTasks = getCachedValue(ALL_TASKS_CACHE_KEY);
    if (cachedTasks) {
      res.set('X-Cache', 'HIT');
      return res.json({ tasks: cachedTasks });
    }

    const tasks = await Task.find().lean();
    setCachedValue(ALL_TASKS_CACHE_KEY, tasks);
    res.set('X-Cache', 'MISS');
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
});

router.get('/task/:id', validateId, async (req, res, next) => {
  try {
    const cacheKey = taskCacheKey(req.taskId);
    const cachedTask = getCachedValue(cacheKey);
    if (cachedTask) {
      res.set('X-Cache', 'HIT');
      return res.json({ task: cachedTask });
    }

    const task = await Task.findById(req.taskId).lean();
    if (!task) return res.status(404).json({ error: 'Task not found' });
    setCachedValue(cacheKey, task);
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
    });
    await task.save();
    clearTaskCaches(task._id.toString());
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
    const task = await Task.findById(req.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const { title, description, completed, priority } = req.body;

    if (title !== undefined) task.title = String(title).trim();
    if (description !== undefined) task.description = String(description).trim();
    if (completed !== undefined) task.completed = Boolean(completed);
    if (priority !== undefined) task.priority = priority;

    await task.save();
    clearTaskCaches(task._id.toString());
    res.json({ task });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    next(err);
  }
});

router.get('/cache-stats', (_req, res) => {
  res.json(getCacheStats());
});

router.delete('/tasks/:id', validateId, async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    clearTaskCaches(req.taskId);
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

app.use('/', router);

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
