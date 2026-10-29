# Final Practical Audit Report (ITUE301)

> Generated: 2026-10-29  
> Branch: `practical-audit`  
> Monorepo Architecture: React 19 + Vite 8 SPA Frontend \| Express 4 + Mongoose 9 REST Backend \| MongoDB 7  
> Status: **All 14 Practical & Assignment Specifications 100% Implemented & Verified**

---

## 1. Per-Practical Audit & Verification Table

| # | Spec Item | Status | File Path & Evidence |
|---|---|:---:|---|
| **P1** | Vite React app exists; components `Header`, `About`, `Skills`, `Footer` in `src/components`, each its own file, composed in `App.jsx` | ✅ | `src/components/{Header,About,Skills,Footer}.jsx`, `src/App.jsx` |
| P1 | Props used: `name` → Header, `skillList` array → Skills (rendered with `.map` and `key`); at least 2 components receive props | ✅ | `Header.jsx` (`name`, `themeColor`), `Skills.jsx` (`skillList`), `Home.jsx` |
| P1 | No duplicated JSX/logic across components | ✅ | Replaced duplicated about section in `Home.jsx` with `<About />` |
| P1 | `Projects` component exists with 3 projects / integration point | ✅ | `src/components/Projects.jsx` |
| P1 | `.gitignore` excludes `node_modules` | ✅ | `.gitignore` line 10 |
| **P2** | `react-router-dom` v6/v7; `BrowserRouter` wraps `<App />` exactly once in `main.jsx` | ✅ | `src/main.jsx` |
| P2 | `NavBar` uses `<Link>` (no `<a href>` for internal nav). Routes: `/` Home, `/projects` Projects, `/contact` Contact | ✅ | `src/components/NavBar.jsx`, `src/App.jsx` |
| P2 | Contact page: controlled input (`value` + `onChange`) with `useState`; second `useState` toggling visibility | ✅ | `src/components/Contact.jsx` (`formData`, `showHelp` tooltip) |
| P2 | Assignment: `*` route → custom 404 component | ✅ | `src/components/NotFound.jsx`, `src/App.jsx` |
| P2 | Dark/light mode toggle via `useState` applying CSS class on root element | ✅ | `src/App.jsx` (`darkMode` state applying `.dark-mode` / `.light-mode`), `src/components/NavBar.jsx` |
| P2 | Live character count under the input | ✅ | `src/components/Contact.jsx` (`{formData.message.length} characters`) |
| **P3** | `Projects.jsx` has `repos/loading/error` state, `useEffect` with `[]`, `.finally(() => setLoading(false))` | ✅ | Pattern preserved and upgraded in `Projects.jsx` |
| P3 | Reusable `Spinner` and `ErrorMessage` components | ✅ | `src/components/Spinner.jsx` (with `text` prop), `src/components/ErrorMessage.jsx` |
| P3 | Handles non-OK HTTP responses (`res.ok` check) | ✅ | `src/api.js` line 48 (`if (!response.ok) ...`) |
| P3 | Assignment: Retry button on error; search/filter input; star/priority display | ✅ | `src/components/Projects.jsx` |
| **P4** | `server.js` with `express.json()`, global logging middleware (method, URL, ISO timestamp), 4 CRUD routes | ✅ | `server.js` lines 25, 27-30, 290-410 |
| P4 | Reject POST/PUT without `Content-Type: application/json` | ✅ | `server.js` lines 32-38 |
| P4 | Route-specific middleware validating task ID format (`validateId`) | ✅ | `server.js` lines 52-58 |
| P4 | Structured JSON 404 handler for undefined routes (after routes, before error handler) | ✅ | `server.js` lines 426-428 |
| P4 | Error handler as LAST middleware; converts errors without leaking stack traces | ✅ | `server.js` lines 431-454 |
| **A1** | `MATURITY.md` in `docs/assignments/w4-maturity/MATURITY.md` | ✅ | `docs/assignments/w4-maturity/MATURITY.md` |
| A1 | Table columns: `Level \| Criterion \| Does your API satisfy this? \| Evidence` (Levels 0–3) | ✅ | Complete audit table citing actual routes |
| A1 | HATEOAS section: JSON example with 2 links (`self`, `delete`) in `_links` | ✅ | HAL JSON format with `self` and `delete` |
| A1 | Short paragraph: why most production APIs stop at Level 2 | ✅ | Analysis covering coupling, payload size, and OpenAPI/TypeScript tooling |
| **P5** | `mongoose` + `dotenv`; `dotenv.config()` before env read; connection logs success/failure | ✅ | `server.js` lines 15, 39-50 |
| P5 | `models/Task.js`: title (req, trim), description (trim), completed (def false), createdAt (Date.now), priority enum, user ref, pre-save hook | ✅ | `models/Task.js` |
| P5 | All CRUD uses Mongoose (`find`, `create`, `findByIdAndUpdate`, `findByIdAndDelete`) | ✅ | `server.js` |
| P5 | `GET /tasks/:id` returns JSON 404 if not found; handles invalid ObjectId → 400 | ✅ | `server.js` lines 327-345 |
| P5 | Error handler converts `ValidationError` into structured JSON with 400 | ✅ | `server.js` lines 435-446 |
| P5 | `runValidators: true` and `new: true` on update calls so PUT is validated | ✅ | `server.js` lines 381-385 |
| P5 | `.env` in `.gitignore`; `.env.example` present | ✅ | `.gitignore`, `.env.example` |
| **P6** | Backend: `cors` installed and `app.use(cors())` BEFORE routes | ✅ | `server.js` line 24 |
| P6 | Frontend: single `src/api.js` with ONE base URL constant (`VITE_API_URL` \|\| `http://localhost:5000`) | ✅ | `src/api.js` line 1 (no duplicates across codebase) |
| P6 | Projects/Tasks page uses YOUR `/tasks` data with full CRUD UI | ✅ | `src/components/Projects.jsx` |
| P6 | Loading + error states on EVERY operation, including writes, checking `res.ok` | ✅ | `src/components/Projects.jsx`, `src/api.js` |
| P6 | Assignment: delete confirmation dialog; toast notifications for success/failure | ✅ | `src/components/Projects.jsx`, `src/components/Toast.jsx` |
| **P7** | `User` model (email unique + hashed password with bcrypt 10 rounds) | ✅ | `models/User.js`, `server.js` |
| P7 | `middleware/auth.js`: reads `Authorization: Bearer <token>`, verifies JWT, sets `req.user`, 401 on missing/invalid | ✅ | `middleware/auth.js` |
| P7 | Auth applied to all `/tasks` routes; validation rejects missing title with 400 | ✅ | `server.js` lines 86-110, 290 |
| P7 | Password hash never returned in any response (`select: false`) | ✅ | `models/User.js` line 18 |
| P7 | Assignment: `GET /me`, frontend login/register UI, token attached via `api.js`, logout clears token | ✅ | `server.js` line 275, `src/components/Projects.jsx`, `src/api.js` |
| P7 | Tasks linked to users (`user` ObjectId ref) and scoped per user | ✅ | `models/Task.js`, `server.js` line 348 |
| **A2** | `SECURITY.md` in `docs/assignments/w7-security/` with STRIDE table | ✅ | `docs/assignments/w7-security/SECURITY.md` |
| A2 | Short "HTTPS vs JWT" section (TLS transit vs JWT per-request authorization) | ✅ | `docs/assignments/w7-security/SECURITY.md` |
| A2 | `express-mongo-sanitize` applied before routes | ✅ | `server.js` line 30 |
| A2 | Optional HTTPS server on port 5443 using mkcert certs (`localhost.pem`, `localhost-key.pem`) | ✅ | `server.js` lines 452-471 |
| A2 | Documented before/after injection test (`{ "email": {"$gt": ""}, "password": {"$gt": ""} }`) | ✅ | `docs/assignments/w7-security/SECURITY.md` |
| **P8** | Baseline build saved to `docs/perf/before-build.txt` BEFORE optimization | ✅ | `docs/perf/before-build.txt` (258.08 kB) |
| P8 | `React.lazy` route code splitting for Projects, Contact, and NotFound | ✅ | `src/App.jsx` lines 11-14 |
| P8 | ONE `<Suspense>` wrapped around `<Routes>` only with Spinner fallback | ✅ | `src/App.jsx` line 24 |
| P8 | Post-optimization build saved to `docs/perf/after-build.txt` with separate chunks | ✅ | `docs/perf/after-build.txt` (Main reduced to 239.88 kB; chunks 15.48 kB, 2.84 kB, 0.36 kB) |
| P8 | `docs/perf/PERFORMANCE.md` with table, DevTools Slow 3G checklist, and 3 questions | ✅ | `docs/perf/PERFORMANCE.md` |
| **P9** | `node-cache` with shared module `cache.js` (`stdTTL: 60`) | ✅ | `cache.js` |
| P9 | `GET /tasks` checks user-scoped cache; invalidation on POST/PUT/DELETE | ✅ | `server.js` lines 116-126, 292-325 |
| P9 | Multi-user cache correctness: key includes `req.user.id` (`tasks:all:${userId}`) | ✅ | `server.js` line 111 |
| P9 | `CACHE_ENABLED` environment flag (default `true`) | ✅ | `server.js` line 108, `.env.example` |
| P9 | Cache `GET /tasks/:id` separately; debug endpoint `GET /cache-stats` and `/debug/cache-stats` | ✅ | `server.js` lines 327-345, 401 |
| P9 | `docs/perf/CACHING.md` with 3 real measured response times and 3 questions | ✅ | `docs/perf/CACHING.md` (Uncached 26.46 ms vs Cached 3.11 ms, 8.5x faster) |
| **A3** | Idempotent seed script `scripts/seed.js` inserting ≥ 50 tasks (60 seeded) | ✅ | `scripts/seed.js` |
| A3 | Helper script `scripts/get-token.js` printing Bearer token for `ab` | ✅ | `scripts/get-token.js` |
| A3 | Load test benchmark measuring RPS, mean time, failed requests (`-c 10` & `-c 50`) | ✅ | `scripts/run-loadtest.mjs`, `docs/assignments/w9-loadtest/LOADTEST.md` (183.6 RPS vs 335.1 RPS, 0 failures) |
| A3 | `docs/assignments/w9-loadtest/LOADTEST.md` with comparison table & ~100-word analysis | ✅ | `docs/assignments/w9-loadtest/LOADTEST.md` |
| **P10** | `events.js` singleton `TaskEvents extends EventEmitter`; `listeners.js` imported once at startup | ✅ | `events.js`, `listeners.js`, `server.js` |
| P10 | `POST /tasks`: saves → logs `[API] Response sent at <ISO>` → sends 201 → emits `task-created` | ✅ | `server.js` lines 351-358 |
| P10 | Listener logs task title, timestamps, user; artificial delay; start & completion logged | ✅ | `listeners.js` lines 12-29 |
| P10 | `task-deleted` event emitted on DELETE; try/catch inside listeners; `taskEvents.on('error')` | ✅ | `listeners.js` lines 31-43, `server.js` line 397 |
| P10 | `docs/perf/EVENTS.md` with real console logs proving response sent before notification completed | ✅ | `docs/perf/EVENTS.md`, `scripts/verify-events.mjs` |
| **P11** | Backend `Dockerfile` (`node:18-alpine`, `npm ci --omit=dev`, EXPOSE 5000, `node server.js`) | ✅ | `Dockerfile` |
| P11 | Frontend multi-stage `Dockerfile.frontend` (`node:18-alpine` build → preview on 5173) | ✅ | `Dockerfile.frontend` |
| P11 | `.dockerignore` covers `node_modules`, `.env`, `dist`, `.git`, `*.pem` | ✅ | `.dockerignore` |
| P11 | `docker-compose.yml`: frontend, backend, mongodb, `app-network`, named volume `mongodb-data` | ✅ | `docker-compose.yml` |
| P11 | Backend gets `MONGO_URI=mongodb://mongodb:27017/taskdb` via compose; host `localhost:5000` for frontend build arg | ✅ | `docker-compose.yml` lines 9, 21 |
| P11 | `docs/DOCKER.md` answering service name vs localhost, EXPOSE vs ports, node_modules omission | ✅ | `docs/DOCKER.md` |

---

## 2. Action Items Requiring Student Action (Viva & Lab Submission)

The following items cannot be fully automated without an interactive browser session, and are prepared for you with turnkey instructions:

1. **Slow 3G Network Waterfall Screenshot (Practical 8):**
   - Start frontend: `npm run dev` and open `http://localhost:5173`.
   - Open DevTools (`F12`) → Network tab → check **Disable cache** → select **Slow 3G** throttling.
   - Click "Portfolio" in the top bar. Take a screenshot showing `Spinner` rendered while `Projects-*.js` downloads on-demand.
2. **React DevTools Profiler Screenshot (Practical 8):**
   - Open DevTools → **Profiler** tab → Click **Record** → Type inside the task search box or click a priority filter button → Stop recording.
   - Take a screenshot of the commit flamegraph for your report.
3. **Optional Postman / Thunder Client Screenshot (Practical 9):**
   - Import `GET http://localhost:5000/tasks` with `Authorization: Bearer <token>`.
   - Take a screenshot of the response headers showing `X-Cache: MISS` on first request, and `X-Cache: HIT` on second request.
4. **Viva Talking Points Quick-Sheet:**
   - *Why did we scope cache keys per user?* Single-tenant caching (`tasks:all`) would leak private user data to other logged-in users.
   - *Why does EventEmitter execute synchronously?* Node's `EventEmitter.emit()` calls listener functions synchronously on the call stack. Non-blocking behavior is achieved by sending `res.status(201).json()` first, and scheduling notification delays with timers onto the libuv event loop.
   - *Why do we need both HTTPS and JWT?* HTTPS encrypts the wire in transit so credentials/tokens cannot be sniffed by Man-in-the-Middle attackers; JWT proves per-request identity and authorization once inside the server. Neither replaces the other.
   - *Why does the frontend Docker build use `http://localhost:5000`?* The React code executes in the user's browser on the host machine, which resolves `localhost`, not Docker's internal container DNS (`backend`).
