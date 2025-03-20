import { FastifyRequest, FastifyReply } from "fastify";
import * as i from "../models/Item.js";
import SItemCategory from "../models/ItemCategories.js";
import {
    RecyclotronApiErr,
    SequelizeApiErr,
} from "../error/recyclotronApiErr.js";
import SCategory from "../models/Category.js";
import { BaseError } from "sequelize";
import { stringToInt } from "../service/stringToInt.js";
import { getItemWithCategories } from "../service/itemService.js";

// Create new item
export const createItem = async (
    request: FastifyRequest<{ Body: i.InputItem }>,
    reply: FastifyReply,
) => {
    try {
        if (request.body.status != 0 && request.body.status != 1)
            return new RecyclotronApiErr("Item", "InvalidInput", 400);

        const newItem = await i.default.create(request.body);

        reply.code(201).send({
            data: newItem.dataValues,
            message: "newItem created successfully",
        });
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("User", error);
        } else throw new RecyclotronApiErr("User", "CreationFailed");
    }
};

// Get all items
export const getAllItems = async (_: FastifyRequest, reply: FastifyReply) => {
    try {
        const items = await i.default.findAll({
            include: [
                {
                    model: SCategory,
                    as: "categories",
                    through: { attributes: [] },
                },
            ],
        });
        console.log(items);
        if (!items) return new RecyclotronApiErr("Item", "NotFound", 404);

        reply.code(200).send({
            data: items.map((item) => item.dataValues),
            message: "All items fetched successfully",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Item", error);
        } else throw new RecyclotronApiErr("Item", "FetchAllFailed");
    }
};

// Get item by ID
export const getItemById = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) => {
    try {
        const id: number = stringToInt(request.params.id, "Item");
        const item = await getItemWithCategories(id);
        if (!item) return new RecyclotronApiErr("Item", "NotFound", 404);

        let is_visitor = false;
        try {
            await request.jwtVerify();
        } catch (_) {
            is_visitor = true;
        }
        if (
            (is_visitor ||
                (request.user.roles.includes("client") &&
                    !request.user.roles.includes("admin"))) &&
            item.getDataValue("status") !== 1
        ) {
            throw new RecyclotronApiErr(
                "Auth",
                "PermissionDenied",
                401,
                "You can only access salable items data",
            );
        }

        reply.code(200).send({
            data: item.dataValues,
            message: "Item fetched by id successfully",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Item", error);
        } else throw new RecyclotronApiErr("Item", "FetchFailed");
    }
};

// Get items by status
export const getItemByStatus = async (
    request: FastifyRequest<{ Params: { status: string } }>, // Status is an enum
    reply: FastifyReply,
) => {
    try {
        const status = stringToInt(request.params.status, "Item");

        let is_visitor = false;
        try {
            await request.jwtVerify();
        } catch (_) {
            is_visitor = true;
        }
        if (
            (is_visitor ||
                (request.user.roles.includes("client") &&
                    !request.user.roles.includes("admin"))) &&
            status !== 1
        ) {
            throw new RecyclotronApiErr(
                "Auth",
                "PermissionDenied",
                401,
                "You can only access salable items data",
            );
        }

        const items = await i.default.findAll({
            where: { status },
            include: [
                {
                    model: SCategory,
                    as: "categories",
                    through: { attributes: [] },
                },
            ],
        });
        if (items.length === 0)
            return new RecyclotronApiErr("Item", "NotFound", 404);

        reply.code(200).send({
            data: items.map((item) => item.dataValues),
            message: "Items fetched by status successfully",
        });
    } catch (error) {
        console.log(error);
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Item", error);
        } else throw new RecyclotronApiErr("Item", "FetchFailed");
    }
};

export const updateItemById = async (
    request: FastifyRequest<{
        Params: { id: string };
        Body: i.PartialItem;
    }>,
    reply: FastifyReply,
) => {
    try {
        const id: number = stringToInt(request.params.id, "Item");
        const item = await i.default.findByPk(id);
        if (!item) return new RecyclotronApiErr("Item", "NotFound", 404);

        await item.update(request.body);

        const updatedItem = await getItemWithCategories(id);

        reply.code(200).send({
            data: updatedItem?.dataValues,
            message: "Item updated successfully",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Item", error);
        } else throw new RecyclotronApiErr("Item", "UpdateFailed");
    }
};

// Delete item by ID
export const deleteItemById = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) => {
    try {
        const id: number = stringToInt(request.params.id, "Item");
        const item = await i.default.findByPk(id);
        if (!item) return new RecyclotronApiErr("Item", "NotFound", 404);

        await item.destroy();

        reply.code(200).send({ message: "Item deleted successfully." });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Item", error);
        } else throw new RecyclotronApiErr("Item", "DeletionFailed");
    }
};

export const addCategoryToItem = async (
    request: FastifyRequest<{ Params: { itemId: string; categoryId: string } }>,
    reply: FastifyReply,
) => {
    try {
        const itemId: number = stringToInt(request.params.itemId, "Item");
        if (!(await i.default.findByPk(itemId)))
            return new RecyclotronApiErr("Item", "NotFound", 404);

        const categoryId = stringToInt(request.params.categoryId, "Category");
        const category = await SCategory.findByPk(categoryId);
        if (!category)
            return new RecyclotronApiErr("Category", "NotFound", 404);

        // Check if all parent categories are linked to the item
        let currentCategory = category;
        while (currentCategory.getDataValue("parentCategoryId")) {
            const parentCategoryId =
                currentCategory.getDataValue("parentCategoryId");
            const parentCategory = await SCategory.findByPk(parentCategoryId);
            if (parentCategory) {
                const parentCategoryLink = await SItemCategory.findOne({
                    where: {
                        categoryId: parentCategoryId,
                        itemId: itemId,
                    },
                });
                if (!parentCategoryLink) {
                    return new RecyclotronApiErr(
                        "Category",
                        "CreationFailed",
                        400,
                        "Parent category is not linked to the item",
                    );
                }
                currentCategory = parentCategory;
            } else {
                break;
            }
        }

        const itemCategory = await SItemCategory.findOne({
            where: { categoryId: categoryId, itemId: itemId },
        });
        if (itemCategory)
            throw new RecyclotronApiErr("Item", "AlreadyExists", 409);

        await SItemCategory.create({ itemId: itemId, categoryId: categoryId });

        const updatedItem = await i.default.findByPk(itemId, {
            include: [
                {
                    model: SCategory,
                    as: "categories",
                    attributes: ["id", "name", "parentCategoryId"],
                    through: { attributes: [] },
                },
            ],
        });

        if (!updatedItem) return new RecyclotronApiErr("Item", "NotFound", 404);

        reply.code(200).send({
            data: updatedItem.toJSON(),
            message: "Category added to item successfully",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Item", error);
        } else throw new RecyclotronApiErr("Item", "CreationFailed");
    }
};

// Delete category of an item
export const deleteCategoryOfItem = async (
    request: FastifyRequest<{ Params: { itemId: string; categoryId: string } }>,
    reply: FastifyReply,
) => {
    try {
        const itemId = stringToInt(request.params.itemId, "Item");
        const categoryId = stringToInt(request.params.categoryId, "Category");

        // Check if the category has any child categories
        const childCategories = await SCategory.findAll({
            where: { parentCategoryId: categoryId },
        });
        if (childCategories.length > 0) {
            return new RecyclotronApiErr(
                "Category",
                "DeletionFailed",
                400,
                "Category has child categories and cannot be removed",
            );
        }

        const itemCategory = await SItemCategory.findOne({
            where: { itemId: itemId, categoryId: categoryId },
        });
        if (!itemCategory)
            return new RecyclotronApiErr("Item", "NotFound", 404);

        await SItemCategory.destroy({
            where: { itemId: itemId, categoryId: categoryId },
        });

        reply.code(200).send({
            message: "Category removed from item successfully",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Item", error);
        } else throw new RecyclotronApiErr("Item", "DeletionFailed");
    }
};
