# Richardson Maturity Model Evaluation

This document evaluates the REST API implementation in `server.js` against Leonard Richardson's REST Maturity Model (Levels 0 to 3).

## Evaluation Table

| Level | Criterion | Does your API satisfy this? | Evidence |
|---|---|---|---|
| **Level 0: The Swamp of POX** | Single URI endpoint dispatching all actions via HTTP POST (e.g., XML-RPC, SOAP) | No | The API avoids a single monolithic RPC endpoint. Requests are routed to individual, distinct resource URIs based on the entity domain. |
| **Level 1: Resources** | Distinct URIs for individual resources instead of a single endpoint | Yes | Resources are addressed via dedicated paths in `server.js`: `/tasks` (collection), `/tasks/:id` (individual resource), `/register`, `/login`, and `/me`. |
| **Level 2: HTTP Verbs & Status Codes** | Correct HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) with meaningful standard status codes on all success and error paths | Yes | `server.js` strictly applies standard verbs and codes: <br>• `GET /tasks`: 200 OK with array<br>• `GET /tasks/:id`: 200 OK on found, 404 Not Found if missing, 400 Bad Request on invalid ObjectId<br>• `POST /tasks`: 201 Created on success, 400 Bad Request if missing title or non-JSON body<br>• `PUT /tasks/:id`: 200 OK with updated task, 404 Not Found if missing, 400 Bad Request on invalid data<br>• `DELETE /tasks/:id`: 200 OK on deletion, 404 Not Found if missing<br>• Unmatched routes return structured JSON 404; unhandled errors return 500 without stack traces. |
| **Level 3: Hypermedia Controls (HATEOAS)** | Hypermedia As The Engine Of Application State; responses provide discoverable links (`_links`) guiding next available transitions | No | Responses return task and user resource objects directly. They do not embed hypermedia navigation links, making client state transitions out-of-band. |

---

## Endpoint Level 2 Compliance Audit

Every endpoint in `server.js` was audited against Level 2 requirements:
- `POST /register`: Returns `201 Created` with JWT token and created user representation on success; `400 Bad Request` on missing/invalid input; `409 Conflict` on duplicate email.
- `POST /login`: Returns `200 OK` with JWT token on success; `400 Bad Request` on missing credentials; `401 Unauthorized` on invalid email/password.
- `GET /me`: Returns `200 OK` with sanitized user object; `401 Unauthorized` on missing/invalid JWT; `404 Not Found` if user is no longer in DB.
- `GET /tasks`: Returns `200 OK` with task array; `401 Unauthorized` if unauthenticated.
- `GET /tasks/:id`: Returns `200 OK` with task object; `400 Bad Request` if ID format is invalid; `404 Not Found` if task ID does not exist; `401 Unauthorized` if unauthenticated.
- `POST /tasks`: Returns `201 Created` with created task object; `400 Bad Request` if `title` is missing/empty or `Content-Type` is not `application/json`; `401 Unauthorized` if unauthenticated.
- `PUT /tasks/:id`: Returns `200 OK` with updated task; `400 Bad Request` on invalid ID or validation failure; `404 Not Found` if task not found; `401 Unauthorized` if unauthenticated.
- `DELETE /tasks/:id`: Returns `200 OK` with deleted task confirmation; `400 Bad Request` on invalid ID; `404 Not Found` if task not found; `401 Unauthorized` if unauthenticated.

---

## HATEOAS Specification (Level 3 Documentation)

To achieve Level 3 maturity, representations include a `_links` hypermedia control object following the HAL (Hypertext Application Language) standard. Clients do not need hardcoded URI templates to manipulate resources:

```json
{
  "_id": "673f8a9e1234567890abcdef",
  "title": "Complete ITUE301 Lab Report",
  "description": "Finalize practical documentation and audit verification",
  "completed": false,
  "priority": "high",
  "createdAt": "2026-10-29T12:00:00.000Z",
  "_links": {
    "self": {
      "href": "/tasks/673f8a9e1234567890abcdef",
      "method": "GET"
    },
    "delete": {
      "href": "/tasks/673f8a9e1234567890abcdef",
      "method": "DELETE"
    }
  }
}
```

---

## Why Most Production APIs Stop at Level 2

Most real-world production APIs deliberately stop at Level 2 rather than implementing full HATEOAS (Level 3) due to practical engineering trade-offs:
1. **Frontend-Backend Coupling Reality:** Modern single-page applications (React, Vue, mobile apps) are pre-compiled and tightly coupled to specific business workflows, UI routes, and state stores. They rarely navigate an API dynamically like a human browsing hyperlinks in a web browser.
2. **Payload and Performance Overhead:** Serializing link relationships, calculating allowed state transitions per permission level, and transmitting redundant URLs across millions of requests noticeably increases server CPU load, payload size, and bandwidth costs without tangible developer velocity gains.
3. **Tooling and Schema Standards:** The developer ecosystem heavily favors OpenAPI (Swagger), TypeScript type generation, and GraphQL for contract generation and compile-time type safety. Level 2 with OpenAPI specifications provides better automated SDK generation, validation, and documentation than hypermedia links can practically offer.
