import { FastifyInstance } from "fastify";
import * as ctrl from "../controllers/categoryController.js";
import * as m from "../models/Category.js";
import z from "zod";

export default async (fastify: FastifyInstance) => {
    // Create a new Category
    fastify.post<{ Body: m.InputCategory }>(
        "/categories",
        { schema: { body: m.ZInputCategory } },
        ctrl.createCategory,
    );

    // All categories
    fastify.get(
        "/categories",
        { schema: { body: m.ZInputCategory } },
        ctrl.getAllCategories,
    );

    // Category details
    fastify.get<{ Params: { id: string } }>(
        "/categories/:id",
        { schema: { params: z.object({ id: z.string() }) } },
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
        },
        ctrl.updateCategoryById,
    );

    // Delete Category
    fastify.delete<{ Params: { id: string } }>(
        "/categories/:id",
        { schema: { params: z.object({ id: z.string() }) } },
        ctrl.deleteCategoryById,
    );

    // Add category to Category
    fastify.post<{ Params: { CategoryId: string; categoryId: string } }>(
        "/categories/:id/categories",
        {
            schema: {
                params: z.object({
                    CategoryId: z.string(),
                    categoryId: z.string(),
                }),
            },
        },
        ctrl.addCategoryToCategory,
    );

    // All categories of an Category
    fastify.get<{ Params: { id: string } }>(
        "/categories/:id/categories",
        { schema: { params: z.object({ CategoryId: z.string() }) } },
        ctrl.getAllCategoriesOfCategory,
    );

    // Delete category of an Category
    fastify.delete<{ Params: { CategoryId: string; categoryId: string } }>(
        "/categories/:id/categories/:id",
        {
            schema: {
                params: z.object({
                    CategoryId: z.string(),
                    categoryId: z.string(),
                }),
            },
        },
        ctrl.deleteCategoryOfCategory,
    );
};
