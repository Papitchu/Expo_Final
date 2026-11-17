// Lets async route handlers throw: errors go to the Express error handler.
export const wrap = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);
