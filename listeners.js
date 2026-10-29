import taskEvents from './events.js';

const NOTIFICATION_DELAY_MS = 2000;

// Task Events Listener Registry (P10)
// Architectural note: Node.js EventEmitter calls registered listeners synchronously
// on the current turn of the event loop. The non-blocking behavior of the HTTP response
// is achieved because the route handler sends the response (res.status(201).json(...))
// BEFORE emitting the event, and asynchronous tasks inside the listener (like timers or DB writes)
// are scheduled onto subsequent turns of the libuv event loop.

taskEvents.on('task-created', async ({ task, assignedUser }) => {
  try {
    const startedAt = new Date().toISOString();
    console.log(
      `[Notification] Task "${task.title}" handler started at ${startedAt} (assigned user: ${assignedUser})`,
    );

    const delay = Number(process.env.NOTIFICATION_DELAY_MS) || NOTIFICATION_DELAY_MS;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const completedAt = new Date().toISOString();
    console.log(
      `[Notification] Task "${task.title}" notification completed at ${completedAt} (assigned user: ${assignedUser})`,
    );
  } catch (err) {
    // Robust error handling to guarantee listener failures never crash the server process
    console.error(`[Notification] Handler error for task "${task?.title}": ${err.message}`);
  }
});

taskEvents.on('task-deleted', ({ task, assignedUser }) => {
  try {
    const timestamp = new Date().toISOString();
    console.log(
      `[Notification] Task "${task.title}" deleted at ${timestamp} (assigned user: ${assignedUser})`,
    );
  } catch (err) {
    console.error(`[Notification] Handler error on task deletion: ${err.message}`);
  }
});

// Top-level error listener so rejected handlers never crash the process (P10 assignment)
taskEvents.on('error', (error) => {
  console.error(`[TaskEvents] Event emitter caught error: ${error.message}`, error);
});
