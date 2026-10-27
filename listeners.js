import taskEvents from './events.js';

const NOTIFICATION_DELAY_MS = 2000;

taskEvents.on('task-created', async ({ task, assignedUser }) => {
  const startedAt = new Date().toISOString();
  console.log(
    `[Notification] Task "${task.title}" handler started at ${startedAt} (assigned user: ${assignedUser})`,
  );

  await new Promise((resolve) => setTimeout(resolve, NOTIFICATION_DELAY_MS));

  const completedAt = new Date().toISOString();
  console.log(
    `[Notification] Task "${task.title}" notification completed at ${completedAt} (assigned user: ${assignedUser})`,
  );
});

taskEvents.on('task-deleted', ({ task, assignedUser }) => {
  const timestamp = new Date().toISOString();
  console.log(
    `[Notification] Task "${task.title}" deleted at ${timestamp} (assigned user: ${assignedUser})`,
  );
});

taskEvents.on('error', (error) => {
  console.error(`[TaskEvents] Event handler error: ${error.message}`, error);
});
