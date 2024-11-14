// src/controllers/stockController.ts
import { FastifyReply, FastifyRequest } from 'fastify';
import Stock from '../models/Stock';

export const createStockItem = async (req: FastifyRequest, reply: FastifyReply) => {
  const { itemName, quantity } = req.body as { itemName: string; quantity: number };
  const item = await Stock.create({ itemName, quantity });
  reply.send(item);
};

// Ajoutez des méthodes pour mettre à jour ou supprimer les articles en stock.
