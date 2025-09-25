'use strict';

const { query } = require('../db');
const { hashPassword, comparePassword, signToken } = require('../utils/auth');

/**
 * Create a new user with name, email, and password.
 */
async function register({ name, email, password }) {
  if (!name || !email || !password) {
    const err = new Error('Missing required fields: name, email, password');
    err.status = 400;
    throw err;
  }
  // Check if exists
  const { rows: existing } = await query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }

  const password_hash = await hashPassword(password);
  const { rows: result } = await query(
    'INSERT INTO users (name, email, password_hash) VALUES (?,?,?)',
    [name, email, password_hash]
  );
  // mysql2 returns result as OkPacket, not rows; but we don't need it here
  const { rows: created } = await query('SELECT id, name, email, created_at FROM users WHERE email = ?', [email]);
  const user = created[0];
  const token = signToken({ id: user.id, email: user.email, name: user.name });
  return { user, token };
}

/**
 * Login with email and password.
 */
async function login({ email, password }) {
  if (!email || !password) {
    const err = new Error('Missing required fields: email, password');
    err.status = 400;
    throw err;
  }
  const { rows } = await query('SELECT id, name, email, password_hash FROM users WHERE email = ?', [email]);
  if (!rows.length) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const u = rows[0];
  const ok = await comparePassword(password, u.password_hash);
  if (!ok) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const token = signToken({ id: u.id, email: u.email, name: u.name });
  return {
    user: { id: u.id, name: u.name, email: u.email },
    token,
  };
}

module.exports = { register, login };
