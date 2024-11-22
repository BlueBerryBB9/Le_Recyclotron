import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import z from "zod";

enum ItemStatus {
    SALABLE = 0,
    UNSALABLE,
    MATERIAL,
    REPARABLE,
}

class SItem extends Model {
    public id!: number;
    public name!: string;
    public status!: ItemStatus;
    public material!: string;
    public image!: string;
    public date!: Date;
}

SItem.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: new DataTypes.STRING(128),
            allowNull: false,
        },
        status: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
        },
        material: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING(256),
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        tableName: "items",
        sequelize,
    },
);

export const ZItem = z.object({
    id: z.number(),
    name: z.string(),
    status: z.nativeEnum(ItemStatus),
    material: z.string(),
    image: z.string(),
    date: z.coerce.date(),
});

export const ZPartialItem = ZItem.partial(); // tous les champs sont devenus optionels
export const ZInputItem = ZItem.omit({ id: true }); // le même objet sans l'id

export type Item = z.infer<typeof ZItem>; // Le type typescript qui correspond à l'objet
export type PartialItem = z.infer<typeof ZPartialItem>; // Le type typescript avec toutes les props optionelles
export type InputItem = z.infer<typeof ZInputItem>; // Le type typescript sans l'id

export default SItem;
