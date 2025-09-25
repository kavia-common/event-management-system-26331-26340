'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'please_provide_a_secure_secret_in_env';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * PUBLIC_INTERFACE
 * Hash a plain text password.
 * @param {string} password
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
  /** Hash users' passwords using bcrypt. */
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * PUBLIC_INTERFACE
 * Compare a plain text password against a hash.
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
function comparePassword(password, hash) {
  /** Compare password and hash using bcrypt. */
  return bcrypt.compare(password, hash);
}

/**
 * PUBLIC_INTERFACE
 * Sign a JWT token with a payload.
 * @param {{id:number,email:string,name:string}} payload
 * @returns {string}
 */
function signToken(payload) {
  /** Sign JWT for authentication. */
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify a token and return the payload or null.
 * @param {string} token
 * @returns {object|null}
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (_e) {
    return null;
  }
}

module.exports = {
  hashPassword,
  comparePassword,
  signToken,
  verifyToken,
};
