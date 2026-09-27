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
```

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
