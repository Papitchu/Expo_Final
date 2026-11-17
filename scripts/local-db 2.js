// A local PostgreSQL for development, without installing Postgres: PGlite (Postgres compiled
// to WebAssembly) served over the normal Postgres protocol. Data is kept in .pglite/.
//   npm run db:local     then in .env: DATABASE_URL=postgres://postgres@127.0.0.1:5433/postgres
//                                      PG_POOL_MAX=1
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';

const port = Number(process.env.PGLITE_PORT || 5433);
const dataDir = process.env.PGLITE_DIR || '.pglite';

const db = await PGlite.create(dataDir);
const server = new PGLiteSocketServer({ db, port, host: '127.0.0.1' });
await server.start();
console.log(`Local Postgres (PGlite) on postgres://postgres@127.0.0.1:${port}/postgres  data: ${dataDir}/`);

async function shutdown() {
  await server.stop();
  await db.close();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
