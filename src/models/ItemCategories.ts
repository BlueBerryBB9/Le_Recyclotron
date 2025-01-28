import { Model } from "sequelize";
import sequelize from "../config/database.js";
import SItem from "./Item.js";
import SCategory from "./Category.js";

class SItemCategory extends Model {}

SItemCategory.init(
    {},
    {
        sequelize,
        modelName: "ItemCategory",
    },
);

SItem.belongsToMany(SCategory, {
    as: "category",
    foreignKey: "categoryId",
    through: SItemCategory,
});
SCategory.belongsToMany(SItem, {
    as: "item",
    foreignKey: "itemId",
    through: SItemCategory,
});

export default SItemCategory;
