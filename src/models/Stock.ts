// src/models/Stock.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Stock extends Model {}

Stock.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  itemName: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
}, { sequelize, modelName: 'Stock' });

export default Stock;
