// Creates the tables and loads the sample spaces/seats. Safe to run more than once.
import fs from 'node:fs';
import { pool } from '../src/db.js';
import { spaces, seatLabels } from './seed-data.js';

const schema = fs.readFileSync(new URL('./schema.sql', import.meta.url), 'utf8');

try {
  await pool.query(schema);

  for (const space of spaces) {
    await pool.query(
      `INSERT INTO spaces (id, name, type, building, floor, distance, capacity, facilities, rules)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name, type = EXCLUDED.type, building = EXCLUDED.building,
         floor = EXCLUDED.floor, distance = EXCLUDED.distance, capacity = EXCLUDED.capacity,
         facilities = EXCLUDED.facilities, rules = EXCLUDED.rules`,
      [space.id, space.name, space.type, space.building, space.floor,
        space.distance, space.capacity, space.facilities, space.rules],
    );
    for (const label of seatLabels[space.id] || []) {
      await pool.query(
        'INSERT INTO seats (space_id, label) VALUES ($1, $2) ON CONFLICT (space_id, label) DO NOTHING',
        [space.id, label],
      );
    }
  }
  console.log('Database ready.');
} finally {
  await pool.end();
}
