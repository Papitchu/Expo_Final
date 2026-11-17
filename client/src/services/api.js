const TOKEN_KEY = 'seat.token'

export const tokenStore = {
  get: () => {
    try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
  },
  set: (token) => {
    try { localStorage.setItem(TOKEN_KEY, token) } catch { /* storage unavailable */ }
  },
  clear: () => {
    try { localStorage.removeItem(TOKEN_KEY) } catch { /* storage unavailable */ }
  },
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

let onUnauthorized = () => {}
/** AuthContext registers a logout callback for expired/invalid tokens. */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

export async function api(path, { method = 'GET', body } = {}) {
  const token = tokenStore.get()
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (res.status === 401 && token) onUnauthorized()
  if (!res.ok) throw new ApiError(data.error || 'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ', res.status)
  return data
}
