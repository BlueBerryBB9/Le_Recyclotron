import { FastifyInstance } from "fastify";
import * as ctrl from "../controllers/categoryController.js";
import * as m from "../models/Category.js";
import z from "zod";
import { authorize } from "../middleware/auth.js";
import { defaultErrors } from "../utils/responseSchemas.js";

export default async (fastify: FastifyInstance) => {
    // Create a new Category
    fastify.post<{ Body: m.InputCategory }>(
        "/categories",
        {
            schema: {
                body: m.ZInputCategory,
                response: {
                    ...defaultErrors,
                    201: m.ZCategory,
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
                    ...defaultErrors,
                    201: m.ZCategory,
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
                    ...defaultErrors,
                    200: m.ZCategory,
                },
            },
        },
        ctrl.getAllCategories,
    );

    // Category details
    fastify.get(
        "/categories/:id",
        {
            schema: { params: z.object({ id: z.string() }) },
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

    // MAYBE USELESS WITH GET ALL ROUTE
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
