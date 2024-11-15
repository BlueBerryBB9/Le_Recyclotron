// src/index.ts
import Fastify from 'fastify';
import sequelize from './config/database.js';
import employeeRoutes from './routes/userRoutes.js';
import stockRoutes from './routes/itemsRoutes.js';
import eventRoutes from './routes/eventRoutes.js';

const fastify = Fastify({ logger: true });

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to the database.');

    await sequelize.sync(); // Synchronisez les modèles avec la DB.

    fastify.register(employeeRoutes, { prefix: '/api' });
    fastify.register(stockRoutes, { prefix: '/api' });
    fastify.register(eventRoutes, { prefix: '/api' });

    await fastify.listen({ port: 3000 });
    console.log('Server is running on port 3000');
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

startServer();
