import { FastifyRequest, FastifyReply } from "fastify";
import SCategory, * as i from "../models/Category.js";
import {
    RecyclotronApiErr,
    SequelizeApiErr,
} from "../error/recyclotronApiErr.js";
import { BaseError } from "sequelize";
import { stringToInt } from "../service/stringToInt.js";

export const createCategory = async (
    request: FastifyRequest<{ Body: i.InputCategory }>,
    reply: FastifyReply,
) => {
    try {
        const newCategory = await i.default.create(request.body);
        reply.code(201).send({
            data: newCategory.dataValues,
            message: "New Category created successfully",
        });
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("Category", error);
        } else throw new RecyclotronApiErr("Category", "CreationFailed");
    }
};

export const createChildCategory = async (
    request: FastifyRequest<{ Params: { id: string }; Body: i.InputCategory }>,
    reply: FastifyReply,
) => {
    try {
        const parent_category_id: number = stringToInt(
            request.params.id,
            "Category",
        );
        const parent_category = SCategory.findOne({
            where: { id: parent_category_id },
        });
        if (!parent_category)
            throw new RecyclotronApiErr("Category", "NotFound", 404);

        const name = request.body.name;
        const newCategory = await i.default.create({
            name,
            parent_category_id,
        });
        reply.code(201).send({
            data: newCategory.dataValues,
            message: "New Child Category created successfully",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Category", error);
        } else throw new RecyclotronApiErr("Category", "CreationFailed");
    }
};

// Get all Categories
export const getAllCategories = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    try {
        const categories = await i.default.findAll({
            where: { parentCategoryId: null },
        });

        if (categories.length === 0)
            throw new RecyclotronApiErr("Category", "NotFound", 404);

        let allCategories: any[] = [];

        // Recursive function to get categories and their children
        const getCategories = async (parentId: number): Promise<any[]> => {
            const subCategories = await i.default.findAll({
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

        for (const cate of categories) {
            const categoriesWithChildren = await getCategories(
                cate.getDataValue("id"),
            );

            allCategories.push({
                ...cate.dataValues,
                children: categoriesWithChildren,
            });
        }

        reply.code(200).send({
            data: allCategories,
            message: "All categories fetched successfully",
        });
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("Category", error);
        } else {
            throw new RecyclotronApiErr("Category", "FetchAllFailed");
        }
    }
};

// Get Category by ID
export const getCategoryById = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) => {
    try {
        const id: number = stringToInt(request.params.id, "Category");
        const category = await i.default.findByPk(id);
        if (!category)
            return new RecyclotronApiErr("Category", "NotFound", 404);

        reply.code(200).send({
            data: category,
            message: "category fetched by id successfully",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Category", error);
        } else throw new RecyclotronApiErr("Category", "FetchFailed");
    }
};

// Updtade Category by ID
export const updateCategoryById = async (
    request: FastifyRequest<{
        Params: { id: string };
        Body: i.PartialCategory;
    }>,
    reply: FastifyReply,
) => {
    try {
        const id: number = stringToInt(request.params.id, "Category");
        const Category = await i.default.findByPk(id);
        if (!Category)
            return new RecyclotronApiErr("Category", "NotFound", 404);

        await Category.update(request.body);
        reply.code(200).send({
            message: "Category updated successfully",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Category", error);
        } else throw new RecyclotronApiErr("Category", "UpdateFailed");
    }
};

// Delete Category by ID
export const deleteCategoryById = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) => {
    try {
        const id: number = stringToInt(request.params.id, "Category");
        const category = await i.default.findByPk(id);
        if (!category)
            return new RecyclotronApiErr("Category", "NotFound", 404);

        await category.destroy();
        reply.code(200).send({
            statuscode: 200,
            message: "Category deleted successfully.",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Category", error);
        } else throw new RecyclotronApiErr("Category", "DeletionFailed");
    }
};

const getCategories = async (parentId: number): Promise<any> => {
    console.log(`Fetching categories for parentId: ${parentId}`);

    const subCategories = await i.default.findAll({
        where: { parentCategoryId: parentId },
    });

    if (subCategories.length === 0) return;

    const categoriesWithChildren = await Promise.all(
        subCategories.map(async (category) => {
            const categoryId = category.getDataValue("id");

            const children = await getCategories(categoryId);

            return {
                ...category.dataValues, // Include category info
                children, // Add child categories if they exist
            };
        }),
    );

    // Add the current level categories with their children
    return categoriesWithChildren;
};

// Get all childCategories of category
export const getAllCategoriesOfCategory = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) => {
    try {
        const parent_category_id: number = stringToInt(
            request.params.id,
            "Category",
        );

        let allCategories: any[] = [];

        // Start the recursion with the given parent category
        const categoriesWithParent = await getCategories(parent_category_id);

        // Add the parent category itself to the result
        const parentCategory = await i.default.findByPk(parent_category_id);
        if (parentCategory) {
            allCategories = [
                {
                    ...parentCategory.dataValues,
                    children: categoriesWithParent, // Attach the fetched children to the parent category
                },
            ];
        }

        // Send response
        reply.code(200).send({
            data: allCategories,
            message:
                "All categories including parent and children fetched successfully",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Category", error);
        } else throw new RecyclotronApiErr("Category", "FetchAllFailed");
    }
};
