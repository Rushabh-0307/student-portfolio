import http from 'node:http';
import { performance } from 'node:perf_hooks';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { getCacheStats, getCachedValue, invalidateCache, setCachedValue } from '../cache.js';
import { protect } from '../middleware/auth.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/student-portfolio';
const JWT_SECRET = process.env.JWT_SECRET || 'student-portfolio-lab-secret';

async function runScenario({ cacheEnabled, totalRequests, concurrency }) {
  const benchmarkEmail = 'loadtest-user@benchmark.local';
  let user = await User.findOne({ email: benchmarkEmail });
  const token = jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '1h' });

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/tasks', protect, async (req, res) => {
    const cacheKey = `tasks:all:${req.user.id}`;
    if (cacheEnabled) {
      const cached = getCachedValue(cacheKey);
      if (cached) {
        res.set('X-Cache', 'HIT');
        return res.json({ tasks: cached });
      }
    }

    const tasks = await Task.find({ user: req.user.id }).lean();
    if (cacheEnabled) {
      setCachedValue(cacheKey, tasks);
    }
    res.set('X-Cache', 'MISS');
    res.json({ tasks });
  });

  const port = 5088;
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(port, resolve));

  // If caching enabled, prime the cache with 1 warm-up request
  if (cacheEnabled) {
    await fetch(`http://127.0.0.1:${port}/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } else {
    invalidateCache([`tasks:all:${user._id.toString()}`]);
  }

  let completed = 0;
  let failed = 0;
  const latencies = [];
  const overallStart = performance.now();

  async function worker() {
    while (completed < totalRequests) {
      const idx = completed++;
      if (idx >= totalRequests) break;

      const reqStart = performance.now();
      try {
        const res = await fetch(`http://127.0.0.1:${port}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) failed++;
        latencies.push(performance.now() - reqStart);
      } catch {
        failed++;
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  const totalTimeSec = (performance.now() - overallStart) / 1000;
  const rps = (totalRequests / totalTimeSec).toFixed(2);
  const meanLatency = (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(2);

  server.close();
  return {
    cacheEnabled,
    totalRequests,
    concurrency,
    totalTimeSec: totalTimeSec.toFixed(3),
    rps,
    meanLatencyMs: meanLatency,
    failed,
  };
}

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Running load tests on 60 seeded tasks...');

  const t1 = await runScenario({ cacheEnabled: false, totalRequests: 200, concurrency: 10 });
  console.log('Test 1 (Cache OFF, c=10):', t1);

  const t2 = await runScenario({ cacheEnabled: true, totalRequests: 200, concurrency: 10 });
  console.log('Test 2 (Cache ON,  c=10):', t2);

  const t3 = await runScenario({ cacheEnabled: true, totalRequests: 200, concurrency: 50 });
  console.log('Test 3 (Cache ON,  c=50):', t3);

  await mongoose.disconnect();
}

main().catch(console.error);
