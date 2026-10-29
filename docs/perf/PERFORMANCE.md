# Frontend Performance & Lazy Loading Report

This document records the bundle size comparison before and after implementing route-based code splitting with `React.lazy` and `Suspense`, provides answers to core architectural questions, and gives a manual step-by-step checklist for DevTools verification.

---

## 1. Real Build Output Comparison Table

Evidence collected from `npm run build` runs saved in `docs/perf/before-build.txt` and `docs/perf/after-build.txt`:

| Asset / Chunk | Before Optimization (Monolithic) | After Optimization (Code Splitting) | Change / Impact |
|---|---|---|---|
| **Main JS Bundle** (`index-*.js`) | **258.08 kB** (81.00 kB gzip) | **239.88 kB** (76.56 kB gzip) | **-18.20 kB** (-4.44 kB gzip) reduction in initial load |
| **Projects Chunk** (`Projects-*.js`) | *Bundled in main* | **15.48 kB** (4.38 kB gzip) | Loaded on-demand only when visiting `/projects` |
| **Contact Chunk** (`Contact-*.js`) | *Bundled in main* | **2.84 kB** (1.08 kB gzip) | Loaded on-demand only when visiting `/contact` |
| **NotFound Chunk** (`NotFound-*.js`)| *Bundled in main* | **0.36 kB** (0.26 kB gzip) | Loaded on-demand only on 404 paths |
| **Main CSS** (`index-*.css`) | 16.70 kB (3.88 kB gzip) | 16.70 kB (3.88 kB gzip) | Unchanged |
| **Build Duration** | 523 ms | 227 ms | Faster incremental bundle time |

---

## 2. Answers to Key Architectural Questions

### Q1: Why wrap `<Suspense>` only around the `<Routes>` block instead of the entire `<App />`?
Wrapping `<Suspense>` around the entire `<App />` causes the `NavBar`, application shell, and `Footer` to disappear and be replaced by a full-screen loading spinner whenever a user navigates between routes. This destroys layout stability (causing Cumulative Layout Shift / CLS) and gives a disorienting user experience.
By placing `<Suspense>` strictly around `<Routes>`, the persistent chrome (`NavBar`, header shell, `Footer`) remains rendered and interactive while only the changing page content shows a smooth loading state.

### Q2: How does route-based code splitting improve First Contentful Paint (FCP) and Time to Interactive (TTI)?
In a monolithic bundle, the browser must download, parse, and compile the JavaScript for all pages (even pages the user may never visit, such as Admin or Contact forms) before the main thread is free.
- **FCP (First Contentful Paint):** Improves because the initial HTML and minimal main chunk are downloaded and rendered much quicker.
- **TTI (Time to Interactive):** Improves dramatically because the V8 JavaScript engine parses and compiles significantly fewer megabytes of script during initial load, leaving the main thread responsive to user clicks and keystrokes immediately.

### Q3: What happens if a lazy-loaded chunk fails to download (e.g. temporary network drop)?
If a network disconnect occurs while fetching a dynamically imported chunk, `React.lazy()` throws a chunk load error. If unhandled, this results in an uncaught promise rejection that crashes the React component tree.
**Mitigation:** In production, lazy routes should be wrapped inside a React `ErrorBoundary` component that catches chunk loading failures and renders a user-friendly "Offline or failed to load. Click to retry" fallback instead of a blank screen.

---

## 3. Checklist for DevTools Slow 3G Verification (Manual Steps)

To capture screenshots for lab submission:

- [ ] **Step 1: Open Chrome DevTools Network Tab**
  - Press `F12` or `Ctrl+Shift+I`, navigate to the **Network** tab.
  - Check the **Disable cache** box.
- [ ] **Step 2: Enable Network Throttling**
  - In the throttling dropdown (currently "No throttling"), select **Slow 3G** (or Fast 3G).
- [ ] **Step 3: Initial Load Screenshot**
  - Navigate to `http://localhost:5173/`.
  - Notice that only `index-*.js` is downloaded. Neither `Projects-*.js` nor `Contact-*.js` appear in the network waterfall.
  - *Capture Screenshot 1: Network tab showing initial load.*
- [ ] **Step 4: Transition to Projects Screenshot**
  - Click "Portfolio" in the navigation bar.
  - Observe the `Spinner` fallback rendered inside the page container for ~1-2 seconds while `Projects-*.js` is fetched over Slow 3G.
  - *Capture Screenshot 2: Spinner fallback in action.*
  - *Capture Screenshot 3: Network tab showing lazy chunk `Projects-*.js` fetched on-demand.*

---

## 4. React DevTools Profiler Analysis

- **Steps to identify re-renders:**
  1. Open Chrome DevTools and switch to the **Profiler** tab (from React Developer Tools extension).
  2. Click **Record** (blue circle).
  3. Type into the Contact input or click the task filter buttons.
  4. Stop recording.
  5. Inspect the flamegraph to see component render durations and reasons ("Parent component rendered" or "Hook 1 changed").
- **Unnecessary Re-render Finding:**
  `TODO: fill from real run`
  *(Suggested viva discussion: In `Projects.jsx`, wrapping task item components with `React.memo` prevents all task cards from re-rendering when the user types in the search query input, recalculating only the filtered list via `useMemo`.)*
