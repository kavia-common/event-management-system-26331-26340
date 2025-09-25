'use strict';

const { query } = require('../db');

/**
 * Ensures the database schema (tables and indexes) exist.
 * This function is idempotent and safe to run on startup.
 */
async function ensureSchema() {
  // Users table
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Events table
  await query(`
    CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      location VARCHAR(255),
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      created_by INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT fk_events_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // Attendees table
  await query(`
    CREATE TABLE IF NOT EXISTS attendees (
      id INT AUTO_INCREMENT PRIMARY KEY,
      event_id INT NOT NULL,
      user_id INT NOT NULL,
      status ENUM('invited', 'confirmed', 'declined') DEFAULT 'invited',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_event_user (event_id, user_id),
      CONSTRAINT fk_attendees_event FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      CONSTRAINT fk_attendees_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

module.exports = { ensureSchema };
