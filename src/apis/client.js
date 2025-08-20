const BASE_URL = `https://${import.meta.env.VITE_API_BASE_URL}`;

async function handle(res, path) {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${path}`);
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

export function apiGet(path, { signal, params } = {}) {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin);
  if (params && typeof params === 'object') {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }
  return fetch(url, { signal }).then((r) => handle(r, url));
}

export function apiPost(path, body) {
  return fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }).then((r) => handle(r, path));
}

export function apiPatch(path, body) {
  return fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => handle(r, path));
}

export function apiDelete(path) {
  return fetch(`${BASE_URL}${path}`, { method: 'DELETE' }).then((r) => handle(r, path));
}
