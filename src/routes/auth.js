import { Router } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db.js";
import { requireLogin } from "../middleware.js";

export const authRouter = Router();
const DOMAIN = "@mail.kmutt.ac.th";

authRouter.post("/register", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  if (!email.endsWith(DOMAIN) || password.length < 8) {
    return res.status(400).json({ error: "Use a KMUTT email and a password of 8+ characters" });
  }
  const hash = await bcrypt.hash(password, 10);
  try {
    const info = db.prepare("INSERT INTO users (email, password_hash) VALUES (?,?)").run(email, hash);
    req.session.userId = Number(info.lastInsertRowid);
    res.status(201).json({ email });
  } catch {
    res.status(409).json({ error: "Email already registered" });
  }
});

authRouter.post("/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  const ok = user && await bcrypt.compare(String(req.body.password || ""), user.password_hash);
  if (!ok) return res.status(401).json({ error: "Wrong email or password" });
  req.session.userId = user.id;
  res.json({ email: user.email });
});

// CHANGED: cookie-session has no .destroy(); setting the session to null clears the cookie
authRouter.post("/logout", (req, res) => {
  req.session = null;
  res.json({ ok: true });
});

// CHANGED: handle a cookie whose user no longer exists
authRouter.get("/me", requireLogin, (req, res) => {
  const user = db.prepare("SELECT email FROM users WHERE id = ?").get(req.session.userId);
  if (!user) {
    req.session = null;
    return res.status(401).json({ error: "Please log in" });
  }
  res.json(user);
});