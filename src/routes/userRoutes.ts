import { FastifyInstance } from 'fastify';
import * as userController from '../controllers/userController.js';
import { UpdateUser } from '../models/User.js';
import { authenticate, authorize, isSelfOrAdmin } from '../middleware/auth.js';

export default async function userRoutes(fastify: FastifyInstance) {
  // Routes CRUD de base
  fastify.post('/users', userController.createUser);
  fastify.get('/users', userController.getAllUsers);
  fastify.get<{ Params: { id: string } }>('/users/:id', userController.getUserById);
  fastify.put<{ Params: { id: string }, Body: { first_name?: string; last_name?: string; email?: string; phone?: string; is_adherent?: boolean; sub_type?: string | null; password?: string; roles?: number[] } }>('/users/:id', userController.updateUser);
  fastify.delete<{ Params: { id: string } }>('/users/:id', userController.deleteUser);

  // Routes pour la gestion des rôles
  fastify.post<{ Params: { id: string }, Body: { roles: number[] } }>('/users/:id/roles', userController.addUserRoles);
  fastify.delete<{ Params: { id: string }, Body: { roles: number[] } }>('/users/:id/roles', userController.removeUserRoles);

  // Public routes
  fastify.post('/users', userController.createUser);

  // Protected routes
  fastify.get(
    '/users',
    { 
      onRequest: [
        authenticate,
        authorize(['Admin', 'Employee'])
      ]
    },
    userController.getAllUsers
  );

  fastify.get(
    '/users/:id',
    { 
      onRequest: [
        authenticate,
        isSelfOrAdmin
      ]
    },
    userController.getUserById
  );

  fastify.put(
    '/users/:id',
    { 
      onRequest: [
        authenticate,
        isSelfOrAdmin
      ]
    },
    userController.updateUser
  );

  fastify.delete(
    '/users/:id',
    { 
      onRequest: [
        authenticate,
        authorize(['Admin'])
      ]
    },
    userController.deleteUser
  );

  // Role management routes (Admin only)
  fastify.post(
    '/users/:id/roles',
    { 
      onRequest: [
        authenticate,
        authorize(['Admin'])
      ]
    },
    userController.addUserRoles
  );

  fastify.delete(
    '/users/:id/roles',
    { 
      onRequest: [
        authenticate,
        authorize(['Admin'])
      ]
    },
    userController.removeUserRoles
  );
}
 