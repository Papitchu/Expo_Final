// Lets async route handlers throw: errors go to the Express error handler.
export const wrap = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

/** An error with an HTTP status and a message safe to show the user. */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
