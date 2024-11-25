import { FastifyRequest, FastifyReply } from "fastify";
import * as i from "../models/Category.js";

export const createCategory = async (
    request: FastifyRequest<{ Body: i.InputCategory }>,
    reply: FastifyReply,
) => {
    try {
        const { name } = request.body;
        const newCategory = await i.default.create({
            name,
        });
        reply.code(201).send({
            data: newCategory,
            message: "new Category created successfully",
        });
    } catch (error) {
        reply.code(500).send({ error: "Failed to create Category." });
    }
};

export const createChildCategory = async (
    request: FastifyRequest<{ Params: { id: string }; Body: i.InputCategory }>,
    reply: FastifyReply,
) => {
    try {
        const parent_category_id: number = parseInt(request.params.id);
        const { name } = request.body;
        const newCategory = await i.default.create({
            name,
            parent_category_id,
        });
        reply.code(201).send({
            data: newCategory,
            message: "newCategory created successfully",
        });
    } catch (error) {
        reply.code(500).send({ error: "Failed to create Category." });
    }
};

// Get all Categorys
export const getAllCategories = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    try {
        const categories = await i.default.findAll();
        reply.code(200).send({
            data: categories,
            message: "All categories fetched successfully",
        });
    } catch (error) {
        reply.code(500).send({ error: "Failed to retrieve Categorys." });
    }
};

// Get Category by ID
export const getCategoryById = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) => {
    try {
        const id: number = parseInt(request.params.id);
        const category = await i.default.findByPk(id);
        if (category) {
            reply.code(200).send({
                data: category,
                message: "category fetched by id successfully",
            });
        } else {
            reply.code(404).send({ error: "category not found." });
        }
    } catch (error) {
        reply.code(500).send({ error: "Failed to retrieve category." });
    }
};

// Updtade Category by ID
export const updateCategoryById = async (
    request: FastifyRequest<{
        Params: { id: string };
        Body: i.PartialCategory;
    }>,
    reply: FastifyReply,
) => {
    try {
        const id: number = parseInt(request.params.id);
        const { name } = request.body;
        const Category = await i.default.findByPk(id);
        if (Category) {
            await Category.update({ name });
            reply.code(200).send({
                message: "Category updated successfully",
            });
        } else {
            reply.code(404).send({ error: "Category not found." });
        }
    } catch (error) {
        reply.code(500).send({ error: "Failed to update Category." });
    }
};

// Delete Category by ID
export const deleteCategoryById = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) => {
    try {
        const id: number = parseInt(request.params.id);
        const category = await i.default.findByPk(id);
        if (category) {
            await category.destroy();
            reply.code(200).send({ message: "category deleted successfully." });
        } else {
            reply.code(404).send({ error: "category not found." });
        }
    } catch (error) {
        reply.code(500).send({ error: "Failed to delete category." });
    }
};

// Get all childCategories of category
export const getAllCategoriesOfCategory = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) => {
    try {
        const parent_category_id: number = parseInt(request.params.id);
        await i.default.findAll({
            where: { parent_category_id: parent_category_id },
        });
        reply.code(200).send({
            message: "All childCategory of category fetch successfully",
        });
    } catch (error) {
        reply.code(500).send({
            error: "An error occurred while retrieving the childCategories of the category.",
        });
    }
};
