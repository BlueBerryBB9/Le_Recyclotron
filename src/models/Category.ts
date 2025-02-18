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
        timestamps: false,
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

export const ZCategory = z
    .object({
        id: z.number(),
        name: z.string(),
        parentCategoryId: z.number().optional().nullable(),
    })
    .strict();

export const ZPartialCategory = ZCategory.omit({
    id: true,
    parentCategoryId: true,
});
export const ZInputCategory = ZCategory.omit({
    id: true,
    parentCategoryId: true,
});
export const ZInputChildCategory = ZCategory.omit({
    id: true,
});

export const ZParentCategory = ZCategory.omit({ parentCategoryId: true });

export const ZCategoryWithChildren: z.ZodSchema = z.lazy(() =>
    ZCategory.extend({
        children: z.array(ZCategoryWithChildren),
    }),
);

export type Category = z.infer<typeof ZCategory>;
export type PartialCategory = z.infer<typeof ZPartialCategory>;
export type InputCategory = z.infer<typeof ZInputCategory>;
export type InputChildCategory = z.infer<typeof ZInputChildCategory>;

export default SCategory;
