// be/swagger/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';

// swagger.js
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sievent API Documentation',
      version: '1.0.0',
      description: 'Dokumentasi REST API untuk platform pembelian tiket event',
    },
    servers: [{ url: process.env.NEXT_PUBLIC_APP_URL , description: 'vercel' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'],
};


const swaggerSpec = swaggerJsdoc(options);
export default swaggerSpec;
