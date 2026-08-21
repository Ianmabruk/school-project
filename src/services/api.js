const API_URL = import.meta.env.VITE_API_URL || '';

function getHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function get(path) {
  const res = await fetch(`${API_URL}${path}`, { headers: getHeaders() });
  if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
  return res.json();
}

export async function post(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
  return res.json();
}

export async function put(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
  return res.json();
}

export async function remove(path) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
  return res.status;
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/api/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');
  return res.json();
}
