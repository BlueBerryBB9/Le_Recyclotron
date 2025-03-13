import { FastifyRequest, FastifyReply } from "fastify";
import SCategory, * as i from "../models/Category.js";
import {
    RecyclotronApiErr,
    SequelizeApiErr,
} from "../error/recyclotronApiErr.js";
import { BaseError } from "sequelize";
import { stringToInt } from "../service/stringToInt.js";
import { getCategories } from "../service/categoryService.js";

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

        const allCategories: any[] = [];

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

        const updatedCategories = {
            ...category,
            children: await getCategories(id),
        };

        reply.code(200).send({
            data: updatedCategories,
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
        const category = await i.default.findByPk(id);
        if (!category)
            return new RecyclotronApiErr("Category", "NotFound", 404);

        await category.update(request.body);

        const updatedCategories = {
            ...category,
            children: await getCategories(id),
        };
        reply.code(200).send({
            data: updatedCategories,
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
