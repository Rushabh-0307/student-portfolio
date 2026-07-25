# Student Portfolio (React + Vite)

This repository contains Practical 1, Practical 2, and Practical 3 work for **Advanced Web Development Frameworks (ITUE301)**.

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

## Setup

```bash
npm install
npm run dev
```

## Validation

```bash
npm run lint
npm run build
```
