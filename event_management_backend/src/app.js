const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');
const routes = require('./routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('../swagger');
const { ensureSchema } = require('./services/bootstrap');

// Load env
dotenv.config();

// Initialize express app
const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.set('trust proxy', true);

// Add security scheme to swagger dynamically
const swaggerWithSecurity = {
  ...swaggerSpec,
  components: {
    ...(swaggerSpec.components || {}),
    securitySchemes: {
      ...(swaggerSpec.components?.securitySchemes || {}),
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      }
    }
  }
};

app.use('/docs', swaggerUi.serve, (req, res, next) => {
  const host = req.get('host');           // may or may not include port
  let protocol = req.protocol;          // http or https

  const actualPort = req.socket.localPort;
  const hasPort = host.includes(':');
  
  const needsPort =
    !hasPort &&
    ((protocol === 'http' && actualPort !== 80) ||
     (protocol === 'https' && actualPort !== 443));
  const fullHost = needsPort ? `${host}:${actualPort}` : host;
  protocol = req.secure ? 'https' : protocol;

  const dynamicSpec = {
    ...swaggerWithSecurity,
    servers: [
      {
        url: `${protocol}://${fullHost}`,
      },
    ],
  };
  swaggerUi.setup(dynamicSpec)(req, res, next);
});

// Parse JSON request body
app.use(express.json());

// Ensure DB schema exists (non-blocking fire-and-forget with logging)
ensureSchema()
  .then(() => {
    console.log('Database schema ensured.');
  })
  .catch((e) => {
    console.error('Failed ensuring DB schema', e);
  });

// Mount routes
app.use('/', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  if (status >= 500) {
    console.error(err.stack || err);
  }
  res.status(status).json({
    status: 'error',
    message,
  });
});

module.exports = app;
