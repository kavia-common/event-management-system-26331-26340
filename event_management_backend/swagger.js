const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Event Management API',
      version: '1.0.0',
      description: 'REST API for managing events, attendees, and authentication.',
    },
    tags: [
      { name: 'Auth', description: 'User authentication' },
      { name: 'Events', description: 'Event and attendee management' },
    ],
  },
  apis: ['./src/routes/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
