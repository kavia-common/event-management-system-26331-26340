'use strict';

const { query } = require('../db');

/**
 * Validate event payload
 */
function validateEventPayload(payload) {
  const { title, start_time, end_time } = payload;
  if (!title || !start_time || !end_time) {
    const err = new Error('Missing required fields: title, start_time, end_time');
    err.status = 400;
    throw err;
  }
  const start = new Date(start_time);
  const end = new Date(end_time);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
    const err = new Error('Invalid date range');
    err.status = 400;
    throw err;
  }
}

/**
 * Create an event
 */
async function createEvent(payload, userId) {
  validateEventPayload(payload);
  const { title, description = null, location = null, start_time, end_time } = payload;
  await query(
    `INSERT INTO events (title, description, location, start_time, end_time, created_by)
     VALUES (?,?,?,?,?,?)`,
    [title, description, location, new Date(start_time), new Date(end_time), userId]
  );
}

/**
 * Get an event by id
 */
async function getEventById(id) {
  const { rows } = await query(
    `SELECT e.*, u.name as creator_name, u.email as creator_email
     FROM events e JOIN users u ON u.id = e.created_by
     WHERE e.id = ?`,
    [id]
  );
  return rows[0] || null;
}

/**
 * List events with optional pagination
 */
async function listEvents({ page = 1, limit = 20 }) {
  const p = Math.max(1, Number(page));
  const l = Math.min(100, Math.max(1, Number(limit)));
  const offset = (p - 1) * l;

  const { rows: items } = await query(
    `SELECT e.*, u.name as creator_name
     FROM events e JOIN users u ON u.id = e.created_by
     ORDER BY e.start_time DESC
     LIMIT ? OFFSET ?`,
    [l, offset]
  );
  const { rows: totalRows } = await query('SELECT COUNT(*) as count FROM events');
  const total = totalRows[0]?.count || 0;

  return { items, page: p, limit: l, total };
}

/**
 * Update event by id (only owner can update - enforced at controller using req.user)
 */
async function updateEvent(id, payload) {
  const fields = [];
  const params = [];
  const allowed = ['title', 'description', 'location', 'start_time', 'end_time'];
  for (const k of allowed) {
    if (payload[k] !== undefined) {
      fields.push(`${k} = ?`);
      if (k === 'start_time' || k === 'end_time') {
        params.push(new Date(payload[k]));
      } else {
        params.push(payload[k]);
      }
    }
  }
  if (!fields.length) return;
  params.push(id);
  await query(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`, params);
}

/**
 * Delete event by id
 */
async function deleteEvent(id) {
  await query('DELETE FROM events WHERE id = ?', [id]);
}

/**
 * Check if the given user is the event owner
 */
async function isOwner(eventId, userId) {
  const { rows } = await query('SELECT id FROM events WHERE id = ? AND created_by = ?', [eventId, userId]);
  return rows.length > 0;
}

module.exports = {
  createEvent,
  getEventById,
  listEvents,
  updateEvent,
  deleteEvent,
  isOwner,
};
