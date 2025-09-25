const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { createPool } = require('./db');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    // Try to get a connection early to fail fast if DB is unreachable.
    const pool = createPool();
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('Database connection established.');

    const server = app.listen(PORT, HOST, () => {
      console.log(`Server running at http://${HOST}:${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

    module.exports = server;
  } catch (e) {
    console.error('Failed to start server due to DB connection error:', e.message);
    process.exit(1);
  }
}

start();
