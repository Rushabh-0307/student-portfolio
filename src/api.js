const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'student_portfolio_token';

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (typeof window === 'undefined') return;
  if (!token) {
    window.localStorage.removeItem(TOKEN_KEY);
    return;
  }
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_KEY);
}

function getAuthHeaders(extraHeaders = {}) {
  const token = getAuthToken();
  return token ? { ...extraHeaders, Authorization: `Bearer ${token}` } : extraHeaders;
}

async function handleResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!response.ok) {
    const body = isJson ? await response.json() : { error: await response.text() };
    const message = body && body.error ? body.error : `Request failed (${response.status})`;

    if (response.status === 401) {
      clearAuthToken();
    }

    throw new Error(message);
  }

  return isJson ? response.json() : null;
}

export async function registerUser(payload) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await handleResponse(res);
  setAuthToken(body.token);
  return body;
}

export async function loginUser(payload) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = await handleResponse(res);
  setAuthToken(body.token);
  return body;
}

export async function getCurrentUser(signal) {
  const res = await fetch(`${BASE_URL}/me`, {
    signal,
    headers: getAuthHeaders(),
  });

  const body = await handleResponse(res);
  return body.user;
}

export async function getTasks(signal) {
  const res = await fetch(`${BASE_URL}/tasks`, {
    signal,
    headers: getAuthHeaders(),
  });
  const body = await handleResponse(res);
  return body.tasks || [];
}

export async function createTask(payload) {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  const body = await handleResponse(res);
  return body.task;
}

export async function updateTask(id, payload) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(payload),
  });
  const body = await handleResponse(res);
  return body.task;
}

export async function deleteTask(id) {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  await handleResponse(res);
  return true;
}

export default { getTasks, createTask, updateTask, deleteTask, loginUser, registerUser, getCurrentUser, clearAuthToken };
