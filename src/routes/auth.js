import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { wrap } from '../http.js';
import { currentUserId, requireLogin } from '../session.js';

export const authRouter = Router();

const EMAIL_PATTERN = /^[^\s@]+@mail\.kmutt\.ac\.th$/i;
const publicUser = (row) => ({ id: row.id, email: row.email, name: row.name });

/**
 * Demo login: the first sign-in with a KMUTT email creates the account; later sign-ins
 * must use the same password. Replace with university OAuth when it is available.
 */
authRouter.post('/login', wrap(async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!EMAIL_PATTERN.test(email)) return res.status(400).json({ error: 'กรุณาใช้อีเมล @mail.kmutt.ac.th' });
  if (password.length < 6) return res.status(400).json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });

  let { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  let user = rows[0];

  if (user) {
    const ok = user.password_hash && (await bcrypt.compare(password, user.password_hash));
    if (!ok) return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
  } else {
    const hash = await bcrypt.hash(password, 10);
    ({ rows } = await query(
      `INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING RETURNING *`,
      [email, email.split('@')[0], hash],
    ));
    user = rows[0];
    // Lost a race with a parallel first login for the same email: ask them to retry.
    if (!user) return res.status(409).json({ error: 'กรุณาลองเข้าสู่ระบบอีกครั้ง' });
  }

  req.session.userId = user.id;
  res.json({ user: publicUser(user) });
}));

authRouter.post('/logout', (req, res) => {
  req.session = null; // cookie-session: clears the cookie
  res.json({ ok: true });
});

authRouter.get('/me', requireLogin, wrap(async (req, res) => {
  const { rows } = await query('SELECT id, email, name FROM users WHERE id = $1', [currentUserId(req)]);
  if (!rows[0]) {
    req.session = null; // cookie for a user that no longer exists
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  }
  res.json({ user: publicUser(rows[0]) });
}));
