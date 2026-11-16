import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./paths.js";

fs.mkdirSync(path.join(ROOT, "storage"), { recursive: true });
export const db = new Database(path.join(ROOT, "storage", "seatsense.db"));
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS spaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL, type TEXT NOT NULL,
  building TEXT, floor TEXT,
  distance INTEGER, capacity INTEGER,
  facilities TEXT NOT NULL,   -- JSON array
  rules TEXT NOT NULL         -- JSON array
);
CREATE TABLE IF NOT EXISTS seats (
  id INTEGER PRIMARY KEY,
  space_id TEXT NOT NULL REFERENCES spaces(id),
  label TEXT NOT NULL,
  UNIQUE (space_id, label)
);
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  seat_id INTEGER NOT NULL REFERENCES seats(id),
  date TEXT NOT NULL,
  slot TEXT NOT NULL,
  attendees TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'confirmed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
-- Only one ACTIVE booking per seat/date/slot. A cancelled booking frees the seat.
-- (My earlier plain UNIQUE constraint would have kept cancelled seats locked.)
CREATE UNIQUE INDEX IF NOT EXISTS one_active_booking
  ON bookings (seat_id, date, slot) WHERE status != 'cancelled';
`);