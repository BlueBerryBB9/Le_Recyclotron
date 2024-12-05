import bcrypt from 'bcrypt';
import { generateToken } from '../config/auth.js';
import SUser from '../models/User.js';
import SRole from '../models/Role.js';
import { loginSchema, validateRequest } from '../error/validation.js';
import { handleError } from '../error/error.js';
import { Identifier } from 'sequelize';

export const login = async (request: any, reply: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: { error: string; message: string; }): any; new(): any; }; }; send: (arg0: { token: any; user: { id: number; email: string; first_name: string; last_name: string; roles: any; }; }) => any; }) => {
  try {
    const { email, password } = await validateRequest(loginSchema)(request);

    const user = await SUser.findOne({
      where: { email },
      include: [{ 
        model: SRole,
        attributes: ['id', 'name']
      }]
    });

    if (!user) {
      return reply.status(401).send({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return reply.status(401).send({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user);

    return reply.send({
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        roles: user.Roles.map((role: { name: any; }) => role.name)
      }
    });
  } catch (error) {
    return handleError(error, reply);
  }
};

export const getCurrentUser = async (request: { user: { id: Identifier | undefined; }; }, reply: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: { error: string; message: string; }): any; new(): any; }; }; send: (arg0: SUser) => any; }) => {
  try {
    const user = await SUser.findByPk(request.user.id, {
      include: [{ 
        model: SRole,
        attributes: ['id', 'name']
      }],
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