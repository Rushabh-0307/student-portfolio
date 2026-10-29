import taskEvents from '../events.js';
import '../listeners.js';

async function testEvents() {
  console.log('--- STARTING EVENT ORDER VERIFICATION ---');

  const mockTask = {
    _id: '6720abc12345678901234567',
    title: 'Prepare Lab Assignment ITUE301',
    description: 'Verify event ordering',
    priority: 'high',
  };

  const assignedUser = 'student@university.edu';

  // 1. Simulate API sending response first (P10)
  const apiSentTime = new Date().toISOString();
  console.log(`[API] Response sent at ${apiSentTime} for task "${mockTask.title}"`);

  // 2. Emit event after response
  taskEvents.emit('task-created', {
    task: mockTask,
    assignedUser,
  });

  // Wait 2.5 seconds to capture completion
  await new Promise((resolve) => setTimeout(resolve, 2500));

  // 3. Test deletion event
  console.log(`[API] Response sent at ${new Date().toISOString()} for deleted task "${mockTask.title}"`);
  taskEvents.emit('task-deleted', {
    task: mockTask,
    assignedUser,
  });

  console.log('--- VERIFICATION COMPLETED ---');
}

testEvents().catch(console.error);
