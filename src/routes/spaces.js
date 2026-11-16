import { Router } from "express";
import { db } from "../db.js";

export const spacesRouter = Router();
export const SLOTS = ["09:00–10:00", "10:00–11:00", "13:00–14:00", "14:00–15:00"];

const parse = (s) => ({ ...s, facilities: JSON.parse(s.facilities), rules: JSON.parse(s.rules) });

spacesRouter.get("/slots", (req, res) => res.json(SLOTS));   // must come before /:id

spacesRouter.get("/", (req, res) => {
  const { type, q } = req.query;
  let rows = db.prepare("SELECT * FROM spaces ORDER BY distance").all().map(parse);
  if (type) rows = rows.filter((s) => s.type === type);
  if (q) {
    const needle = String(q).toLowerCase();
    rows = rows.filter((s) => `${s.name} ${s.building} ${s.facilities.join(" ")}`.toLowerCase().includes(needle));
  }
  res.json(rows);
});

spacesRouter.get("/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM spaces WHERE id = ?").get(req.params.id);
  row ? res.json(parse(row)) : res.status(404).json({ error: "Space not found" });
});

// Free seats for a date + slot
spacesRouter.get("/:id/availability", (req, res) => {
  const { date, slot } = req.query;
  if (!SLOTS.includes(slot) || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
    return res.status(400).json({ error: "date and slot required" });
  }
  res.json(db.prepare(`
    SELECT id, label FROM seats
    WHERE space_id = ? AND id NOT IN (
      SELECT seat_id FROM bookings WHERE date = ? AND slot = ? AND status != 'cancelled')
    ORDER BY id`).all(req.params.id, date, slot));
});