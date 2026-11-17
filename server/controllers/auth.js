import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { signToken } from '../middleware/auth.js'
import { store } from '../services/store.js'

const EMAIL_PATTERN = /^[^\s@]+@mail\.kmutt\.ac\.th$/i

function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name }
}

/**
 * Demo login: first sign-in with a KMUTT email registers the account;
 * later sign-ins must use the same password.
 */
export async function login(req, res) {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')

  if (!EMAIL_PATTERN.test(email)) return res.status(400).json({ error: 'กรุณาใช้อีเมล @mail.kmutt.ac.th' })
  if (password.length < 6) return res.status(400).json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' })

  const users = store.users()
  let user = users.find((u) => u.email === email)

  if (user) {
    if (!(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' })
    }
  } else {
    user = {
      id: crypto.randomUUID(),
      email,
      name: email.split('@')[0],
      passwordHash: await bcrypt.hash(password, 10),
      createdAt: new Date().toISOString(),
    }
    users.push(user)
    store.saveUsers(users)
  }

  res.json({ token: signToken(user), user: publicUser(user) })
}

export function me(req, res) {
  const user = store.users().find((u) => u.id === req.user.id)
  if (!user) return res.status(401).json({ error: 'ไม่พบบัญชีผู้ใช้' })
  res.json({ user: publicUser(user) })
}
