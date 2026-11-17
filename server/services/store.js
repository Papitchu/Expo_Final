import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const seedDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data')
// DATA_DIR lets tests/deploys keep runtime users/bookings outside the repo.
const dataDir = process.env.DATA_DIR || seedDir

function filePath(name) {
  return path.join(name === 'spaces' ? seedDir : dataDir, `${name}.json`)
}

function read(name) {
  const file = filePath(name)
  if (!fs.existsSync(file)) return []
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function write(name, rows) {
  const file = filePath(name)
  const tmp = `${file}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(rows, null, 2))
  fs.renameSync(tmp, file)
}

// Spaces are static seed data; load once.
const spaces = read('spaces').map((space) => ({
  ...space,
  capacity: space.seats ? space.seats.length : space.capacity,
}))

export const store = {
  spaces: () => spaces,
  findSpace: (id) => spaces.find((space) => space.id === id),

  users: () => read('users'),
  saveUsers: (rows) => write('users', rows),

  bookings: () => read('bookings'),
  saveBookings: (rows) => write('bookings', rows),
}
