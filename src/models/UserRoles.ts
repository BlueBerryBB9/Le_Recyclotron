import { Model } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Role from './Role.js';

class UserRole extends Model {}

UserRole.init({}, {
  sequelize,
  modelName: 'UserRole'
});

User.belongsToMany(Role, { through: UserRole });
Role.belongsToMany(User, { through: UserRole });

export default UserRole;