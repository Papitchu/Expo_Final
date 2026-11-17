// Creates the tables and loads the sample spaces/seats. Safe to run more than once.
//   npm run db:setup              create/update
//   npm run db:setup -- --reset   DROP all tables first (deletes users and bookings!)
import fs from 'node:fs';
import { pool } from '../src/db.js';
import { spaces } from './seed-data.js';

const reset = process.argv.includes('--reset');
const schema = fs.readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');

async function hasOldSchema() {
  const { rows } = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'spaces'`,
  );
  return rows.length > 0 && !rows.some((r) => r.column_name === 'category');
}

try {
  if (reset) {
    await pool.query('DROP TABLE IF EXISTS booking_participants, bookings, seats, spaces, users CASCADE');
    console.log('Dropped existing tables.');
  } else if (await hasOldSchema()) {
    console.error(
      'This database still has the old table layout (spaces without "category").\n' +
      'Run `npm run db:setup -- --reset` to recreate it. This deletes existing users and bookings.',
    );
    process.exitCode = 1;
  }

  if (!process.exitCode) {
    await pool.query(schema);
    for (const space of spaces) {
      const capacity = space.seats ? space.seats.length : space.capacity;
      await pool.query(
        `INSERT INTO spaces (id, name, category, building, floor, lat, lng, capacity, min_group_size, amenities, rules)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name, category = EXCLUDED.category, building = EXCLUDED.building,
           floor = EXCLUDED.floor, lat = EXCLUDED.lat, lng = EXCLUDED.lng, capacity = EXCLUDED.capacity,
           min_group_size = EXCLUDED.min_group_size, amenities = EXCLUDED.amenities, rules = EXCLUDED.rules`,
        [space.id, space.name, space.category, space.building, space.floor, space.lat, space.lng,
          capacity, space.minGroupSize ?? null, space.amenities, space.rules],
      );
      for (const label of space.seats ?? []) {
        await pool.query(
          'INSERT INTO seats (space_id, label) VALUES ($1, $2) ON CONFLICT (space_id, label) DO NOTHING',
          [space.id, label],
        );
      }
    }
    console.log(`Database ready: ${spaces.length} spaces.`);
  }
} finally {
  await pool.end();
}
