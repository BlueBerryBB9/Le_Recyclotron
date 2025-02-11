import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import SUser, { ZPublicUser } from "./User.js";
import SEvent, { ZEvent } from "./Event.js";
import { z } from "zod";

class SRegistration extends Model {}

SRegistration.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        userId: {
            type: DataTypes.INTEGER,
            references: {
                model: "Users",
                key: "id",
            },
            primaryKey: true,
        },
        eventId: {
            type: DataTypes.INTEGER,
            references: {
                model: "Events",
                key: "id",
            },
            primaryKey: true,
        },
        seats: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    },
    { sequelize, modelName: "Registration", timestamps: true },
);

SUser.beforeDestroy(async (user) => {
    await SRegistration.destroy({ where: { userId: user.getDataValue("id") } });
});

SEvent.beforeDestroy(async (event) => {
    await SRegistration.destroy({
        where: { eventId: event.getDataValue("id") },
    });
});

export default SRegistration;

export const ZRegistration = z.object({
    id: z.number(),
    seats: z.number(),
    userId: z.number(),
    eventId: z.number(),
});

export const ZRegistrationOutput = z.object({
    id: z.number(),
    seats: z.number(),
    userId: z.number(),
    eventId: z.number(),
    event: ZEvent,
});

export const ZRegistrationListOutput = z.array(
    ZRegistration.extend({
        event: ZEvent,
    }),
);

export const ZEventWithRegistrations = ZEvent.extend({
    registrations: z.array(ZRegistration),
});

export const ZEventListOutput = z.array(ZEventWithRegistrations);

export const ZPartialRegistration = ZRegistration.partial().omit({ id: true }); // tous les champs sont devenus optionels
export const ZInputRegistration = ZRegistration.omit({ id: true }); // le même objet sans l'id

export type Registration = z.infer<typeof ZRegistration>; // Le type typescript qui correspond à l'objet
export type PartialRegistration = z.infer<typeof ZPartialRegistration>; // Le type typescript avec toutes les props optionelles
export type InputRegistration = z.infer<typeof ZInputRegistration>; // Le type typescript sans l'id
