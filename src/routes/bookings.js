import { Router } from "express";
import { db } from "../db.js";
import { requireLogin } from "../middleware.js";
import { SLOTS } from "./spaces.js";

export const bookingsRouter = Router();
bookingsRouter.use(requireLogin);

bookingsRouter.get("/", (req, res) => {
  res.json(db.prepare(`
    SELECT b.id, b.date, b.slot, b.attendees, b.status,
           s.label AS seat, sp.id AS space_id, sp.name AS space_name
    FROM bookings b
    JOIN seats s ON s.id = b.seat_id
    JOIN spaces sp ON sp.id = s.space_id
    WHERE b.user_id = ? ORDER BY b.date DESC, b.slot`).all(req.session.userId));
});

bookingsRouter.post("/", (req, res) => {
  const { seatId, date, slot, attendees = "" } = req.body;
  if (!Number.isInteger(seatId) || !/^\d{4}-\d{2}-\d{2}$/.test(String(date)) || !SLOTS.includes(slot)) {
    return res.status(400).json({ error: "Invalid booking details" });
  }
  if (!db.prepare("SELECT 1 FROM seats WHERE id = ?").get(seatId)) {
    return res.status(404).json({ error: "Seat not found" });
  }
  try {
    const info = db.prepare(
      "INSERT INTO bookings (user_id, seat_id, date, slot, attendees) VALUES (?,?,?,?,?)"
    ).run(req.session.userId, seatId, date, slot, String(attendees).slice(0, 200));
    res.status(201).json({ id: Number(info.lastInsertRowid) });
  } catch (e) {
    if (e.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({ error: "That seat was just booked for this time" });
    }
    throw e;
  }
});

// WHERE user_id = ? means you can only change YOUR bookings
function changeStatus(from, to) {
  return (req, res) => {
    const r = db.prepare(
      `UPDATE bookings SET status = ? WHERE id = ? AND user_id = ? AND status IN (${from.map(() => "?").join(",")})`
    ).run(to, req.params.id, req.session.userId, ...from);
    r.changes ? res.json({ ok: true, status: to }) : res.status(404).json({ error: "Not found or not allowed" });
  };
}
bookingsRouter.post("/:id/cancel", changeStatus(["confirmed", "checked_in"], "cancelled"));
bookingsRouter.post("/:id/checkin", changeStatus(["confirmed"], "checked_in"));