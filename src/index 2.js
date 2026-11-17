import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieSession from 'cookie-session';
import { query } from './db.js';
import { HttpError } from './http.js';
import { authRouter } from './routes/auth.js';
import { bookingsRouter } from './routes/bookings.js';
import { spacesRouter } from './routes/spaces.js';
import { sweepStatuses } from './services/data.js';

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not set (see .env.example)');
}

const app = express();
const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

app.disable('x-powered-by');
if (isProd) app.set('trust proxy', 1);  // required for secure cookies behind Vercel's proxy

app.use(express.json({ limit: '10kb' }));
// Signed, httpOnly cookie holding the user id. 7 days, so returning users skip the login page.
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET],
  httpOnly: true,
  sameSite: 'lax',
  secure: isProd,
  maxAge: 1000 * 60 * 60 * 24 * 7,
}));

app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
// Expire unfilled meeting groups / complete finished slots before reading or booking.
app.use(['/api/spaces', '/api/bookings'], (req, res, next) => {
  sweepStatuses({ query }).then(() => next(), next);
});
app.use('/api/spaces', spacesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api', (req, res) => res.status(404).json({ error: 'ไม่พบเส้นทางนี้' }));

// Local only: serve the built React app (npm run build → public/). On Vercel, public/ is
// served by its CDN and vercel.json sends app routes like /join/abc to index.html.
if (!process.env.VERCEL) {
  const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
  const indexHtml = path.join(publicDir, 'index.html');
  app.use(express.static(publicDir));
  app.get(/^\/(?!api\/).*/, (req, res, next) => {
    if (!fs.existsSync(indexHtml)) return next();
    res.sendFile(indexHtml);
  });
}

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  if (error instanceof HttpError) return res.status(error.status).json({ error: error.message });
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'ข้อมูลที่ส่งมาไม่ถูกต้อง' });
  }
  console.error(error);
  res.status(500).json({ error: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง' });
});

export default app;

if (!process.env.VERCEL) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`API: http://localhost:${port}`));
}
