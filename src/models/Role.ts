import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import z from "zod";

class SRole extends Model {}

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
                isIn: [["admin", "rh", "repairer", "CM", "employee", "client"]],
            },
        },
    },
    {
        sequelize,
        modelName: "Role",
        timestamps: false,
    },
);

export const ZRole = z.object({
    id: z.number(),
    name: z.string(),
});

export const ZPartialRole = ZRole.partial().omit({ id: true }); // tous les champs sont devenus optionels
export const ZInputRole = ZRole.omit({ id: true }); // le même objet sans l'id
export const ZRoleList = z.array(ZRole);

export type RoleList = z.infer<typeof ZRoleList>;
export type Role = z.infer<typeof ZRole>; // Le type typescript qui correspond à l'objet
export type PartialRole = z.infer<typeof ZPartialRole>; // Le type typescript avec toutes les props optionelles
export type InputRole = z.infer<typeof ZInputRole>; // Le type typescript sans l'id

export default SRole;
