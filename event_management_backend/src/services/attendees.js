'use strict';

const { query } = require('../db');

/**
 * Add attendee to an event
 */
async function addAttendee(eventId, userId, status = 'invited') {
  await query(
    `INSERT INTO attendees (event_id, user_id, status) VALUES (?,?,?)
     ON DUPLICATE KEY UPDATE status = VALUES(status)`,
    [eventId, userId, status]
  );
}

/**
 * Remove attendee from event
 */
async function removeAttendee(eventId, userId) {
  await query('DELETE FROM attendees WHERE event_id = ? AND user_id = ?', [eventId, userId]);
}

/**
 * Get attendees for an event
 */
async function listAttendees(eventId) {
  const { rows } = await query(
    `SELECT a.user_id, a.status, u.name, u.email
     FROM attendees a
     JOIN users u ON u.id = a.user_id
     WHERE a.event_id = ?
     ORDER BY u.name ASC`,
    [eventId]
  );
  return rows;
}

module.exports = {
  addAttendee,
  removeAttendee,
  listAttendees,
};
