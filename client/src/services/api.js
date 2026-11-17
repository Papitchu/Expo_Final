// The session lives in an httpOnly cookie set by the server; fetch sends it automatically
// (same origin: Vite proxies /api in dev, Vercel serves both in production).

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

let onUnauthorized = () => {}
/** AuthContext registers a callback for expired/invalid sessions. */
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler
}

export async function api(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ', 0)
  }
  const data = await res.json().catch(() => ({}))
  if (res.status === 401 && !path.startsWith('/auth/')) onUnauthorized()
  if (!res.ok) throw new ApiError(data.error || 'เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ', res.status)
  return data
}
