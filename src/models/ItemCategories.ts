import { Model } from "sequelize";
import sequelize from "../config/database.js";
import Item from "./Item.js";
import Category from "./Category.js";

class ItemCategory extends Model {}

ItemCategory.init(
    {},
    {
        sequelize,
        modelName: "ItemCategory",
    },
);

Item.belongsToMany(Category, {
    as: "category",
    foreignKey: "categoryId",
    through: ItemCategory,
});
Category.belongsToMany(Item, {
    as: "item",
    foreignKey: "itemId",
    through: ItemCategory,
});

export default ItemCategory;
