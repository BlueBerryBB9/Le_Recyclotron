import { FastifyInstance } from 'fastify';
import * as stk_ctrl from '../controllers/itemController.js';

export default async (fastify: FastifyInstance) => {
  fastify.post('/items', stk_ctrl.createItem);
  fastify.get('/items', stk_ctrl.getAllItems);
  fastify.get('/items/:id',stk_ctrl.getItemById);
  fastify.get('/items/:status/', stk_ctrl.getItemByStatus);
  fastify.put('/items/:id', stk_ctrl.updateItemById);
  fastify.delete('/items/:id', stk_ctrl.deleteItemById);
};
