import SCategory from "../models/Category.js";

// Recursive function to get categories and their children
export const getCategories = async (parentId: number): Promise<any[]> => {
    const subCategories = await SCategory.findAll({
        where: { parentCategoryId: parentId },
    });

    if (subCategories.length === 0) return [];

    return await Promise.all(
        subCategories.map(async (category) => ({
            ...category.dataValues,
            children: await getCategories(category.getDataValue("id")),
        })),
    );
};
