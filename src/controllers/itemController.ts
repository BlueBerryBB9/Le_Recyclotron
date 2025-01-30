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

// Create new item
export const createItem = async (
    request: FastifyRequest<{ Body: i.InputItem }>,
    reply: FastifyReply,
) => {
    try {
        const newItem = await i.default.create(request.body);
        reply.code(201).send({
            data: newItem,
            message: "newItem created successfully",
        });
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("User", error);
        } else throw new RecyclotronApiErr("User", "CreationFailed");
    }
};

// Get all items
export const getAllItems = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    try {
        const items = await i.default.findAll();
        if (!items) {
            return new RecyclotronApiErr("Item", "NotFound", 404);
        }
        reply.code(200).send({
            data: items,
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
        const item = await i.default.findByPk(id);
        if (!item) {
            return new RecyclotronApiErr("Item", "NotFound", 404);
        }
        reply.code(200).send({
            data: item,
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
        const status = request.params.status;
        const items = await i.default.findAll({ where: { status } });
        if (items.length === 0)
            return new RecyclotronApiErr("Item", "NotFound", 404);

        reply.code(200).send({
            data: items,
            message: "Items fetched by status successfully",
        });
    } catch (error) {
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

        reply.code(200).send({
            data: item,
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

        reply.code(204).send({ message: "Item deleted successfully." });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Item", error);
        } else throw new RecyclotronApiErr("Item", "DeletionFailed");
    }
};

// MAYBE USELESS, why dont use update instead of add category to item?
// ITEMS SHOULD HAVE ONLY ONE CATEGORY
// Add category to item
export const addCategoryToItem = async (
    request: FastifyRequest<{ Params: { itemId: string; categoryId: string } }>,
    reply: FastifyReply,
) => {
    try {
        const itemId: number = stringToInt(request.params.itemId, "Item");
        if (!i.default.findByPk(itemId))
            return new RecyclotronApiErr("Item", "NotFound", 404);

        const categoryId = stringToInt(request.params.categoryId, "Category");
        if (!SCategory.findByPk(categoryId))
            return new RecyclotronApiErr("Category", "NotFound", 404);

        const itemcategory = await SItemCategory.findOne({
            where: { categoryid: categoryId, itemId: itemId },
        });
        if (itemcategory)
            throw new RecyclotronApiErr("Item", "AlreadyExists", 409);

        const itemcategories = await SItemCategory.create({
            itemId,
            categoryId,
        });

        reply.code(200).send({
            data: itemcategories,
            message: "All category of item fetch successfully",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Item", error);
        } else throw new RecyclotronApiErr("Item", "CreationFailed");
    }
};

// Get all categories of an item
export const getAllCategoriesOfItem = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) => {
    try {
        const id: number = stringToInt(request.params.id, "Item");
        const categories = await SItemCategory.findAll({
            where: { itemId: id },
        });
        if (categories.length === 0)
            return new RecyclotronApiErr("Item", "NotFound", 404);

        reply.code(200).send({
            data: categories,
            message: "All category of item fetch successfully",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Item", error);
        } else throw new RecyclotronApiErr("Item", "FetchFailed");
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
        const itemCategory = await SItemCategory.findOne({
            where: { itemId: itemId, categoryId: categoryId },
        });
        if (!itemCategory)
            return new RecyclotronApiErr("Item", "NotFound", 404);

        await SItemCategory.destroy({
            where: { itemId: itemId, categoryId: categoryId },
        });
        reply.code(204).send({
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
