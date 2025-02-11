import { FastifyInstance } from "fastify";
import * as ctrl from "../controllers/itemController.js";
import * as m from "./../models/Item.js";
import z from "zod";
import { authorize } from "../middleware/auth.js";
import { zodToJsonSchema } from "zod-to-json-schema";

export default async (fastify: FastifyInstance) => {
    // Create a new item
    fastify.post<{ Body: m.InputItem }>(
        "/item",
        {
            schema: {
                body: m.ZInputItem,
                response: {
                    201: zodToJsonSchema(
                        z.object({ data: m.ZItemOutput, message: z.string() }),
                    ),
                },
            },
            onRequest: [authorize(["employee"])],
        },
        ctrl.createItem,
    );

    // All items
    fastify.get(
        "/item",
        {
            schema: {
                response: {
                    200: zodToJsonSchema(
                        z.object({
                            data: m.ZItemAndCategoriesListOutput,
                            message: z.string(),
                        }),
                    ),
                },
            },
        },
        ctrl.getAllItems,
    );

    // Item details
    fastify.get<{ Params: { id: string } }>(
        "/item/:id",
        {
            schema: {
                params: z.object({ id: z.string() }),
                response: {
                    200: zodToJsonSchema(
                        z.object({
                            data: m.ZItemAndCategoriesOutput,
                            message: z.string(),
                        }),
                    ),
                },
            },
            onRequest: [authorize(["employee"])],
        },
        ctrl.getItemById,
    );

    // Items by status
    fastify.get<{ Params: { status: string } }>(
        "/item/:status/",
        {
            schema: {
                params: z.object({ status: z.string() }),
                response: {
                    200: zodToJsonSchema(
                        z.object({
                            data: m.ZItemAndCategoriesOutput,
                            message: z.string(),
                        }),
                    ),
                },
            },
            onRequest: [authorize(["repairer", "client"])],
        },
        ctrl.getItemByStatus,
    );

    // Update item
    fastify.put<{ Params: { id: string }; Body: m.PartialItem }>(
        "/item/:id",
        {
            schema: {
                params: z.object({ id: z.string() }),
                body: m.ZPartialItem,
                response: {
                    200: zodToJsonSchema(
                        z.object({
                            data: m.ZItemAndCategoriesOutput,
                            message: z.string(),
                        }),
                    ),
                },
            },
            onRequest: [authorize(["employee"])],
        },
        ctrl.updateItemById,
    );

    // Delete item
    fastify.delete<{ Params: { id: string } }>(
        "/item/:id",
        {
            schema: {
                params: z.object({ id: z.string() }),
                response: {
                    200: zodToJsonSchema(z.object({ message: z.string() })),
                },
            },
            onRequest: [authorize(["employee"])],
        },
        ctrl.deleteItemById,
    );

    // Add category to item
    fastify.post<{ Params: { itemId: string; categoryId: string } }>(
        "/item/:id/categories",
        {
            schema: {
                params: z.object({
                    itemId: z.string(),
                    categoryId: z.string(),
                }),
                response: {
                    200: zodToJsonSchema(
                        z.object({
                            data: m.ZItemAndCategoriesOutput,
                            message: z.string(),
                        }),
                    ),
                },
            },
            onRequest: [authorize(["employee"])],
        },
        ctrl.addCategoryToItem,
    );

    // Delete category of an item
    fastify.delete<{ Params: { itemId: string; categoryId: string } }>(
        "/item/:id/categories/:id",
        {
            schema: {
                params: z.object({
                    itemId: z.string(),
                    categoryId: z.string(),
                }),
                response: {
                    200: zodToJsonSchema(z.object({ message: z.string() })),
                },
            },
            onRequest: [authorize(["employee"])],
        },
        ctrl.deleteCategoryOfItem,
    );
};
