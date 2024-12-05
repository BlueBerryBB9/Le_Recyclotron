import { FastifyRequest, FastifyReply } from 'fastify';
import { authenticate, authorize, isSelfOrAdmin } from '../middleware/auth.js';
import bcrypt from 'bcrypt';
import SUser, { 
  ZCreateUser, 
  ZUpdateUser, 
  CreateUser,
  UpdateUser
} from '../models/User.js';
import SRole from '../models/Role.js';
import { Error, ValidationError } from 'sequelize';



// Custom type for requests with params
interface RequestWithParams extends FastifyRequest {
  params: {
    id: string;
  };
}

// Gestionnaire d'erreurs centralisé
const handleError = (error: any, reply: FastifyReply) => {
  console.error('Error:', error);

  if (error instanceof ValidationError) {
    return reply.status(400).send({
      error: 'Validation Error',
      details: error.errors.map(err => ({
        field: err.path,
        message: err.message
      }))
    });
  }

  if (error.code === 'P2002') {
    return reply.status(409).send({
      error: 'Conflict',
      message: 'Resource already exists'
    });
  }

  return reply.status(500).send({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  });
};

// Create User
export const createUser = async (
  request: FastifyRequest<{ Body: CreateUser }>,
  reply: FastifyReply
) => {
  try {
    const userData = ZCreateUser.parse(request.body);
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await SUser.create({
      ...userData,
      password: hashedPassword
    });

    const userWithRoles = await SUser.findByPk(user.id, {
      include: [{ model: SRole, attributes: ['id', 'name'] }],
      attributes: { exclude: ['password'] }
    });

    return reply.status(201).send(userWithRoles);
  } catch (error) {
    return handleError(error, reply);
  }
};

// Get All Users
export const getAllUsers = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const users = await SUser.findAll({
      include: [{ model: SRole, attributes: ['id', 'name'] }],
      attributes: { exclude: ['password'] }
    });
    return reply.send(users);
  } catch (error) {
    return handleError(error, reply);
  }
};

// Get User by ID
export const getUserById = async (
  request: RequestWithParams,
  reply: FastifyReply
) => {
  try {
    const user = await SUser.findByPk(request.params.id, {
      include: [{ model: SRole, attributes: ['id', 'name'] }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    return reply.send(user);
  } catch (error) {
    return handleError(error, reply);
  }
};

// Update User
export const updateUser = async (
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateUser }>,
  reply: FastifyReply
) => {
  try {
    const userData = ZUpdateUser.parse(request.body);
    const user = await SUser.findByPk(request.params.id);

    if (!user) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    await user.update(userData);

    const updatedUser = await SUser.findByPk(user.id, {
      include: [{ model: SRole, attributes: ['id', 'name'] }],
      attributes: { exclude: ['password'] }
    });

    return reply.send(updatedUser);
  } catch (error) {
    return handleError(error, reply);
  }
};

// Delete User
export const deleteUser = async (
  request: RequestWithParams,
  reply: FastifyReply
) => {
  try {
    const user = await SUser.findByPk(request.params.id);

    if (!user) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    await user.destroy();
    return reply.status(204).send();
  } catch (error) {
    return handleError(error, reply);
  }
};

// Add User Roles
export const addUserRoles = async (
  request: FastifyRequest<{ Params: { id: string }; Body: { roles: number[] } }>,
  reply: FastifyReply
) => {
  try {
    const user = await SUser.findByPk(request.params.id);
    if (!user) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    const roles = await SRole.findAll({
      where: {
        id: request.body.roles
      }
    });

    await user.$add('roles', roles);

    const updatedUser = await SUser.findByPk(user.id, {
      include: [{ model: SRole, attributes: ['id', 'name'] }],
      attributes: { exclude: ['password'] }
    });

    return reply.send(updatedUser);
  } catch (error) {
    return handleError(error, reply);
  }
};

// Remove User Roles
export const removeUserRoles = async (
  request: FastifyRequest<{ Params: { id: string }; Body: { roles: number[] } }>,
  reply: FastifyReply
) => {
  try {
    const user = await SUser.findByPk(request.params.id);
    if (!user) {
      return reply.status(404).send({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    const roles = await SRole.findAll({
      where: {
        id: request.body.roles
      }
    });

    await user.$remove('roles', roles);

    const updatedUser = await SUser.findByPk(user.id, {
      include: [{ model: SRole, attributes: ['id', 'name'] }],
      attributes: { exclude: ['password'] }
    });

    return reply.send(updatedUser);
  } catch (error) {
    return handleError(error, reply);
  }
};