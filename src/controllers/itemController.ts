import { FastifyRequest, FastifyReply } from "fastify";
import * as i from "../models/Item.js";
import ItemCategory from "../models/ItemCategories.js";

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
        reply.code(500).send({ error: "Failed to create item." });
    }
};

// Get all items
export const getAllItems = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    try {
        const items = await i.default.findAll();
        reply.code(200).send({
            data: items,
            message: "All items fetched successfully",
        });
    } catch (error) {
        reply.code(500).send({ error: "Failed to retrieve items." });
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
        if (item) {
            reply.code(200).send({
                data: item,
                message: "Item fetched by id successfully",
            });
        } else {
            reply.code(404).send({ error: "Item not found." });
        }
    } catch (error) {
        reply.code(500).send({ error: "Failed to retrieve item." });
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
        reply.code(500).send({ error: "Failed to retrieve items by status." });
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
        if (item) {
            await item.update({ name, status, material, image, date });
            reply.code(200).send({
                message: "Item updated successfully",
            });
        } else {
            reply.code(404).send({ error: "Item not found." });
        }
    } catch (error) {
        reply.code(500).send({ error: "Failed to update item." });
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
        if (item) {
            await item.destroy();
            reply.code(200).send({ message: "Item deleted successfully." });
        } else {
            reply.code(404).send({ error: "Item not found." });
        }
    } catch (error) {
        reply.code(500).send({ error: "Failed to delete item." });
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

        await ItemCategory.create({
            itemId,
            categoryId,
        });

        reply.code(200).send({
            message: "All category of item fetch successfully",
        });
    } catch (error) {
        reply.code(500).send({
            error: "An error occurred while adding the category to the item.",
        });
    }
};

// Get all categories of an item
export const getAllCategoriesOfItem = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) => {
    try {
        const itemId: number = parseInt(request.params.id);
        await ItemCategory.findAll({
            where: { itemId: itemId },
        });
        reply.code(200).send({
            message: "All category of item fetch successfully",
        });
    } catch (error) {
        reply.code(500).send({
            error: "An error occurred while retrieving the categories of the item.",
        });
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
        await ItemCategory.destroy({
            where: { itemId: itemId, categoryId: categoryId },
        });
        reply.code(200).send({
            message: "Category removed from item successfully",
        });
    } catch (error) {
        reply.code(500).send({
            error: "An error occurred while deleting the category from the item.",
        });
    }
};
