import { FastifyInstance } from "fastify";
import * as ctrl from "../controllers/categoryController.js";
import * as m from "../models/Category.js";
import z from "zod";
import { authorize } from "../middleware/auth.js";

export default async (fastify: FastifyInstance) => {
    fastify.post<{ Body: m.InputCategory }>(
        "/categories",
        {
            schema: {
                body: m.ZInputCategory,
                response: {
                    201: {
                        zodSchema: z.object({
                            data: m.ZCategory,
                            message: z.string(),
                        }),
                    },
                },
            },
            onRequest: [authorize(["employee"])],
        },
        ctrl.createCategory,
    );

    // Create a new child Category
    fastify.post<{ Params: { id: string }; Body: m.InputCategory }>(
        "/categories/:id",
        {
            schema: {
                params: z.object({ id: z.string() }),
                body: m.ZInputCategory,
                response: {
                    201: {
                        zodSchema: z.object({
                            data: m.ZCategory,
                            message: z.string(),
                        }),
                    },
                },
            },
            onRequest: [authorize(["employee"])],
        },
        ctrl.createChildCategory,
    );

    // All categories
    fastify.get(
        "/categories",
        {
            schema: {
                response: {
                    200: {
                        zodSchema: z.object({
                            data: z.array(m.ZCategoryWithChildren),
                            message: z.string(),
                        }),
                    },
                },
            },
        },
        ctrl.getAllCategories,
    );

    // Category details
    fastify.get(
        "/categories/:id",
        {
            schema: {
                params: z.object({ id: z.string() }),
                response: {
                    200: {
                        zodSchema: z.object({
                            data: m.ZCategory,
                            message: z.string(),
                        }),
                    },
                },
            },
        },
        ctrl.getCategoryById,
    );

    // Update Category
    fastify.put<{ Params: { id: string }; Body: m.PartialCategory }>(
        "/categories/:id",
        {
            schema: {
                params: z.object({ id: z.string() }),
                body: m.ZPartialCategory,
                response: {
                    200: {
                        zodSchema: z.object({
                            data: m.ZCategoryWithChildren,
                            message: z.string(),
                        }),
                    },
                },
            },
            onRequest: [authorize(["employee"])],
        },
        ctrl.updateCategoryById,
    );

    // Delete Category
    fastify.delete<{ Params: { id: string } }>(
        "/categories/:id",
        {
            schema: {
                params: z.object({ id: z.string() }),
                response: {
                    200: {
                        zodSchema: z.object({
                            message: z.string(),
                        }),
                    },
                },
            },
            onRequest: [authorize(["employee"])],
        },
        ctrl.deleteCategoryById,
    );
};
