import express from "express";
import cookieSession from "cookie-session";
import path from "node:path";
import { ROOT, SRC } from "./paths.js";
import { authRouter } from "./routes/auth.js";
import { spacesRouter } from "./routes/spaces.js";
import { bookingsRouter } from "./routes/bookings.js";

if (!process.env.SESSION_SECRET) throw new Error("Set SESSION_SECRET in .env");

const app = express();
const isProd = process.env.NODE_ENV === "production";
if (isProd) app.set("trust proxy", 1);   // needed behind Render/Railway for secure cookies

app.use(cookieSession({
  name: "session",
  keys: [process.env.SESSION_SECRET],
  httpOnly: true, sameSite: "lax", secure: isProd,
  maxAge: 1000 * 60 * 60 * 8,
}));

// ---- API ----
app.use("/api/auth", authRouter);
app.use("/api/spaces", spacesRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api", (req, res) => res.status(404).json({ error: "Not found" }));

// ---- Frontend: WHITELIST only. src/server is deliberately not reachable. ----
app.get("/", (req, res) => res.sendFile(path.join(ROOT, "index.html")));

for (const dir of ["app", "data", "pages", "ui"]) {
  app.use(`/src/${dir}`, express.static(path.join(SRC, dir)));
}
for (const file of ["main.js", "app.js", "api.js", "styles.css"]) {
  app.get(`/src/${file}`, (req, res) => res.sendFile(path.join(SRC, file)));
}

app.listen(3000, () => console.log("http://localhost:3000"));