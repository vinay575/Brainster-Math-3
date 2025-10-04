import { API_URL } from './config.js';

// Get JWT token from localStorage
function getToken() {
  return localStorage.getItem('token');
}

// Build headers with Authorization
function getHeaders(isJson = true) {
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';

  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return headers;
}

// Handle fetch response
async function handleResponse(response) {
  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const api = {
  auth: {
    studentLogin: (email, password) =>
      fetch(`${API_URL}/auth/student/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      }).then(handleResponse),

    adminLogin: (email, password) =>
      fetch(`${API_URL}/auth/admin/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      }).then(handleResponse),

    studentSignup: (data) =>
      fetch(`${API_URL}/auth/student/signup`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      }).then(handleResponse),

    googleLogin: (idToken, role) =>
      fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ idToken, role }),
      }).then(handleResponse),

    verifyToken: () =>
      fetch(`${API_URL}/auth/verify`, {
        headers: getHeaders(),
      }).then(handleResponse),
  },

  students: {
    getAll: () =>
      fetch(`${API_URL}/students`, { headers: getHeaders() }).then(handleResponse),
    getById: (id) =>
      fetch(`${API_URL}/students/${id}`, { headers: getHeaders() }).then(handleResponse),
    create: (data) =>
      fetch(`${API_URL}/students`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    update: (id, data) =>
      fetch(`${API_URL}/students/${id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    delete: (id) =>
      fetch(`${API_URL}/students/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
    getStats: () =>
      fetch(`${API_URL}/students/stats`, { headers: getHeaders() }).then(handleResponse),
    getProfile: () =>
      fetch(`${API_URL}/students/profile`, { headers: getHeaders() }).then(handleResponse),
    getActivity: () =>
      fetch(`${API_URL}/students/activity`, { headers: getHeaders() }).then(handleResponse),
    logActivity: (data) =>
      fetch(`${API_URL}/students/activity`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
  },

  videos: {
    upload: (formData) => {
      const token = getToken();
      return fetch(`${API_URL}/videos/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      }).then(handleResponse);
    },
    addGoogleDrive: (data) =>
      fetch(`${API_URL}/videos/google-drive`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    sync: () =>
      fetch(`${API_URL}/videos/sync`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
    getAll: () =>
      fetch(`${API_URL}/videos/all`, { headers: getHeaders() }).then(handleResponse),
    getByLevel: (level) =>
      fetch(`${API_URL}/videos/level/${level}`, { headers: getHeaders() }).then(handleResponse),
    getBySheet: (level, sheet) =>
      fetch(`${API_URL}/videos/level/${level}/sheet/${sheet}`, { headers: getHeaders() }).then(handleResponse),
    delete: (id) =>
      fetch(`${API_URL}/videos/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  },

  levelRequests: {
    create: (data) =>
      fetch(`${API_URL}/level-requests`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) }).then(handleResponse),
    getMy: () =>
      fetch(`${API_URL}/level-requests/my-requests`, { headers: getHeaders() }).then(handleResponse),
    getAll: () =>
      fetch(`${API_URL}/level-requests`, { headers: getHeaders() }).then(handleResponse),
    getPending: () =>
      fetch(`${API_URL}/level-requests/pending`, { headers: getHeaders() }).then(handleResponse),
    getPendingCount: () =>
      fetch(`${API_URL}/level-requests/pending/count`, { headers: getHeaders() }).then(handleResponse),
    approve: (id, adminResponse) =>
      fetch(`${API_URL}/level-requests/${id}/approve`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ adminResponse }) }).then(handleResponse),
    reject: (id, adminResponse) =>
      fetch(`${API_URL}/level-requests/${id}/reject`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ adminResponse }) }).then(handleResponse),
  },
};

// Auth helpers
export function saveAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function getUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '../login.html';
}

export function requireAuth(role = null) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    window.location.href = '../login.html';
    return false;
  }

  if (role && user.role !== role) {
    window.location.href = '../login.html';
    return false;
  }

  return true;
}
