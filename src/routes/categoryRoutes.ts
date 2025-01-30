import { FastifyInstance } from "fastify";
import * as ctrl from "../controllers/categoryController.js";
import * as m from "../models/Category.js";
import z from "zod";
import { authorize, isSelfOrAdminOr } from "../middleware/auth.js";

export default async (fastify: FastifyInstance) => {
    // Create a new Category
    fastify.post<{ Body: m.InputCategory }>(
        "/categories",
        {
            schema: { body: m.ZInputCategory },
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
            },
            onRequest: [authorize(["employee"])],
        },
        ctrl.createChildCategory,
    );

    // All categories
    fastify.get(
        "/categories",
        { onRequest: [authorize(["employee"])] },
        ctrl.getAllCategories,
    );

    // Category details
    fastify.get<{ Params: { id: string } }>(
        "/categories/:id",
        {
            schema: { params: z.object({ id: z.string() }) },
            onRequest: [authorize(["employee"])],
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
            onRequest: [authorize(["employee"])],
        },
        ctrl.updateCategoryById,
    );

    // Delete Category
    fastify.delete<{ Params: { id: string } }>(
        "/categories/:id",
        {
            schema: { params: z.object({ id: z.string() }) },
            onRequest: [authorize(["employee"])],
        },
        ctrl.deleteCategoryById,
    );

    // All categories of an Category
    fastify.get<{ Params: { id: string } }>(
        "/categories/:id/categories",
        {
            schema: { params: z.object({ id: z.string() }) },
            onRequest: [authorize(["employee"])],
        },
        ctrl.getAllCategoriesOfCategory,
    );
};
