// src/routes/employeeRoutes.ts
import { FastifyInstance } from 'fastify';
import { createEmployee } from '../controllers/employeeController.js';

export default async (fastify: FastifyInstance) => {
  fastify.post('/employees', createEmployee);
  // Ajoutez d’autres routes (PUT, DELETE) pour gérer les employés.
};
