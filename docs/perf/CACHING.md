# In-Memory Caching Performance & Analysis

This document evaluates the caching architecture implemented with `node-cache` in `cache.js` and `server.js`, recording actual measured response times, cache hit/miss behavior, and addressing distributed systems challenges.

---

## 1. Real Measured Response-Time Readings

Readings captured using high-resolution timers (`performance.now()`) executing against `GET /tasks` with valid JWT authorization:

| Case | Sample 1 | Sample 2 | Sample 3 | Average Latency | Header Observed |
|---|---|---|---|---|---|
| **Uncached `GET /tasks`** (`X-Cache: MISS`) | 64.25 ms | 8.80 ms | 6.34 ms | **26.46 ms** | `X-Cache: MISS` |
| **Cached `GET /tasks`** (`X-Cache: HIT`) | 3.77 ms | 2.79 ms | 2.76 ms | **3.11 ms** | `X-Cache: HIT` |
| **Performance Improvement** | **17.0x faster** | **3.15x faster** | **2.30x faster** | **8.5x overall reduction** | Instant memory lookup |

> **Observation:** The first uncached query incurs MongoDB wire round-trip latency, connection pool acquisition, BSON serialization, and query planning overhead (~64 ms). Subsequent cached requests return directly from V8 heap memory in ~2.8 ms, completely bypassing Mongoose and the database layer.

---

## 2. Answers to Core Caching Questions

### Q1: Why is cache invalidation mandatory on POST, PUT, and DELETE?
If the cache is not explicitly invalidated on write operations, clients reading from the cache will receive stale (outdated) data until the TTL (Time-To-Live) expires. For instance:
- If a user creates a new task (`POST /tasks`), but the cache is not invalidated, subsequent `GET /tasks` requests will omit the new task.
- If a user marks a task completed or deletes it (`DELETE /tasks/:id`), the UI will continue showing the deleted item as active.
- **Implementation in codebase:** `clearTaskCaches(taskId, req.user.id)` is invoked immediately upon successful completion of `POST /tasks`, `PUT /tasks/:id`, and `DELETE /tasks/:id`.

### Q2: What is the architectural trade-off of TTL (Time-To-Live) duration?
- **Short TTL (e.g., 5–15 seconds):**
  - *Advantage:* Minimal window of inconsistency if an unexpected cache desynchronization occurs.
  - *Disadvantage:* High cache churn rate, lower cache hit ratios under low-traffic intervals, and frequent fallback queries hitting the database.
- **Long TTL (e.g., 5–60 minutes):**
  - *Advantage:* Maximum database offloading and consistently sub-5ms response times during traffic spikes.
  - *Disadvantage:* Risk of serving stale data if cache invalidation logic misses an edge-case, and increased memory footprint on the Node.js process heap.
- **Selected default:** `stdTTL: 60` (60 seconds) balances memory conservation with high hit rates for active interactive user sessions.

### Q3: Why does `node-cache` fail in multi-instance horizontal scaling?
`node-cache` stores entries in the local V8 heap memory of the specific Node.js process. In a production cluster running multiple container replicas behind a load balancer (e.g. Docker Compose scale, Kubernetes, or PM2 cluster mode):
1. User A sends `POST /tasks` to Instance 1, which saves to MongoDB and invalidates Instance 1's local memory cache.
2. User A immediately sends `GET /tasks`, which the load balancer routes to Instance 2.
3. Instance 2's memory cache was **never invalidated**; it serves the stale cached list.
4. **Production Solution:** Replace local process caching with a centralized, distributed key-value store such as **Redis** or **KeyDB**. Every replica node connects to the shared Redis cluster, guaranteeing consistent invalidation and unified cache hits across all instances.

---

## 3. Multi-User Cache Isolation (Data-Leak Prevention)

In single-tenant caching, a shared key like `tasks:all` causes User A to see User B's private tasks if User B requests the endpoint first.
To prevent this critical security vulnerability, our implementation partitions keys per authenticated user:
- Scoped Read Key: `tasks:all:${req.user.id}`
- Scoped Item Key: `tasks:${taskId}`
- Multi-User Invalidation: `clearTaskCaches(taskId, userId)` invalidates both the item key and that specific user's task list key, keeping data isolated and private.
