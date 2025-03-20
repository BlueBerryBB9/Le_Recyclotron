import SCategory from "../models/Category.js";
import SItem from "../models/Item.js";

export const getItemWithCategories = async (id: number | string) => {
    return await SItem.findByPk(id, {
        include: [
            {
                model: SCategory,
                as: "categories",
                through: { attributes: [] },
            },
        ],
    });
};
