export function requireLogin(req, res, next) {
  if (req.session.userId) return next();
  res.status(401).json({ error: "Please log in" });
}