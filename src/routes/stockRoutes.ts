// src/routes/stockRoutes.ts
import { FastifyInstance } from 'fastify';
import { createStockItem } from '../controllers/stockController.js';

export default async (fastify: FastifyInstance) => {
  fastify.post('/stock', createStockItem);
  // Ajoutez d’autres routes pour mettre à jour ou supprimer les articles en stock.
};
