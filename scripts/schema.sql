CREATE TABLE IF NOT EXISTS users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,                       -- stays empty if you go OAuth-only
  is_guest BOOLEAN NOT NULL DEFAULT false,  -- temporary visitors until real sign-in exists
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS spaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  building TEXT NOT NULL,
  floor TEXT NOT NULL,
  distance INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  facilities TEXT[] NOT NULL DEFAULT '{}',
  rules TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS seats (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  space_id TEXT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  UNIQUE (space_id, label)
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  seat_id INTEGER NOT NULL REFERENCES seats(id),
  booking_date DATE NOT NULL,
  slot TEXT NOT NULL,
  attendees TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'checked_in', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One ACTIVE booking per seat, day and slot. The database enforces this, so two people
-- clicking at the same moment can never both get the seat. Cancelled bookings free it.
CREATE UNIQUE INDEX IF NOT EXISTS one_active_booking
  ON bookings (seat_id, booking_date, slot) WHERE status <> 'cancelled';

CREATE INDEX IF NOT EXISTS bookings_user_idx ON bookings (user_id, booking_date DESC);
