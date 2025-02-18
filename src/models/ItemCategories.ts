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
    as: "categories",
    foreignKey: "itemId",
    through: SItemCategory,
});
SCategory.belongsToMany(SItem, {
    as: "items",
    foreignKey: "categoryId",
    through: SItemCategory,
});

SItem.beforeDestroy(async (item) => {
    await SItemCategory.destroy({ where: { itemId: item.getDataValue("id") } });
});

SCategory.beforeDestroy(async (category) => {
    await SItemCategory.destroy({
        where: { categoryId: category.getDataValue("id") },
    });
});

export default SItemCategory;
