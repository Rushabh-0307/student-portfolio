import express from 'express';

const app = express();
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

// In-memory storage
let tasks = [];
let nextId = 1;

// Route-specific middleware: validate task id parameter
function validateId(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id' });
  req.taskId = id;
  next();
}

const router = express.Router();

// GET /tasks -> return all tasks
router.get('/tasks', (req, res) => {
  res.json({ tasks });
});

// POST /tasks -> create a task
router.post('/tasks', (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const task = { id: nextId++, title, description: description || '', completed: false };
    tasks.push(task);
    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
});

// PUT /tasks/:id -> update a task
router.put('/tasks/:id', validateId, (req, res, next) => {
  try {
    const task = tasks.find((t) => t.id === req.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const { title, description, completed } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = !!completed;
    res.json({ task });
  } catch (err) {
    next(err);
  }
});

// DELETE /tasks/:id -> delete a task
router.delete('/tasks/:id', validateId, (req, res, next) => {
  try {
    const idx = tasks.findIndex((t) => t.id === req.taskId);
    if (idx === -1) return res.status(404).json({ error: 'Task not found' });
    const [deleted] = tasks.splice(idx, 1);
    res.json({ deleted });
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
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
