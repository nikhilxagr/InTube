import { v4 as uuidv4 } from 'uuid';

/**
 * Middleware that assigns or propagates a unique correlation ID per request.
 */
export function requestIdMiddleware(req, res, next) {
  const requestId = req.headers['x-request-id'] || uuidv4();
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
}
