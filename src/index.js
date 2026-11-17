import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cookieSession from 'cookie-session';
import { spacesRouter } from './routes/spaces.js';
import { bookingsRouter } from './routes/bookings.js';

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not set (see .env.example)');
}

const app = express();
const isProd = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);

app.disable('x-powered-by');
if (isProd) app.set('trust proxy', 1);  // required for secure cookies behind Vercel's proxy

app.use(express.json({ limit: '10kb' }));
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET],
  httpOnly: true,
  sameSite: 'lax',
  secure: isProd,
  maxAge: 1000 * 60 * 60 * 8,
}));

app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});
app.use('/api/spaces', spacesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api', (req, res) => res.status(404).json({ error: 'ไม่พบเส้นทางนี้' }));

// Local development only. On Vercel, files in public/ are served by its CDN.
if (!process.env.VERCEL) {
  const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
  app.use(express.static(publicDir));
}

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  console.error(error);
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'ข้อมูลที่ส่งมาไม่ถูกต้อง' });
  }
  res.status(500).json({ error: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง' });
});

export default app;

if (!process.env.VERCEL) {
  app.listen(3000, () => console.log('http://localhost:3000'));
}
