# Backend setup (step 1: database, spaces, bookings)

## Layout

```text
public/            everything the browser may download (index.html + src/ with the app)
src/               server code (Express). Never public.
  index.js         entry point (Vercel looks for this file)
  routes/          spaces.js, bookings.js
  db.js session.js dates.js slots.js http.js
scripts/           schema.sql, seed-data.js, setup-db.js (run by you, not served)
```

## 1. Create a Postgres database

Easiest on Vercel: Project -> Storage / Marketplace -> add a Postgres provider (Neon or Supabase).
It adds a connection-string environment variable to the project. This code reads `DATABASE_URL`;
if the integration names it differently, add `DATABASE_URL` yourself with the same value.
Any other Postgres (local, Neon, Supabase) works too.

## 2. Run locally

```sh
npm install express pg cookie-session
cp .env.example .env        # then fill in DATABASE_URL and SESSION_SECRET
npm run db:setup            # creates tables + sample spaces/seats (safe to re-run)
npm run dev                 # http://localhost:3000
```

Generate a secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

## 3. Deploy on Vercel

1. Commit `package.json` AND `package-lock.json` (created by `npm install`). Never commit `.env`.
2. In Project Settings -> Environment Variables add `DATABASE_URL` and `SESSION_SECRET`.
3. Run `npm run db:setup` once from your computer with `DATABASE_URL` pointing at the hosted database.
4. Push. Test on a Preview deployment first.

## 4. Checks after the first deploy

```sh
curl -i https://YOUR-PREVIEW-URL/api/spaces            # 200, JSON list of 3 spaces
curl -i https://YOUR-PREVIEW-URL/src/index.js          # must NOT return server code (expect 404)
curl -i https://YOUR-PREVIEW-URL/scripts/schema.sql    # expect 404
curl -i https://YOUR-PREVIEW-URL/package.json          # expect 404
```

Then in the browser: pick a space, book a seat, refresh and open "My bookings" (the booking should
still be there), book the same seat/slot again (you should land on the "not available" screen).

## Temporary pieces (replaced in the auth step)

- Login form and Google/Microsoft/ModLink buttons are still not connected.
- The first booking from a browser creates an anonymous guest user kept in a signed cookie.
  Clearing cookies means losing sight of those bookings.
- "Extend" still only shows a sample message. "Change" opens the schedule form and creates a NEW
  booking; it does not yet cancel the old one.
- Slot times exist in two places and must match: `public/src/pages/booking.js` and `src/slots.js`.
