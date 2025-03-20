import { FastifyRequest, FastifyReply } from "fastify";
import SCategory, * as c from "../models/Category.js";
import {
    RecyclotronApiErr,
    SequelizeApiErr,
} from "../error/recyclotronApiErr.js";
import { BaseError } from "sequelize";
import { stringToInt } from "../service/stringToInt.js";
import { getCategories } from "../service/categoryService.js";
import SItem from "../models/Item.js";

export const createCategory = async (
    request: FastifyRequest<{ Body: c.InputCategory }>,
    reply: FastifyReply,
) => {
    try {
        const newCategory = await c.default.create(request.body);
        reply.code(201).send({
            data: newCategory.toJSON(),
            message: "New Category created successfully",
        });
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("Category", error);
        } else throw new RecyclotronApiErr("Category", "CreationFailed");
    }
};

export const createChildCategory = async (
    request: FastifyRequest<{ Params: { id: string }; Body: c.InputCategory }>,
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
        const newCategory = await c.default.create({
            name,
            parent_category_id,
        });
        reply.code(201).send({
            data: newCategory.toJSON(),
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
        const categories = await c.default.findAll({
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
        const category = await c.default.findByPk(id);
        if (!category)
            return new RecyclotronApiErr("Category", "NotFound", 404);

        const allCategories = {
            ...category.toJSON(),
            children: await getCategories(id),
        };

        reply.code(200).send({
            data: allCategories,
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
        Body: c.PartialCategory;
    }>,
    reply: FastifyReply,
) => {
    try {
        const id: number = stringToInt(request.params.id, "Category");
        const category = await c.default.findByPk(id);
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
        const category = await c.default.findByPk(id);
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

// Get items of one category
export const getItemsByCategoryId = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) => {
    try {
        const id: number = stringToInt(request.params.id, "Category");
        const category = await c.default.findByPk(id);
        if (!category) throw new RecyclotronApiErr("Category", "NotFound", 404);

        let is_visitor = false;
        try {
            await request.jwtVerify();
        } catch (_) {
            is_visitor = true;
        }
        let items;
        if (
            is_visitor ||
            (request.user.roles.includes("client") &&
                !request.user.roles.includes("admin"))
        ) {
            items = await SItem.findAll({
                where: { status: true },
                include: [
                    {
                        model: SCategory,
                        as: "categories",
                        where: { id },
                        through: { attributes: [] },
                        attributes: ["id", "name", "parentCategoryId"],
                    },
                ],
            });
        } else {
            items = await SItem.findAll({
                include: [
                    {
                        model: SCategory,
                        as: "categories",
                        where: { id },
                        through: { attributes: [] },
                        attributes: ["id", "name", "parentCategoryId"],
                    },
                ],
            });
        }

        reply.code(200).send({
            data: items.map((item) => item.toJSON()),
            message: "Items fetched successfully for the category",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Category", error);
        } else throw new RecyclotronApiErr("Category", "FetchFailed");
    }
};
