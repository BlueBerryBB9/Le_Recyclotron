// src/models/Event.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Event extends Model {}

Event.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
  date: { type: DataTypes.DATE, allowNull: false },
}, { sequelize, modelName: 'Event' });

export default Event;
