// src/routes/eventRoutes.ts
import { FastifyInstance } from 'fastify';
import { createEvent } from '../controllers/eventController.js';

export default async (fastify: FastifyInstance) => {
  fastify.post('/events', createEvent);
  // Ajoutez d’autres routes pour modifier ou supprimer les événements.
};
