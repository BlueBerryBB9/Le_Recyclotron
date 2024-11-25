import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import z from "zod";

class SRole extends Model {
    public id!: number;
    public name!: string;
}

SRole.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true,
            validate: {
                isIn: [["Admin", "Repairer", "CM", "Employee", "Client"]],
            },
        },
    },
    {
        sequelize,
        modelName: "Role",
    },
);

export const ZRole = z.object({
    id: z.number(),
    name: z.string(),
});

export const ZPartialCategory = ZRole.partial(); // tous les champs sont devenus optionels
export const ZInputCategory = ZRole.omit({ id: true }); // le même objet sans l'id

export type Category = z.infer<typeof ZRole>; // Le type typescript qui correspond à l'objet
export type PartialCategory = z.infer<typeof ZPartialCategory>; // Le type typescript avec toutes les props optionelles
export type InputCategory = z.infer<typeof ZInputCategory>; // Le type typescript sans l'id

export default SRole;
