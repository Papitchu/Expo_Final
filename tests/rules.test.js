// Booking-rule checks. Run with: npm test (no database needed — the rules are pure functions).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateCapacity, validateDateAndSlot, validateJoin } from '../src/services/rules.js';
import { addDays, currentSlot, todayBangkok } from '../src/dates.js';

const rejects = (fn, status) => assert.throws(fn, (error) => error.status === status);

test('library: one user per seat per slot', () => {
  const library = { category: 'library', seats: ['A1', 'A2'], capacity: 2 };
  assert.doesNotThrow(() => validateCapacity(library, [{ seatLabel: 'A1' }], 'A2'));
  rejects(() => validateCapacity(library, [{ seatLabel: 'A1' }], 'A1'), 409);
  rejects(() => validateCapacity(library, [], undefined), 400);
  rejects(() => validateCapacity(library, [], 'Z9'), 400);
});

test('co-working: individual bookings up to capacity', () => {
  const coworking = { category: 'coworking', capacity: 2 };
  assert.doesNotThrow(() => validateCapacity(coworking, [{}], undefined));
  rejects(() => validateCapacity(coworking, [{}, {}], undefined), 409);
});

test('meeting room: whole room per slot', () => {
  const meeting = { category: 'meeting', capacity: 8, minGroupSize: 3 };
  assert.doesNotThrow(() => validateCapacity(meeting, [], undefined));
  rejects(() => validateCapacity(meeting, [{}], undefined), 409);
});

test('meeting invite: join, duplicate, full, expired', () => {
  const now = new Date('2026-11-17T03:00:00Z');
  const booking = {
    status: 'pending_group',
    inviteExpiresAt: new Date(now.getTime() + 15 * 60 * 1000).toISOString(),
    participants: [1],
    space: { capacity: 3 },
  };
  assert.doesNotThrow(() => validateJoin(booking, 2, now));
  rejects(() => validateJoin(booking, 1, now), 409);
  rejects(() => validateJoin({ ...booking, participants: [1, 2, 3] }, 4, now), 409);
  rejects(() => validateJoin(booking, 2, new Date(now.getTime() + 16 * 60 * 1000)), 410);
  rejects(() => validateJoin({ ...booking, status: 'confirmed' }, 2, now), 404);
  rejects(() => validateJoin(null, 2, now), 404);
});

test('date/slot: 7-day window, real slots, not in the past', () => {
  const now = new Date('2026-11-17T03:30:00Z'); // 10:30 Bangkok
  const today = todayBangkok(now);
  assert.equal(currentSlot(now), '10:00');
  assert.doesNotThrow(() => validateDateAndSlot(today, '10:00', now)); // current slot still open
  assert.doesNotThrow(() => validateDateAndSlot(addDays(today, 7), '08:00', now));
  rejects(() => validateDateAndSlot(today, '09:00', now), 400); // already over
  rejects(() => validateDateAndSlot(addDays(today, 8), '08:00', now), 400);
  rejects(() => validateDateAndSlot(today, '20:00', now), 400); // not a slot
  rejects(() => validateDateAndSlot('2026-02-30', '10:00', now), 400);
});
