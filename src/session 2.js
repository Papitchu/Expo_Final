/** The logged-in user's id (from the signed session cookie), or null. */
export function currentUserId(req) {
  return req.session?.userId ?? null;
}

export function requireLogin(req, res, next) {
  if (currentUserId(req)) return next();
  res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
}
