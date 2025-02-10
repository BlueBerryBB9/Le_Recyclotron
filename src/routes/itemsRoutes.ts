import { FastifyInstance } from "fastify";
import * as ctrl from "../controllers/itemController.js";
import * as m from "./../models/Item.js";
import z from "zod";
import { authorize } from "../middleware/auth.js";
import { defaultErrors, singleResponse, listResponse } from "../utils/responseSchemas.js";

export default async (fastify: FastifyInstance) => {
    // Create a new item
    fastify.post<{ Body: m.InputItem }>(
        "/item",
        {
            schema: { 
                body: m.ZInputItem,
                response: {
                    ...defaultErrors,
                    201: singleResponse(m.ZItem)
                }
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
                    ...defaultErrors,
                    200: listResponse(m.ZItem)
                }
            }
        },
        ctrl.getAllItems
    );

    // Item details
    fastify.get<{ Params: { id: string } }>(
        "/item/:id",
        {
            schema: { 
                params: z.object({ id: z.string() }),
                response: {
                    ...defaultErrors,
                    200: singleResponse(m.ZItem)
                }
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
                    ...defaultErrors,
                    200: listResponse(m.ZItem)
                }
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
                    ...defaultErrors,
                    200: singleResponse(m.ZItem)
                }
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
                    ...defaultErrors,
                    204: { type: 'null' }
                }
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
                    ...defaultErrors,
                    201: singleResponse(m.ZItem)
                }
            },
            onRequest: [authorize(["employee"])],
        },
        ctrl.addCategoryToItem,
    );

    // All categories of an item
    fastify.get<{ Params: { id: string } }>(
        "/item/:id/categories",
        {
            schema: { 
                params: z.object({ itemId: z.string() }),
                response: {
                    ...defaultErrors,
                    200: listResponse(m.ZItem)
                }
            },
            onRequest: [authorize(["employee"])],
        },
        ctrl.getAllCategoriesOfItem,
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
                    ...defaultErrors,
                    204: { type: 'null' }
                }
            },
            onRequest: [authorize(["employee"])],
        },
        ctrl.deleteCategoryOfItem,
    );
};
