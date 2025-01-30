import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import z from "zod";

class SCategory extends Model {}

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
        modelName: "Category",
        sequelize,
    },
);

SCategory.hasMany(SCategory, {
    foreignKey: "parentCategoryId",
    as: "children",
    onDelete: "CASCADE",
});
SCategory.belongsTo(SCategory, {
    as: "parent",
    foreignKey: "parentCategoryId",
});

export const ZCategory = z.object({
    id: z.number(),
    name: z.string(),
    parent_category_id: z.number(),
});

export const ZPartialCategory = ZCategory.partial().omit({ id: true }); // tous les champs sont devenus optionels
export const ZInputCategory = ZCategory.omit({
    id: true,
    parent_category_id: true,
});

export type Category = z.infer<typeof ZCategory>; // Le type typescript qui correspond à l'objet
export type PartialCategory = z.infer<typeof ZPartialCategory>; // Le type typescript avec toutes les props optionelles
export type InputCategory = z.infer<typeof ZInputCategory>;

export default SCategory;
