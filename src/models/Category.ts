import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import z from "zod";

class SCategory extends Model {
    public id!: number;
    public name!: string;
}

SCategory.init(
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
    },
    {
        tableName: "categories",
        sequelize,
    },
);

export const ZCategory = z.object({
    id: z.number(),
    name: z.string(),
});

export const ZPartialCategory = ZCategory.partial(); // tous les champs sont devenus optionels
export const ZInputCategory = ZCategory.omit({ id: true }); // le même objet sans l'id

export type Category = z.infer<typeof ZCategory>; // Le type typescript qui correspond à l'objet
export type PartialCategory = z.infer<typeof ZPartialCategory>; // Le type typescript avec toutes les props optionelles
export type InputCategory = z.infer<typeof ZInputCategory>; // Le type typescript sans l'id

export default SCategory;
