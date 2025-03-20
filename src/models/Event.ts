// src/models/Event.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import { z } from "zod";

class SEvent extends Model {}

SEvent.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        title: { type: DataTypes.STRING, allowNull: false },
        description: { type: DataTypes.STRING, allowNull: false },
        date: { type: DataTypes.DATE, allowNull: false },
        image: { type: DataTypes.STRING, allowNull: true },
    },
    { sequelize, modelName: "Event", timestamps: false },
);

const ZEventFull = z.object({
    id: z.number(),
    title: z.string(),
    image: z.string(),
    description: z.string(),
    date: z.coerce.date(),
});

export const ZEvent = ZEventFull.partial({
    image: true,
});

export const ZPartialEvent = ZEvent.partial().omit({ id: true }); // tous les champs sont devenus optionels
export const ZInputEvent = ZEvent.omit({ id: true }); // le même objet sans l'id

export type Event = z.infer<typeof ZEvent>; // Le type typescript qui correspond à l'objet
export type PartialEvent = z.infer<typeof ZPartialEvent>; // Le type typescript avec toutes les props optionelles
export type InputEvent = z.infer<typeof ZInputEvent>; // Le type typescript sans l'id

export default SEvent;
