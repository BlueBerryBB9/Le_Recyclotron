import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_EXPIRES_IN = '24h';

export const generateToken = (user: { id: any; email: any; roles: any[]; }) => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      roles: user.roles.map(role => role.name)
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};