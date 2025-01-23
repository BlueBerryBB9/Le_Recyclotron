import { FastifyInstance } from "fastify";
import * as ctrl from "../controllers/itemController.js";
import * as m from "./../models/Item.js";
import z from "zod";
import { authorize } from "../middleware/auth.js";

export default async (fastify: FastifyInstance) => {
    // Create a new item
    fastify.post<{ Body: m.InputItem }>(
        "/items",
        {
            schema: { body: m.ZInputItem },
            onRequest: [authorize],
        },
        ctrl.createItem,
    );

    // All items
    fastify.get("/items", { onRequest: [authorize] }, ctrl.getAllItems);

    // Item details
    fastify.get<{ Params: { id: string } }>(
        "/items/:id",
        {
            schema: { params: z.object({ id: z.string() }) },
            onRequest: [authorize],
        },
        ctrl.getItemById,
    );

    // Items by status
    fastify.get<{ Params: { status: string } }>(
        "/items/:status/",
        {
            schema: { params: z.object({ status: z.string() }) },
            onRequest: [authorize],
        },
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
            onRequest: [authorize],
        },
        ctrl.updateItemById,
    );

    // Delete item
    fastify.delete<{ Params: { id: string } }>(
        "/items/:id",
        {
            schema: { params: z.object({ id: z.string() }) },
            onRequest: [authorize],
        },
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
            onRequest: [authorize],
        },
        ctrl.addCategoryToItem,
    );

    // All categories of an item
    fastify.get<{ Params: { id: string } }>(
        "/items/:id/categories",
        {
            schema: { params: z.object({ itemId: z.string() }) },
            onRequest: [authorize],
        },
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
            onRequest: [authorize],
        },
        ctrl.deleteCategoryOfItem,
    );
};
