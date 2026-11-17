import jwt from 'jsonwebtoken'

export const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-secret'
if (!process.env.JWT_SECRET) console.warn('[auth] JWT_SECRET not set — using an insecure dev secret')

export function signToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' })
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' })
  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = { id: payload.sub, email: payload.email }
    next()
  } catch {
    res.status(401).json({ error: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' })
  }
}
