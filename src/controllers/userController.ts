import { FastifyRequest, FastifyReply } from 'fastify';
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

// Créer un nouvel utilisateur
export const createUser = async (
  request: FastifyRequest<{ Body: CreateUser }>,
  reply: FastifyReply
) => {
  try {
    const userData = ZCreateUser.parse(request.body);
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = await SUser.create({
      ...userData,
      password: hashedPassword
    });

    // If roles are provided, associate them
    if (userData.roles && userData.roles.length > 0) {
      const roles = await SRole.findAll({
        where: {
          id: userData.roles
        }
      });
      await user.set('roles', roles);
    }

    // Fetch the user with roles
    const userWithRoles = await SUser.findByPk(user.id, {
      include: [{ model: SRole, attributes: ['id', 'name'] }],
      attributes: { exclude: ['password'] }
    });

    return reply.status(201).send(userWithRoles);
  } catch (error) {
    return handleError(error, reply);
  }
};

// Récupérer tous les utilisateurs
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

// Récupérer un utilisateur par ID
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

// Mettre à jour un utilisateur
export const updateUser = async (
  request: FastifyRequest<{ Params: { id: string }; Body:UpdateUser }>,
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

    // If password is being updated, hash it
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    await user.update(userData);

    // Update roles if provided
    if (userData.roles) {
      const roles = await SRole.findAll({
        where: {
          id: userData.roles
        }
      });
      await user.set('roles', roles);
    }

    // Fetch updated user with roles
    const updatedUser = await SUser.findByPk(user.id, {
      include: [{ model: SRole, attributes: ['id', 'name'] }],
      attributes: { exclude: ['password'] }
    });

    return reply.send(updatedUser);
  } catch (error) {
    return handleError(error, reply);
  }
};

// Supprimer un utilisateur
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

// Ajouter des rôles à un utilisateur
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
        id: (request.body as { roles: number[] }).roles
      }
    });

    await user.$add('roles', roles);

    // Fetch updated user with roles
    const updatedUser = await SUser.findByPk(user.id, {
      include: [{ model: SRole, attributes: ['id', 'name'] }],
      attributes: { exclude: ['password'] }
    });

    return reply.send(updatedUser);
  } catch (error) {
    return handleError(error, reply);
  }
};

// Supprimer des rôles d'un utilisateur
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
        id: (request.body as { roles: number[] }).roles
      }
    });

    await user.$remove('roles', roles);

    // Fetch updated user with roles
    const updatedUser = await SUser.findByPk(user.id, {
      include: [{ model: SRole, attributes: ['id', 'name'] }],
      attributes: { exclude: ['password'] }
    });

    return reply.send(updatedUser);
  } catch (error) {
    return handleError(error, reply);
  }
};








