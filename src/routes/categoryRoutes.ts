import { FastifyInstance } from 'fastify';
import * as ctg_ctrl from '../controllers/categoryController.js';

export default async (fastify: FastifyInstance) => {
  fastify.post('/items', ctg_ctrl.createCategory);
  fastify.get('/items', ctg_ctrl.getAllCategories);
  fastify.get('/items/:id',ctg_ctrl.getCategoryById);
  fastify.put('/items/:id', ctg_ctrl.updateCategoryById);
  fastify.delete('/items/:id', ctg_ctrl.deleteCategoryById);
};
