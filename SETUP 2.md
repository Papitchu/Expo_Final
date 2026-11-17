# Setup: database, local development, Vercel

## Layout

```text
client/            React app (Vite). `npm run build` writes it to the root public/.
public/            build output only — what the browser may download. Not committed.
src/               Express server. Never public.
  index.js         entry point (Vercel looks for this file and uses its exported app)
  routes/          auth.js, spaces.js, bookings.js
  services/        rules.js (booking rules), data.js (SQL + status sweep)
  db.js session.js dates.js http.js
scripts/           schema.sql, seed-data.js, setup-db.js, local-db.js (run by you, not served)
vercel.json        SPA rewrite: every non-/api path serves index.html
```

## 1. Get a Postgres database

Pick one:

- **Hosted (needed for Vercel):** Project → Storage / Marketplace → add Neon or Supabase. It adds a
  connection string env var; this code reads `DATABASE_URL`, so add that name yourself if the
  integration used another one.
- **Local Postgres** you already run: use its connection string.
- **No install (PGlite):** run `npm run db:local` in a separate terminal and keep it open.
  It listens on `127.0.0.1:5433` and stores data in `.pglite/`. Set `PG_POOL_MAX=1` with it.

## 2. Run locally

```sh
npm run setup               # installs root (server) + client packages
cp .env.example .env        # fill in DATABASE_URL and SESSION_SECRET
npm run db:setup            # creates tables + sample spaces/seats (safe to re-run)
npm run dev                 # API on :3000, web on http://localhost:5173 (proxies /api)
```

Generate a secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

To test the production build locally: `npm run build && npm start`, then open http://localhost:3000.
The Vite dev server also listens on your LAN IP, so a phone on the same Wi-Fi can scan meeting-room QR invites.

### Upgrading an existing database

The schema changed (categories, seats per library, group bookings). If `db:setup` reports the old
schema, reset it — **this deletes all users and bookings**:

```sh
npm run db:setup -- --reset
```

## 3. Deploy on Vercel

1. Commit `package.json`, `package-lock.json` and `client/package-lock.json`. Never commit `.env`.
2. Project Settings → Environment Variables: add `DATABASE_URL` and `SESSION_SECRET`
   (optional: `INVITE_TTL_MINUTES`, default 15).
3. Run `npm run db:setup` once from your computer with `.env` pointing at the hosted database.
4. Push. Vercel runs `vercel-build` (builds the client into `public/`) and serves `src/index.js`
   as the function for `/api/*`. Test on a Preview deployment first.

## 4. Checks after the first deploy

```sh
curl -i https://YOUR-PREVIEW-URL/api/health            # 200 {"ok":true}
curl -i https://YOUR-PREVIEW-URL/api/spaces            # 401 (login required)
curl -i https://YOUR-PREVIEW-URL/bookings              # 200, the React app (deep link works)
curl -i https://YOUR-PREVIEW-URL/src/index.js          # must NOT return server code
curl -i https://YOUR-PREVIEW-URL/scripts/schema.sql    # must NOT return the schema
curl -i https://YOUR-PREVIEW-URL/package.json          # must NOT return package.json
```

Then in the browser: log in with an `@mail.kmutt.ac.th` address, refresh (you should stay logged in),
book a library seat, open "My bookings", and try the same seat/slot from a second account (rejected).
For a meeting room, open the QR link from two other accounts — it becomes confirmed at 3 people.

## Troubleshooting

| Message | Cause / fix |
|---|---|
| `DATABASE_URL is not set` / `SESSION_SECRET is not set` | `.env` missing or empty. It must be named `.env` (not `.env.txt`) in the project root. |
| `ECONNREFUSED ... 5432` / `5433` | Database not running. Start your Postgres, or `npm run db:local`. |
| `Invalid URL` | Malformed `DATABASE_URL` — URL-encode special characters in the password. |
| Hangs or errors with PGlite | Set `PG_POOL_MAX=1` (PGlite serves one connection). |
| Logged out after a deploy | `SESSION_SECRET` changed; that signs everyone out. |
| `--env-file` unknown | Node.js older than 20.6 — update Node. |
