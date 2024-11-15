import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';
import Event from './Event.js';

class Registration extends Model {}

Registration.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  date: { type: DataTypes.DATE, allowNull: false },
  seats: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
}, { sequelize, modelName: 'Registration' });

User.belongsToMany(Event, { through: Registration });
Event.belongsToMany(User, { through: Registration });

export default Registration;