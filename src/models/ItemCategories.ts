import { Model } from "sequelize";
import sequelize from "../config/database.js";
import Item from "./Item.js";
import Category from "./Category.js";

class SItemCategory extends Model {
    itemId!: number;
    categoryId!: number;
}

SItemCategory.init(
    {},
    {
        sequelize,
        modelName: "ItemCategory",
    },
);

Item.belongsToMany(Category, {
    as: "category",
    foreignKey: "categoryId",
    through: SItemCategory,
});
Category.belongsToMany(Item, {
    as: "item",
    foreignKey: "itemId",
    through: SItemCategory,
});

export default SItemCategory;
