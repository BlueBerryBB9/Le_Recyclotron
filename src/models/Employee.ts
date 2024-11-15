// src/models/Employee.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Employee extends Model {}

Employee.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, allowNull: false },
}, { sequelize, modelName: 'Employee' });

export default Employee;
