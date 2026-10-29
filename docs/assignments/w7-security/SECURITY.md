# Threat Modelling, Secure Coding, and HTTPS Security Evaluation

This document details the security architecture of the student portfolio and task management platform, evaluating threats using Microsoft's **STRIDE** methodology, analyzing TLS/HTTPS vs JWT mechanisms, and documenting defense-in-depth mitigations implemented in the codebase.

---

## 1. STRIDE Threat Model

| STRIDE Category | Threat Description | Real Example in THIS Application | Mitigation Applied or Planned |
|---|---|---|---|
| **Spoofing** | Attacker impersonates an authorized student or admin by forging identity credentials. | An attacker crafts an unsigned or weakly-signed JWT token and passes `Authorization: Bearer <forged_token>` to access `/tasks` or `/me`. | **Applied:** `middleware/auth.js` enforces cryptographic signature verification using `jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] })` with secret keys loaded exclusively from `.env`. Rejects empty or malformed tokens with `401 Unauthorized`. |
| **Tampering** | Attacker alters in-flight request data or database state through malicious inputs. | An attacker submits NoSQL operator objects such as `{ "email": { "$gt": "" }, "password": { "$gt": "" } }` to `/login` to bypass authentication without valid credentials. | **Applied:** `express-mongo-sanitize` is registered globally immediately after `express.json()`. It recursively strips all keys prefixed with `$` or containing `.` from `req.body`, `req.params`, and `req.query`, neutralizing NoSQL operator injection before queries reach Mongoose. |
| **Repudiation** | An attacker performs malicious actions (e.g., deleting tasks) while denying having done so due to missing audit trails. | A compromised user account deletes all project tasks (`DELETE /tasks/:id`) and claims the platform suffered data loss or glitch. | **Applied / Planned:** Server logs HTTP method, URL, and ISO timestamp for every request via global logging middleware. `taskEvents.emit('task-deleted')` records deleted task IDs along with the executing user identifier. Full database audit trail collection planned for production. |
| **Information Disclosure** | Sensitive data (passwords, stack traces, system paths) is leaked to untrusted clients. | When an unhandled error occurs, Node.js default error handlers or Mongoose errors leak internal stack traces or database schema structures to clients; or `GET /tasks` / `POST /register` leaks user password hashes. | **Applied:** In `models/User.js`, password field has `select: false` so it is never returned by default queries. The global error handler catches all errors and responds with generic JSON (`{ error: 'Something went wrong' }`), printing `err.stack` only to server-side logs. |
| **Denial of Service (DoS)** | Attacker overwhelms the application, depleting CPU, memory, or database connection pools. | Attacker spams unauthenticated registration or computationally expensive bcrypt hash comparisons (`POST /login`), or floods `GET /tasks` with concurrent requests. | **Mitigation:** In-memory caching (`node-cache`) protects MongoDB from repeated read spikes. In production, rate limiting via `express-rate-limit` (e.g. 100 requests per 15 minutes per IP) and reverse proxy load balancing are configured. |
| **Elevation of Privilege** | An authenticated user with standard privileges gains access to tasks created by other students. | User A authenticates with a valid token and accesses User B's task list via `GET /tasks` or deletes User B's task via `DELETE /tasks/:id`. | **Applied:** In P7, `models/Task.js` stores `user` (ObjectId ref). `POST /tasks` tags every task with `req.user.id`. `GET /tasks` filters records scoped by `{ user: req.user.id }`. Cache keys are partitioned per user (`tasks:all:${userId}`) so users never receive each other's cached data. |

---

## 2. HTTPS/TLS vs JWT: Roles and Distinctions

A common misconception in web security is that JSON Web Tokens (JWT) eliminate the need for TLS/HTTPS, or vice-versa. In reality, both address fundamentally different layers of the security stack:

```
[Client Application / Browser]
         │
         │  1. Transport Security (HTTPS / TLS 1.3)
         │     - Encrypts entire HTTP payload (headers, path, query, body)
         │     - Authenticates server identity via X.509 certificates
         ▼
[Express Server Pipeline]
         │  2. Application Authorization (JWT Bearer Token)
         │     - Cryptographically proves client identity and role
         │     - Stateless per-request authorization in Authorization header
         ▼
[Resource / Protected Controller]
```

- **Transport Layer Security (TLS / HTTPS):**
  - **Purpose:** Protects data **in transit** across the untrusted network.
  - **Protection:** Prevents eavesdropping, Man-in-the-Middle (MitM) packet sniffing, and DNS spoofing. Under plain HTTP, bearer tokens travel in cleartext, meaning an eavesdropper on the local network (e.g., public Wi-Fi) can steal the token with zero effort.
  - **Server Authentication:** Ensures the client is truly speaking to the legitimate domain and not a malicious proxy.

- **JSON Web Tokens (JWT):**
  - **Purpose:** Provides **stateless per-request authorization and identity verification**.
  - **Protection:** Once the request reaches the server, JWT proves that the client holds a verified identity issued by the authentication authority.
  - **Key takeaway:** **Neither replaces the other.** Without HTTPS, a JWT can be intercepted and replayed indefinitely. Without JWT (or equivalent session authorization), HTTPS delivers an unauthenticated connection securely.

---

## 3. NoSQL Operator Injection Test Evidence

### Attack Vector
MongoDB query selectors such as `$gt`, `$ne`, or `$regex` can be passed inside JSON request bodies when an API fails to validate input types.

Payload sent to `POST /login`:
```json
{
  "email": { "$gt": "" },
  "password": { "$gt": "" }
}
```

### Observed Results

1. **Before Sanitization:**
   - Raw input: `{ "email": { "$gt": "" }, "password": { "$gt": "" } }`.
   - Result: Mongoose translates `{ "$gt": "" }` into a MongoDB query operator matching any user with an email alphabetically greater than empty string (i.e. the first user in the collection). If password comparison is bypassed or improperly handled, the attacker gains unauthorized session access.

2. **After `express-mongo-sanitize`:**
   - Test Command Executed:
     ```bash
     node scripts/test-injection.mjs
     ```
   - Real Output:
     ```
     BEFORE Sanitize:
     {
       "email": {
         "$gt": ""
       },
       "password": {
         "$gt": ""
       }
     }

     AFTER Sanitize:
     {
       "email": {},
       "password": {}
     }
     ```
   - When sanitized, all `$gt` keys are stripped. `User.findOne({ email: {} })` fails schema validation or returns null, and validation rejects the request with `400 Bad Request` (`Email and password are required`).

---

## 4. HTTPS Configuration and Local Testing

The Express server includes an optional HTTPS server on port `5443`. The standard HTTP server continues to run on port `5000` to maintain compatibility with the Vite dev server and Docker Compose environment.

### Steps to Generate Local Certificates (mkcert)
```bash
# 1. Install mkcert (Windows via Chocolatey or Scoop, macOS via Homebrew)
choco install mkcert

# 2. Install local CA
mkcert -install

# 3. Generate certificates for localhost
mkcert -key-file localhost-key.pem -cert-file localhost.pem localhost 127.0.0.1 ::1

# 4. Start the server (HTTPS on 5443 automatically activates)
node server.js
```
The certificate files `localhost.pem` and `localhost-key.pem` are protected and ignored via `.gitignore` to prevent secret leakage.
