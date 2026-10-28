# Student Portfolio (React + Vite)

This repository contains Practical 1-5 work for **Advanced Web Development Frameworks (ITUE301)**.

## Practical 2 Features

- React Router v6 based navigation with no full page reload.
- Routes:
  - `/` -> Home
  - `/projects` -> Projects
  - `/contact` -> Contact
  - `*` -> 404 Not Found
- `NavBar` built with `Link` from `react-router-dom`.
- `useState` for dark/light mode toggle.
- Controlled contact input with live preview and character count.
- Second `useState` on Contact page to show/hide help text.

## Practical 3 Features (API Integration)

- Projects route integrates with the GitHub REST API:
  - `https://api.github.com/users/octocat/repos?sort=updated&per_page=100`
- Uses `useEffect` for fetch-on-mount behavior.
- Uses `useState` for:
  - `repos` (API data)
  - `loading` (request in progress)
  - `error` (request failure)
  - `searchQuery` (client-side filtering)
- Shows reusable loading and error components:
  - `Spinner`
  - `ErrorMessage`
- Includes supplementary requirements:
  - Retry button on API failure
  - Search filter by repository name
  - Star count display for each repository

## Practical 4 Features (Express CRUD API)

- In-memory task management Express server
- Full CRUD operations:
  - `GET /tasks` -> retrieve all tasks
  - `POST /tasks` -> create a task
  - `PUT /tasks/:id` -> update a task
  - `DELETE /tasks/:id` -> delete a task
- Request validation and error handling
- Request logging middleware

## Practical 5 Features (MongoDB Integration with Mongoose)

- MongoDB database integration using Mongoose ODM
- Task schema with validation:
  - `title` (String, required, trimmed)
  - `description` (String, optional, trimmed)
  - `completed` (Boolean, default: false)
  - `priority` (Enum: low/medium/high, default: medium)
  - `createdAt` (Date, auto-set)
- Pre-save hook for automatic whitespace trimming
- Full CRUD operations with MongoDB:
  - `GET /tasks` -> retrieve all tasks from database
  - `GET /task/:id` -> retrieve a single task by ObjectId with 404 handling
  - `POST /tasks` -> create a task with schema validation
  - `PUT /tasks/:id` -> update a task with validation
  - `DELETE /tasks/:id` -> delete a task
- Mongoose validation error handling
- Environment-based configuration with `.env`

### MongoDB Setup

To run Practical 5, ensure MongoDB is installed and running:

```bash
# Local MongoDB (default port 27017)
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env with your connection string
```

### Environment Configuration

Create a `.env` file in the project root:

```
MONGODB_URI=mongodb://localhost:27017/student-portfolio
PORT=5000
FRONTEND_URL=http://localhost:5173
GITHUB_CLIENT_ID=your-github-oauth-client-id
GITHUB_CLIENT_SECRET=your-github-oauth-client-secret
GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback
```

### GitHub Login

GitHub login uses OAuth and never sends a GitHub password to this application.
Create an OAuth App in GitHub **Settings -> Developer settings -> OAuth Apps**,
set its authorization callback URL to
`http://localhost:5000/auth/github/callback`, and add the client ID and secret
to `.env`. Restart the backend after changing environment variables. The
frontend's **Continue with GitHub** button then redirects to GitHub for
authorization and links the verified GitHub email to the local user record.

## Setup

```bash
npm install
npm run dev      # Start Vite dev server
npm run start    # Start Express server (Practical 5)
```

## Validation

```bash
npm run lint
npm run build
```

## Practical 8 Features (Lazy Loading and Code Splitting)

- Route-based code splitting added with `React.lazy()` and `Suspense`.
- `Projects` and `Contact` now load only when their routes are visited.
- A dedicated fallback UI appears while each route chunk downloads.
- Use Vite build output and browser DevTools Network tab to compare:
  - initial bundle size
  - per-route chunk files
  - page load behavior before and after optimization

### Performance Notes

| Metric | Before | After |
| --- | --- | --- |
| Initial JS bundle | Capture from baseline build | Capture after lazy loading |
| Route chunk loading | Not split | Split into route-specific chunks |
| Route transition UX | Immediate bundle cost upfront | Fallback shown while chunk loads |

> Add your screenshots or recorded DevTools values here for submission evidence.

## Practical 9 Features (In-Memory Caching and Query Optimization)

- Added in-memory caching for authenticated task routes using `node-cache`.
- `GET /tasks` now serves from cache for repeated reads within the TTL window.
- `GET /task/:id` is cached separately from the all-tasks response.
- Cache entries are invalidated after successful `POST`, `PUT`, and `DELETE` operations.
- A protected debug endpoint is available at `GET /cache-stats` for cache-hit/cache-miss counts.
- `X-Cache: HIT` / `X-Cache: MISS` headers are returned on cached GET responses.

### Response Time Comparison Log

Record at least 3 samples for each case in Postman or Thunder Client.

| Case | Sample 1 | Sample 2 | Sample 3 | Notes |
| --- | --- | --- | --- | --- |
| Uncached `GET /tasks` |  |  |  | Cache check temporarily disabled |
| Cached `GET /tasks` |  |  |  | Repeated request within TTL |
| Uncached `GET /task/:id` |  |  |  | Optional extra comparison |
| Cached `GET /task/:id` |  |  |  | Optional extra comparison |

### Notes

- `node-cache` is process-local and resets on restart.
- TTL is set to 60 seconds for lab testing.
- Cache invalidation is required on every write so stale task data is not served.

## Practical 11 Features (Docker Containerization)

The full-stack application can be built and started with one Docker Compose command:

```bash
docker compose up --build
```

This starts three services on the `app-network` bridge network:

| Service | Container port | Host port | Purpose |
| --- | ---: | ---: | --- |
| `frontend` | 5173 | 5173 | Builds and serves the React application |
| `backend` | 5000 | 5000 | Runs the Node/Express API |
| `mongodb` | 27017 | 27017 | Stores task data |

Open `http://localhost:5173` after the containers start. The browser uses the
published backend address at `http://localhost:5000`; inside the Compose
network, the backend connects to MongoDB using the service name
`mongodb://mongodb:27017/taskdb`, not `localhost`.

The frontend uses a multi-stage build so the final image contains only the
production preview server and the generated `dist` output. The root
`.dockerignore` excludes `node_modules`, `.env`, local virtual environments,
build output, and repository metadata from Docker build contexts.

MongoDB data is stored in the named `mongodb-data` volume and survives
container restarts. To stop the stack without deleting data:

```bash
docker compose down
```

To remove the containers and the persisted database volume:

```bash
docker compose down -v
```

If port `5000`, `5173`, or `27017` is already in use, change the host side of
the corresponding `ports` entry in `docker-compose.yml`.

## Practical 10 Features (Event-Driven Async Processing)

- Added a native Node.js `EventEmitter` in [events.js](./events.js) for task lifecycle events.
- `POST /tasks` emits `task-created` after the `201` response is sent.
- The task-created listener simulates a two-second notification delay and logs:
  - task title
  - handler start and completion timestamps
  - assigned user
- `DELETE /tasks/:id` emits `task-deleted` after the response is sent.
- An `error` listener logs rejected asynchronous event handlers without crashing the server.

### Expected Console Evidence

The API response log must appear before the delayed notification completion log:

```text
[API] Response sent at 2026-... for task "Prepare practical"
[Notification] Task "Prepare practical" handler started at 2026-... (assigned user: ...)
[Notification] Task "Prepare practical" notification completed at 2026-... (assigned user: ...)
```

The two-second delay is intentionally outside the request-response path. This demonstrates that the API can return immediately while the notification work continues on the event loop.
