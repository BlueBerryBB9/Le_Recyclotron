import { FastifyInstance } from "fastify";
import * as ctrl from "../controllers/categoryController.js";
import * as m from "../models/Category.js";
import z from "zod";

export default async (fastify: FastifyInstance) => {
    // Create a new Category
    fastify.post<{ Body: m.InputCategory }>(
        "/categories",
        {
            schema: { body: m.ZInputCategory },
            onRequest: [authenticate],
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
            },
            onRequest: [authenticate],
        },
        ctrl.createCategory,
    );

    // All categories
    fastify.get(
        "/categories",
        { onRequest: [authenticate] },
        ctrl.getAllCategories,
    );

    // Category details
    fastify.get<{ Params: { id: string } }>(
        "/categories/:id",
        {
            schema: { params: z.object({ id: z.string() }) },
            onRequest: [authenticate],
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
            },
            onRequest: [authenticate],
        },
        ctrl.updateCategoryById,
    );

    // Delete Category
    fastify.delete<{ Params: { id: string } }>(
        "/categories/:id",
        {
            schema: { params: z.object({ id: z.string() }) },
            onRequest: [authenticate],
        },
        ctrl.deleteCategoryById,
    );

    // All categories of an Category
    fastify.get<{ Params: { id: string } }>(
        "/categories/:id/categories",
        {
            schema: { params: z.object({ CategoryId: z.string() }) },
            onRequest: [authenticate],
        },
        ctrl.getAllCategoriesOfCategory,
    );
};
