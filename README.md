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
