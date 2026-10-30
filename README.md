# Student Portfolio & Task Management Platform (React + Vite + Express + MongoDB)

![CI Pipeline](https://github.com/Rushabh-0307/student-portfolio/actions/workflows/ci.yml/badge.svg)

This repository contains the complete practical and assignment work for **Advanced Web Development Frameworks (ITUE301)**. It features a full-stack, authenticated task management system integrated inside a responsive student portfolio.

---

## Practical → Feature → File Index

| Practical / Assignment | Core Feature | Key Implementation Files |
|---|---|---|
| **P1** | React Component Architecture & Props | `src/components/Header.jsx`, `src/components/Skills.jsx`, `src/components/About.jsx`, `src/components/Home.jsx` |
| **P2** | State, Routing, Dark/Light Mode & Controlled Inputs | `src/main.jsx`, `src/App.jsx`, `src/components/NavBar.jsx`, `src/components/Contact.jsx`, `src/components/NotFound.jsx` |
| **P3** | API Fetch Pattern, Loading/Error States & Filtering | `src/components/Projects.jsx`, `src/components/Spinner.jsx`, `src/components/ErrorMessage.jsx` |
| **P4** | RESTful Express API, Middleware Pipeline & Safe 404/500 | `server.js` |
| **A1** | Richardson Maturity Model Evaluation (Levels 0–3) | `docs/assignments/w4-maturity/MATURITY.md` |
| **P5** | MongoDB ODM Integration, Schema Validation & Error Handling | `models/Task.js`, `server.js`, `.env.example` |
| **P6** | Full-Stack Integration, CRUD UI, Toasts & Confirmation | `src/api.js`, `src/components/Projects.jsx`, `src/components/Toast.jsx` |
| **P7** | JWT Authentication, Middleware & Scoped Task Isolation | `middleware/auth.js`, `models/User.js`, `src/components/Projects.jsx` |
| **A2** | Threat Modelling (STRIDE), HTTPS/TLS & NoSQL Sanitization | `docs/assignments/w7-security/SECURITY.md`, `server.js` (`express-mongo-sanitize`) |
| **P8** | Route Code Splitting, React.lazy, Suspense & Build Benchmarks | `src/App.jsx`, `docs/perf/PERFORMANCE.md`, `docs/perf/before-build.txt`, `docs/perf/after-build.txt` |
| **P9** | In-Memory Caching (`node-cache`), Latency Optimization | `cache.js`, `server.js`, `docs/perf/CACHING.md`, `scripts/measure-cache-perf.mjs` |
| **A3** | Apache Bench Load Testing & Idempotent Seeding | `scripts/seed.js`, `scripts/get-token.js`, `docs/assignments/w9-loadtest/LOADTEST.md` |
| **P10** | Event-Driven Async Processing with Node.js EventEmitter | `events.js`, `listeners.js`, `server.js`, `docs/perf/EVENTS.md`, `scripts/verify-events.mjs` |
| **P11** | Docker Multi-Stage Containerization & Compose Orchestration | `Dockerfile`, `Dockerfile.frontend`, `docker-compose.yml`, `.dockerignore`, `docs/DOCKER.md` |
| **P12** | CI/CD Pipeline with GitHub Actions | `.github/workflows/ci.yml`, `__tests__/server.test.js`, `jest.config.js` |

---

## How to Run Locally

### Prerequisites
- Node.js v18+ (tested on Node v24)
- Local MongoDB running on `mongodb://localhost:27017`

### Step 1: Environment Setup
Copy the example environment file:
```bash
cp .env.example .env
```
Ensure your `.env` contains:
```env
MONGO_URI=mongodb://localhost:27017/student-portfolio
PORT=5000
JWT_SECRET=your-secure-jwt-secret-here
CACHE_ENABLED=true
ENABLE_HTTPS=false
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run with Two Terminals

- **Terminal 1: Start Express Backend API**
  ```bash
  npm run start
  # Starts server on http://localhost:5000
  ```

- **Terminal 2: Start Vite Frontend Dev Server**
  ```bash
  npm run dev
  # Opens interactive SPA on http://localhost:5173
  ```

---

## How to Run with Docker Compose

To start the entire multi-container stack (frontend, backend, and MongoDB) with a single command:

```bash
docker compose up --build
```

- **Frontend App:** Visit `http://localhost:5173`
- **Backend API:** Published at `http://localhost:5000`
- **Database:** MongoDB running on `localhost:27017` with data saved in named volume `mongodb-data`.

To stop the containers while preserving database state:
```bash
docker compose down
```

To stop and remove containers along with the persistent database volume:
```bash
docker compose down -v
```

---

## Environment Variables Reference

| Variable | Description | Default / Example Value |
|---|---|---|
| `MONGO_URI` / `MONGODB_URI` | Connection string for MongoDB database | `mongodb://localhost:27017/student-portfolio` (Local) <br>`mongodb://mongodb:27017/taskdb` (Docker) |
| `PORT` | HTTP port for the Express backend | `5000` |
| `JWT_SECRET` | Secret key used to sign and verify HMAC-SHA256 JWT tokens | `student-portfolio-lab-secret` |
| `CACHE_ENABLED` | Toggles in-memory `node-cache` layer (`true` or `false`) | `true` |
| `ENABLE_HTTPS` | Enables optional HTTPS server on port 5443 | `false` |
| `VITE_API_URL` | Base URL used by frontend fetch requests | `http://localhost:5000` |

---

## REST API Route Specifications

| Method | Endpoint | Protection | Description | Status Codes |
|---|---|---|---|---|
| `POST` | `/register` | Public | Register new user with hashed password (bcrypt 10 rounds) | 201, 400, 409 |
| `POST` | `/login` | Public | Authenticate user and issue 1-hour signed JWT | 200, 400, 401 |
| `GET` | `/me` | JWT Protected | Return authenticated user identity (`select: -password`) | 200, 401, 404 |
| `GET` | `/tasks` | JWT Protected | Retrieve all tasks owned by user (cached via `node-cache`) | 200, 401 |
| `GET` | `/tasks/:id` | JWT Protected | Retrieve single task by ObjectId (cached separately) | 200, 400, 401, 404 |
| `POST` | `/tasks` | JWT Protected | Create task, validate title, emit `task-created` event | 201, 400, 401 |
| `PUT` | `/tasks/:id` | JWT Protected | Update task with schema validation (`runValidators: true`) | 200, 400, 401, 404 |
| `DELETE` | `/tasks/:id` | JWT Protected | Delete task and emit `task-deleted` event | 200, 400, 401, 404 |
| `GET` | `/cache-stats` | Public/Debug | Retrieve cache hits, misses, and active keys | 200 |

---

## Legacy Practical Documentation Archive

### Practical 2 Features
- React Router based navigation with no full page reload (`main.jsx`, `App.jsx`).
- Routes: `/` -> Home, `/projects` -> Projects & Task Management, `/contact` -> Contact, `*` -> 404 Not Found.
- `NavBar` built with `Link` from `react-router-dom`.
- `useState` for dark/light mode toggle applying `.dark-mode` / `.light-mode` to the root shell.
- Controlled contact input with live preview and character count.
- Second `useState` on Contact page to show/hide help text tooltip.

### Practical 3 Features (API Integration)
- Reusable `Spinner` and `ErrorMessage` components.
- Search and category filter input on project listings.
- Retry button and graceful error handling on network failure.

### Practical 4 Features (Express CRUD API)
- Modular Express server pipeline with logging, JSON validation, and safe error boundary.
- Strict Content-Type enforcement rejecting non-JSON POST/PUT requests.
- Route-specific ObjectId validator preventing application crashes.

### Practical 5 Features (MongoDB + Mongoose)
- Task schema with trimming pre-save hook and priority enum (`low`, `medium`, `high`).
- Strict schema validation with structured JSON error details.
- Environment separation using `.env.example`.

### Practical 8 Features (Lazy Loading & Code Splitting)
- Route-based chunk splitting with `React.lazy` and `<Suspense>`.
- Initial bundle size reduced by 18.2 kB (documented in `docs/perf/PERFORMANCE.md`).

### Practical 9 Features (In-Memory Caching)
- Micro-caching layer using `node-cache` with user-scoped isolation (`tasks:all:${userId}`).
- Measured 8.5x latency improvement (64ms uncached down to 2.8ms cached).
- Dynamic cache bypass via `CACHE_ENABLED=false` for benchmarking.

### Practical 10 Features (Event-Driven Notifications)
- Singleton `EventEmitter` emitting `task-created` and `task-deleted` lifecycle events.
- Response-first dispatch guarantee: HTTP 201 response flushes before simulated async notifications execute.
- Verified logs in `docs/perf/EVENTS.md`.

### Practical 11 Features (Docker Containerization)
- Multi-stage frontend Docker build serving production build artifacts.
- Compose bridge networking resolving internal database DNS (`mongodb://mongodb:27017/taskdb`).
- Host mapping for browser access (`http://localhost:5000`).


### Practical 12 Features (CI/CD Pipeline with GitHub Actions)
- GitHub Actions workflow (`.github/workflows/ci.yml`) triggers on every push and PR to `main`.
- Jest + Supertest test suite (`__tests__/server.test.js`) validates API routes, middleware, and auth.
- Pipeline installs dependencies, runs automated tests, and reports pass/fail status.
- CI status badge displayed at the top of this README.
