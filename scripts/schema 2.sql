-- SeatSense schema (PostgreSQL). Safe to run more than once.

CREATE TABLE IF NOT EXISTS users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT,                       -- stays empty if you go OAuth-only
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS spaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('library', 'coworking', 'meeting')),
  building TEXT NOT NULL,
  floor TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),  -- library: number of seats
  min_group_size INTEGER,                           -- meeting rooms only
  amenities TEXT[] NOT NULL DEFAULT '{}',
  rules TEXT[] NOT NULL DEFAULT '{}'
);

-- Individually bookable seats (library spaces only).
CREATE TABLE IF NOT EXISTS seats (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  space_id TEXT NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  UNIQUE (space_id, label)
);

CREATE TABLE IF NOT EXISTS bookings (
  id TEXT PRIMARY KEY,                               -- e.g. BK-1A2B3C4D
  owner_id INTEGER NOT NULL REFERENCES users(id),
  space_id TEXT NOT NULL REFERENCES spaces(id),
  seat_id INTEGER REFERENCES seats(id),              -- library only
  booking_date DATE NOT NULL,
  slot TEXT NOT NULL,                                -- start time, e.g. '09:00'
  status TEXT NOT NULL
    CHECK (status IN ('pending_group', 'confirmed', 'checked_in', 'cancelled', 'expired', 'completed')),
  invite_token TEXT UNIQUE,                          -- meeting rooms while pending_group
  invite_expires_at TIMESTAMPTZ,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Everyone in a booking, including the owner. Meeting rooms have 3+ rows.
CREATE TABLE IF NOT EXISTS booking_participants (
  booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (booking_id, user_id)
);

-- One active booking per library seat, day and slot. The database enforces this, so two
-- people clicking at the same moment can never both get the seat.
CREATE UNIQUE INDEX IF NOT EXISTS one_active_seat_booking
  ON bookings (seat_id, booking_date, slot)
  WHERE seat_id IS NOT NULL AND status IN ('pending_group', 'confirmed', 'checked_in');

CREATE INDEX IF NOT EXISTS bookings_space_slot_idx ON bookings (space_id, booking_date, slot);
CREATE INDEX IF NOT EXISTS participants_user_idx ON booking_participants (user_id);
