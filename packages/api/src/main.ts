import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

// Swagger configuration
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation and testing interface',
    },
    servers: [
      {
        url: `http://${host}:${port}`,
        description: 'Development server',
      },
    ],
  },
  // Path to the API files with JSDoc comments
  apis: ['./src/**/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Swagger UI setup
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API endpoints
app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

// Swagger JSON endpoint
app.get('/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.listen(port, host, () => {
  console.log(`[ ready ] API available at http://${host}:${port}`);
  console.log(`[ ready ] Swagger UI available at http://${host}:${port}/docs`);
});
