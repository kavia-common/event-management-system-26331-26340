'use strict';

/**
 * Database module for MySQL connection pooling and helpers.
 * Uses environment variables for configuration:
 * - MYSQL_URL (optional, full connection string)
 * - MYSQL_HOST
 * - MYSQL_USER
 * - MYSQL_PASSWORD
 * - MYSQL_DB
 * - MYSQL_PORT
 */

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let pool;

/**
 * Create a connection pool based on environment variables.
 */
function createPool() {
  if (pool) return pool;

  const {
    MYSQL_URL,
    MYSQL_HOST,
    MYSQL_USER,
    MYSQL_PASSWORD,
    MYSQL_DB,
    MYSQL_PORT,
  } = process.env;

  const poolConfig = MYSQL_URL
    ? { uri: MYSQL_URL }
    : {
        host: MYSQL_HOST,
        user: MYSQL_USER,
        password: MYSQL_PASSWORD,
        database: MYSQL_DB,
        port: MYSQL_PORT ? Number(MYSQL_PORT) : 3306,
      };

  // mysql2/promise doesn't take 'uri' in createPool, so handle URL separately
  if (MYSQL_URL) {
    pool = mysql.createPool(MYSQL_URL);
  } else {
    pool = mysql.createPool({
      ...poolConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: 'Z',
      charset: 'utf8mb4',
    });
  }
  return pool;
}

/**
 * PUBLIC_INTERFACE
 * Execute a single SQL query with optional parameters.
 * @param {string} sql SQL statement
 * @param {Array} params parameter array
 * @returns {Promise<{rows: any[], fields: any[]}>}
 */
async function query(sql, params = []) {
  /** Execute a single SQL query and return rows and fields. */
  const p = createPool();
  const [rows, fields] = await p.execute(sql, params);
  return { rows, fields };
}

/**
 * PUBLIC_INTERFACE
 * Get a pooled connection to run multiple statements in a transaction.
 * Remember to release the connection when done.
 * @returns {Promise<import('mysql2/promise').PoolConnection>}
 */
async function getConnection() {
  /** Get a pooled connection for transactions and multiple ops. */
  const p = createPool();
  return p.getConnection();
}

module.exports = {
  query,
  getConnection,
  createPool,
};
