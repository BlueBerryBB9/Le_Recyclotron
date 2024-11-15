import { FastifyInstance } from 'fastify';
import * as userController from '../controllers/userController.js';

export default async function userRoutes(fastify: FastifyInstance) {
  // Routes CRUD de base
  fastify.post('/users', userController.createUser);
  fastify.get('/users', userController.getAllUsers);
  fastify.get('/users/:id', userController.getUserById);
  fastify.put('/users/:id', userController.updateUser);
  fastify.delete('/users/:id', userController.deleteUser);

  // Routes pour la gestion des rôles
  fastify.post('/users/:id/roles', userController.addUserRoles);
  fastify.delete('/users/:id/roles', userController.removeUserRoles);
}