import { FastifyRequest, FastifyReply } from "fastify";
import * as i from "../models/Item.js";
import ItemCategory from "../models/ItemCategories.js";
import { RecyclotronApiErr } from "../error/recyclotronApiErr.js";

// Create new item
export const createItem = async (
    request: FastifyRequest<{ Body: i.InputItem }>,
    reply: FastifyReply,
) => {
    try {
        const { name, status, material, image, date } = request.body;
        const newItem = await i.default.create({
            name,
            status,
            material,
            image,
            date,
        });
        reply.code(201).send({
            data: newItem,
            message: "newItem created successfully",
        });
    } catch (error) {
        throw new RecyclotronApiErr("Item", "CreationFailed");
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
        throw new RecyclotronApiErr("Item", "FetchAllFailed");
    }
};

// Get item by ID
export const getItemById = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) => {
    try {
        const id: number = parseInt(request.params.id);
        const item = await i.default.findByPk(id);
        if (!item) {
            return new RecyclotronApiErr("Item", "NotFound", 404);
        }
        reply.code(200).send({
            data: item,
            message: "Item fetched by id successfully",
        });
    } catch (error) {
        throw new RecyclotronApiErr("Item", "FetchFailed");
    }
};

// Get items by status
export const getItemByStatus = async (
    request: FastifyRequest<{ Params: { status: string } }>,
    reply: FastifyReply,
) => {
    try {
        const status = request.params.status;
        const items = await i.default.findAll({ where: { status } });
        reply.code(200).send({
            data: items,
            message: "Items fetched by status successfully",
        });
    } catch (error) {
        throw new RecyclotronApiErr("Item", "FetchFailed");
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
        const id: number = parseInt(request.params.id);
        const { name, status, material, image, date } = request.body;
        const item = await i.default.findByPk(id);
        if (!item) {
            return new RecyclotronApiErr("Item", "NotFound", 404)
        }
        await item.update({ name, status, material, image, date });
        reply.code(200).send({
            message: "Item updated successfully",
        });
    } catch (error) {
        throw new RecyclotronApiErr("Item", "UpdateFailed");
    }
};

// Delete item by ID
export const deleteItemById = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) => {
    try {
        const id: number = parseInt(request.params.id);
        const item = await i.default.findByPk(id);
        if (!item) {
            return new RecyclotronApiErr("Item", "NotFound", 404)
        }
        await item.destroy();
        reply.code(200).send({ message: "Item deleted successfully." });
    } catch (error) {
        throw new RecyclotronApiErr("Item", "DeletionFailed");
    }
};

// Add category to item
export const addCategoryToItem = async (
    request: FastifyRequest<{ Params: { itemId: string; categoryId: string } }>,
    reply: FastifyReply,
) => {
    try {
        const itemId: number = parseInt(request.params.itemId);
        const categoryId: number = parseInt(request.params.categoryId);
        if (!itemId || !categoryId) {
            return new RecyclotronApiErr("Item", "NotFound", 404)
        }
        await ItemCategory.create({
            itemId,
            categoryId,
        });

        reply.code(200).send({
            message: "All category of item fetch successfully",
        });
    } catch (error) {
        throw new RecyclotronApiErr("Item", "CreationFailed");
    }
};

// Get all categories of an item
export const getAllCategoriesOfItem = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) => {
    try {
        const itemId: number = parseInt(request.params.id);
        const categories = await ItemCategory.findAll({
            where: { itemId: itemId },
        });
        if (!categories) {
            return new RecyclotronApiErr("Item", "NotFound", 404)
        }
        reply.code(200).send({
            data: categories,
            message: "All category of item fetch successfully",
        });
    } catch (error) {
        throw new RecyclotronApiErr("Item", "FetchAllFailed");
    }
};

// Delete category of an item
export const deleteCategoryOfItem = async (
    request: FastifyRequest<{ Params: { itemId: string; categoryId: string } }>,
    reply: FastifyReply,
) => {
    try {
        const itemId = parseInt(request.params.itemId);
        const categoryId = parseInt(request.params.categoryId);
        if (!itemId || !categoryId) {
            return new RecyclotronApiErr("Item", "NotFound", 404)
        }
        await ItemCategory.destroy({
            where: { itemId: itemId, categoryId: categoryId },
        });
        reply.code(200).send({
            message: "Category removed from item successfully",
        });
    } catch (error) {
        throw new RecyclotronApiErr("Item", "DeletionFailed");
    }
};
