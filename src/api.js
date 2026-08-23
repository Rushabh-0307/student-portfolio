const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  if (!response.ok) {
    const body = isJson ? await response.json() : { error: await response.text() };
    const message = body && body.error ? body.error : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return isJson ? response.json() : null;
}

export async function getTasks(signal) {
  const res = await fetch(`${BASE_URL}/tasks`, { signal });
  const body = await handleResponse(res);
  return body.tasks || [];
}

export async function createTask(payload) {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await handleResponse(res);
  return body.task;
}

export async function updateTask(id, payload) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await handleResponse(res);
  return body.task;
}

export async function deleteTask(id) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  await handleResponse(res);
  return true;
}

export default { getTasks, createTask, updateTask, deleteTask };
