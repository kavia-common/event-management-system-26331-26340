'use strict';

const { verifyToken } = require('../utils/auth');

/**
 * PUBLIC_INTERFACE
 * Express middleware to require authentication via Bearer token.
 * Sets req.user when valid, otherwise responds 401.
 */
function requireAuth(req, res, next) {
  /** Middleware to enforce JWT auth on protected routes. */
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ status: 'error', message: 'Invalid token' });
  }
  req.user = payload;
  return next();
}

module.exports = { requireAuth };
