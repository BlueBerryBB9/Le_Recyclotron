// src/models/Payment.ts
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import { z } from 'zod';
import User from '../models/User.js'

class SPayment extends Model {}

SPayment.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  type: { type: DataTypes.INTEGER },
  date: { type: DataTypes.DATE, allowNull: false },
}, { sequelize, modelName: 'Payment' });

SPayment.belongsTo(User)
User.hasMany(SPayment)

export default SPayment;

export const ZPayment = z.object({
  id: z.number(),
  amount: z.number(),
  type: z.number(),
  id_user: z.number(),
  date: z.coerce.date()
})

export const ZPartialPayment = ZPayment.partial(); // tous les champs sont devenus optionels
export const ZInputPayment = ZPayment.omit({ id: true }); // le même objet sans l'id

export type Payment = z.infer<typeof ZPayment>; // Le type typescript qui correspond à l'objet
export type PartialPayment = z.infer<typeof ZPartialPayment>; // Le type typescript avec toutes les props optionelles
export type InputPayment = z.infer<typeof ZInputPayment>; // Le type typescript sans l'id
