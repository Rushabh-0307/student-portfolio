# Richardson Maturity Model Evaluation

This document evaluates the task management API in [server.js](C:/Users/dhruv/OneDrive/Desktop/D25IT134/student-portfolio/server.js).

## Summary

The API currently satisfies **Level 2** of the Richardson Maturity Model.

- It exposes resource-based URLs such as `/tasks` and `/tasks/:id`.
- It uses HTTP verbs correctly: `GET`, `POST`, `PUT`, and `DELETE`.
- It returns proper HTTP status codes for success and error cases.
- It does **not** yet include HATEOAS links, so it is not Level 3.

## Evaluation Table

| Level | Criterion | Does the API satisfy this? | Evidence |
|---|---|---|---|
| 0 | Uses one endpoint with action-based calls | No | The API is split into resource URLs instead of a single RPC-style endpoint. |
| 1 | Uses resources and distinct URLs | Yes | `GET /tasks`, `POST /tasks`, `PUT /tasks/:id`, and `DELETE /tasks/:id` are resource-oriented. |
| 2 | Uses HTTP methods and status codes properly | Yes | The server uses `GET`, `POST`, `PUT`, and `DELETE`, and returns `200`, `201`, `400`, `404`, and `500` where appropriate. |
| 3 | Adds HATEOAS links | No | Responses currently return task data only; they do not include `self`, `update`, or `delete` links. |

## Route Audit

The existing route design is already Level 2 compliant, so no route correction was required for this task.

- `GET /tasks` returns the full collection.
- `POST /tasks` creates a new task.
- `PUT /tasks/:id` updates an existing task.
- `DELETE /tasks/:id` deletes a task.
- A global `404` handler covers undefined routes.
- A global error handler covers unexpected failures.

## Example HATEOAS Response for Level 3

If the API is extended to Level 3, a task response could look like this:

```json
{
  "task": {
    "id": 1,
    "title": "Submit assignment",
    "description": "Finish the maturity model report",
    "completed": false
  },
  "links": [
    { "rel": "self", "href": "/tasks/1", "method": "GET" },
    { "rel": "update", "href": "/tasks/1", "method": "PUT" },
    { "rel": "delete", "href": "/tasks/1", "method": "DELETE" },
    { "rel": "collection", "href": "/tasks", "method": "GET" }
  ]
}
```

## Conclusion

The API is already at **Level 2**. The main gap to Level 3 is the absence of hypermedia links.
