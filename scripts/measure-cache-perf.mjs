import http from 'node:http';
import { performance } from 'node:perf_hooks';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// We will launch the actual server code or import app
// Let's import server.js dynamically or test with the server
import express from 'express';
import cors from 'cors';
import { Task } from '../models/Task.js';
import { getCacheStats, getCachedValue, invalidateCache, setCachedValue } from '../cache.js';
import { protect } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'student-portfolio-lab-secret';
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/student-portfolio';

async function runBenchmark() {
  await mongoose.connect(MONGO_URI);
  console.log('MongoDB connected');

  const app = express();
  app.use(cors());
  app.use(express.json());

  const token = jwt.sign({ id: 'test-user-perf', email: 'test@perf.com' }, JWT_SECRET, { expiresIn: '1h' });

  // Ensure test task exists
  await Task.deleteMany({ title: /^PerfTest/ });
  const testTask = await Task.create({
    title: 'PerfTest Task for Latency Benchmarking',
    description: 'Measuring cached vs uncached response times',
    priority: 'high',
    user: new mongoose.Types.ObjectId(),
  });

  app.get('/tasks', protect, async (req, res) => {
    const cacheKey = `tasks:all:${req.user.id}`;
    const cached = getCachedValue(cacheKey);
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.json({ tasks: cached });
    }
    const tasks = await Task.find({}).lean();
    setCachedValue(cacheKey, tasks);
    res.set('X-Cache', 'MISS');
    res.json({ tasks });
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(5099, resolve));
  console.log('Test server running on port 5099');

  const results = {
    uncached: [],
    cached: [],
  };

  // 1. Uncached runs (we invalidate cache before each)
  for (let i = 1; i <= 3; i++) {
    invalidateCache([`tasks:all:test-user-perf`]);
    const start = performance.now();
    const res = await fetch('http://127.0.0.1:5099/tasks', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const duration = performance.now() - start;
    const cacheHeader = res.headers.get('x-cache');
    results.uncached.push({ sample: i, durationMs: duration.toFixed(2), cacheHeader });
  }

  // 2. Cached runs (cache is primed by first call, then 3 consecutive cached calls)
  // Prime cache
  await fetch('http://127.0.0.1:5099/tasks', {
    headers: { Authorization: `Bearer ${token}` },
  });

  for (let i = 1; i <= 3; i++) {
    const start = performance.now();
    const res = await fetch('http://127.0.0.1:5099/tasks', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const duration = performance.now() - start;
    const cacheHeader = res.headers.get('x-cache');
    results.cached.push({ sample: i, durationMs: duration.toFixed(2), cacheHeader });
  }

  console.log('BENCHMARK_RESULTS:', JSON.stringify(results, null, 2));

  server.close();
  await Task.deleteOne({ _id: testTask._id });
  await mongoose.disconnect();
}

runBenchmark().catch(console.error);
