import { FastifyInstance } from "fastify";
import * as ctrl from "../controllers/itemController.js";
import * as m from "./../models/Item.js";
import z from "zod";

export default async (fastify: FastifyInstance) => {
    // Create a new item
    fastify.post<{ Body: m.InputItem }>(
        "/items",
        { schema: { body: m.ZInputItem } },
        ctrl.createItem,
    );

    // All items
    fastify.get("/items", { schema: { body: m.ZInputItem } }, ctrl.getAllItems);

    // Item details
    fastify.get<{ Params: { id: string } }>(
        "/items/:id",
        { schema: { params: z.object({ id: z.string() }) } },
        ctrl.getItemById,
    );

    // Items by status
    fastify.get<{ Params: { status: string } }>(
        "/items/:status/",
        { schema: { params: z.object({ status: z.string() }) } },
        ctrl.getItemByStatus,
    );

    // Update item
    fastify.put<{ Params: { id: string }; Body: m.PartialItem }>(
        "/items/:id",
        {
            schema: {
                params: z.object({ id: z.string() }),
                body: m.ZPartialItem,
            },
        },
        ctrl.updateItemById,
    );

    // Delete item
    fastify.delete<{ Params: { id: string } }>(
        "/items/:id",
        { schema: { params: z.object({ id: z.string() }) } },
        ctrl.deleteItemById,
    );

    // Add category to item
    fastify.post<{ Params: { itemId: string; categoryId: string } }>(
        "/items/:id/categories",
        {
            schema: {
                params: z.object({
                    itemId: z.string(),
                    categoryId: z.string(),
                }),
            },
        },
        ctrl.addCategoryToItem,
    );

    // All categories of an item
    fastify.get<{ Params: { id: string } }>(
        "/items/:id/categories",
        { schema: { params: z.object({ itemId: z.string() }) } },
        ctrl.getAllCategoriesOfItem,
    );

    // Delete category of an item
    fastify.delete<{ Params: { itemId: string; categoryId: string } }>(
        "/items/:id/categories/:id",
        {
            schema: {
                params: z.object({
                    itemId: z.string(),
                    categoryId: z.string(),
                }),
            },
        },
        ctrl.deleteCategoryOfItem,
    );
};
