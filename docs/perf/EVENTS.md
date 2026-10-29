# Event-Driven Asynchronous Processing Report

This document records the design, implementation, and verified execution order of the event-driven notification pipeline built using Node.js's native `EventEmitter`.

---

## 1. Verified Console Execution Log (Real Run Output)

Captured directly from running `node scripts/verify-events.mjs`:

```text
--- STARTING EVENT ORDER VERIFICATION ---
[API] Response sent at 2026-10-29T12:44:16.030Z for task "Prepare Lab Assignment ITUE301"
[Notification] Task "Prepare Lab Assignment ITUE301" handler started at 2026-10-29T12:44:16.032Z (assigned user: student@university.edu)
[Notification] Task "Prepare Lab Assignment ITUE301" notification completed at 2026-10-29T12:44:18.040Z (assigned user: student@university.edu)
[API] Response sent at 2026-10-29T12:44:18.540Z for deleted task "Prepare Lab Assignment ITUE301"
[Notification] Task "Prepare Lab Assignment ITUE301" deleted at 2026-10-29T12:44:18.540Z (assigned user: student@university.edu)
--- VERIFICATION COMPLETED ---
```

### Analysis of Timestamps:
1. **API Response Sent:** `12:44:16.030Z` — The HTTP status `201 Created` is returned to the client immediately.
2. **Notification Started:** `12:44:16.032Z` — The listener picks up the task on the event loop.
3. **Notification Completed:** `12:44:18.040Z` — Exactly 2.008 seconds later, the simulated async processing completes.
4. **Key Conclusion:** The client receives the response **2 full seconds** before the notification task finishes, proving that the HTTP request-response cycle was completely unblocked.

---

## 2. Answers to Core Event-Driven Questions

### Q1: Why is Node.js `EventEmitter` not "asynchronous magic"?
A common junior developer misconception is assuming that emitting an event automatically runs in a background thread or asynchronous worker. 
In reality, `EventEmitter.emit()` executes all registered listeners **synchronously** in the order they were registered on the single JavaScript call stack.
True non-blocking behavior is only achieved through two deliberate architectural patterns:
1. **Response Prioritization:** In `POST /tasks`, `res.status(201).json({ task })` is invoked **before** `taskEvents.emit('task-created', ...)`. This flushes the HTTP response to the network socket immediately.
2. **Event Loop Deferral:** Inside the listener, background work (such as sending an email or webhook) relies on asynchronous libuv APIs (e.g. `setTimeout`, `fetch`, or database queries) that schedule work onto future event loop phases rather than executing synchronously on the stack.

### Q2: What happens if an event listener throws an uncaught error?
In Node.js, if an unhandled exception is thrown inside an asynchronous event handler:
- An unhandled promise rejection occurs.
- If an `'error'` event is emitted on an `EventEmitter` that has no listener registered for `'error'`, Node.js treats it as a fatal error, prints a stack trace, and immediately terminates the Node process (`process.exit(1)`).
- **Protection in our codebase:**
  1. All listener function bodies in `listeners.js` are wrapped in `try/catch` blocks.
  2. A dedicated top-level `taskEvents.on('error', ...)` handler is registered at startup, ensuring that unhandled errors are safely logged without bringing down the server.

### Q3: When should you transition from EventEmitter to a dedicated message broker (RabbitMQ, Redis/BullMQ, Kafka)?
Process-local `EventEmitter` is ideal for lightweight in-process decouple tasks within a single Node.js instance. However, production architectures require a dedicated message queue when:
1. **Persistence & Crash Resilience:** If the server crashes or reboots while an EventEmitter task is delayed in memory, the notification is permanently lost. Message queues store tasks on disk with ACK (acknowledgement) guarantees.
2. **Horizontal Scaling:** When running 5 Node.js replicas, an EventEmitter can only notify listeners running on the exact same physical machine process. A message queue (e.g. BullMQ or RabbitMQ) distributes jobs evenly across a cluster of worker nodes.
3. **Retry Policies & Dead Letter Queues:** Message brokers provide automatic exponential backoff, rate limiting, and Dead-Letter-Queues (DLQ) for failed jobs.
