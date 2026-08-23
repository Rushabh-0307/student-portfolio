import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Task } from './models/Task.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Request logging middleware (global)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Reject POST/PUT without Content-Type: application/json
app.use((req, res, next) => {
  if ((req.method === 'POST' || req.method === 'PUT') && req.headers['content-type'] !== 'application/json') {
    return res.status(400).json({ error: 'Content-Type must be application/json' });
  }
  next();
});

// MongoDB Connection
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

// Route-specific middleware: validate task id parameter (MongoDB ObjectId)
function validateId(req, res, next) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  req.taskId = req.params.id;
  next();
}

const router = express.Router();

// GET /tasks -> return all tasks
router.get('/tasks', async (req, res, next) => {
  try {
    const tasks = await Task.find();
    res.json({ tasks });
  } catch (err) {
    next(err);
  }
});

// GET /task/:id -> return a single task by id
router.get('/task/:id', validateId, async (req, res, next) => {
  try {
    const task = await Task.findById(req.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ task });
  } catch (err) {
    next(err);
  }
});

// POST /tasks -> create a task
router.post('/tasks', async (req, res, next) => {
  try {
    const { title, description, priority } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const task = new Task({ title, description: description || '', priority: priority || 'medium' });
    await task.save();
    res.status(201).json({ task });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    next(err);
  }
});

// PUT /tasks/:id -> update a task
router.put('/tasks/:id', validateId, async (req, res, next) => {
  try {
    const task = await Task.findById(req.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const { title, description, completed, priority } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = !!completed;
    if (priority !== undefined) task.priority = priority;
    await task.save();
    res.json({ task });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ error: messages.join(', ') });
    }
    next(err);
  }
});

// DELETE /tasks/:id -> delete a task
router.delete('/tasks/:id', validateId, async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ deleted: task });
  } catch (err) {
    next(err);
  }
});

app.use('/', router);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Global error handler (must be last)
app.use((err, req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;

// Start server after connecting to MongoDB
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
