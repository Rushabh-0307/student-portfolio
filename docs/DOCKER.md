# Docker & Containerization Architecture Report

This document records the multi-container architecture configured in `docker-compose.yml`, `Dockerfile`, and `Dockerfile.frontend`, addressing the core architectural questions required for Practical 11.

---

## 1. Multi-Container Stack Specification

The application is orchestrated via Docker Compose into three decoupled services operating over an isolated bridge network (`app-network`):

| Service | Base Image | Container Port | Host Port | Purpose | Health / Dependency |
|---|---|---|---|---|---|
| **`frontend`** | `node:18-alpine` (multi-stage) | 5173 | 5173 | Vite React production preview server | Starts after `backend` |
| **`backend`** | `node:18-alpine` | 5000 | 5000 | Express REST API server | Starts after `mongodb` is healthy |
| **`mongodb`** | `mongo:7` | 27017 | 27017 | Database engine with named volume `mongodb-data` | Configured with `mongosh ping` healthcheck |

---

## 2. Answers to Core Docker Architecture Questions

### Q1: Why does the backend connect to `mongodb:27017`, but the browser connects to `localhost:5000`?
- **Backend to Database:** Inside Docker Compose, all containers join the private bridge network (`app-network`). Docker provides an embedded DNS server that resolves container service names (`backend`, `frontend`, `mongodb`) to internal IP addresses. Because MongoDB runs in a sibling container named `mongodb`, the backend resolves and connects via `mongodb://mongodb:27017/taskdb`. If the backend used `localhost:27017`, it would attempt to connect to its own container's network namespace where MongoDB is not running.
- **Browser to Backend:** The React single-page application is compiled into JavaScript and HTML that executes **inside the user's web browser on the physical host operating system**, NOT inside the container network. The browser has no access to Docker internal DNS (`http://backend:5000` will fail to resolve in Chrome). Therefore, the API URL baked into the Vite build (`VITE_API_URL`) must point to the published host port: `http://localhost:5000`.

### Q2: What is the difference between `EXPOSE` in a Dockerfile and `ports:` in docker-compose.yml?
- **`EXPOSE 5000` (Dockerfile):**
  - Acts as architectural documentation and metadata indicating which port the process inside the container intends to listen on.
  - Does **not** publish or bind the port to the host machine. Without explicit port mapping, other machines on the host network cannot access the service.
- **`ports: - "5000:5000"` (docker-compose.yml):**
  - Actively configures iptables / NAT forwarding on the host machine.
  - Binds host port 5000 to container port 5000, allowing outside traffic (such as the browser or Postman running on Windows) to reach the service.

### Q3: Why must we NEVER copy host `node_modules` into a Docker image?
Copying the host machine's `node_modules` folder via `COPY . .` introduces three severe problems:
1. **Binary Incompatibility (Architecture Mismatch):** Native C++ binaries compiled on the host (e.g. `bcrypt`, `oxlint`, or filesystem watchers) are compiled for Windows (`.node` PE binaries) or macOS. Placing them inside a Linux Alpine container (`node:18-alpine`) results in fatal `invalid ELF header` or `dynamic linker` execution crashes.
2. **Context Transfer Bloat:** Host `node_modules` often contains hundreds of megabytes of temporary caches and platform-specific artifacts. Copying it dramatically slows down Docker build times (`Sending build context to Docker daemon...`).
3. **Cache Invalidation:** Copying `node_modules` invalidates Docker's layer cache on every trivial local file edit, forcing full recompilation.
- **Solution:** Add `node_modules` to `.dockerignore`, then run `COPY package*.json ./` followed by `RUN npm ci --omit=dev` inside the container so Linux binaries compile natively.

---

## 3. Data Persistence Verification (Named Volume Proof)

MongoDB data is stored in the named volume `mongodb-data` mapped to `/data/db`.
To verify persistence:
1. Launch the stack:
   ```bash
   docker compose up --build -d
   ```
2. Register an account and create a task at `http://localhost:5173/projects`.
3. Stop and remove containers:
   ```bash
   docker compose down
   ```
4. Restart the containers without wiping volumes:
   ```bash
   docker compose up -d
   ```
5. Refresh the browser: all users and tasks remain intact because `mongodb-data` was preserved.
6. To completely purge database data (clean state):
   ```bash
   docker compose down -v
   ```
