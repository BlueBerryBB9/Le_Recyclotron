import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";
import Event from "./Event.js";
import { z } from "zod";

class SRegistration extends Model {}

SRegistration.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        date: { type: DataTypes.DATE, allowNull: false },
        seats: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    },
    { sequelize, modelName: "Registration" },
);

User.belongsToMany(Event, {
    as: "event",
    foreignKey: "eventId",
    through: SRegistration,
});
Event.belongsToMany(User, {
    as: "user",
    foreignKey: "userId",
    through: SRegistration,
});

export default SRegistration;

export const ZRegistration = z.object({
    id: z.number(),
    date: z.coerce.date(),
    seats: z.number(),
});

export const ZPartialRegistration = ZRegistration.partial(); // tous les champs sont devenus optionels
export const ZInputRegistration = ZRegistration.omit({ id: true }); // le même objet sans l'id

export type Registration = z.infer<typeof ZRegistration>; // Le type typescript qui correspond à l'objet
export type PartialRegistration = z.infer<typeof ZPartialRegistration>; // Le type typescript avec toutes les props optionelles
export type InputRegistration = z.infer<typeof ZInputRegistration>; // Le type typescript sans l'id
