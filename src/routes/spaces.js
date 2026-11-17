import { Router } from 'express';
import { query } from '../db.js';
import { isValidDate, todayBangkok } from '../dates.js';
import { wrap } from '../http.js';
import { requireLogin } from '../session.js';
import { findSpace, listSpaces, slotAvailability } from '../services/data.js';

export const spacesRouter = Router();
spacesRouter.use(requireLogin);

const db = { query };

spacesRouter.get('/', wrap(async (req, res) => {
  res.json({ spaces: await listSpaces(db) });
}));

spacesRouter.get('/:id', wrap(async (req, res) => {
  const space = await findSpace(db, req.params.id);
  if (!space) return res.status(404).json({ error: 'ไม่พบพื้นที่' });
  res.json({ space });
}));

spacesRouter.get('/:id/availability', wrap(async (req, res) => {
  const date = req.query.date || todayBangkok();
  if (!isValidDate(date)) return res.status(400).json({ error: 'วันที่ไม่ถูกต้อง' });
  const space = await findSpace(db, req.params.id);
  if (!space) return res.status(404).json({ error: 'ไม่พบพื้นที่' });
  res.json({ date, slots: await slotAvailability(db, space, date) });
}));
