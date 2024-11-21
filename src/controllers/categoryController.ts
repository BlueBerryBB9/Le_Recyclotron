import { FastifyRequest, FastifyReply } from "fastify";
import * as i from "../models/Category.js";
import CategoryCategory from "../models/CategoryCategories.js";

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
        const Category = await i.default.findByPk(id);
        if (Category) {
            reply.code(200).send({
                data: Category,
                message: "Category fetched by id successfully",
            });
        } else {
            reply.code(404).send({ error: "Category not found." });
        }
    } catch (error) {
        reply.code(500).send({ error: "Failed to retrieve Category." });
    }
};

// Get Categorys by status
export const getCategoryByStatus = async (
    request: FastifyRequest<{ Params: { status: string } }>,
    reply: FastifyReply,
) => {
    try {
        const status = request.params.status;
        const categories = await i.default.findAll({ where: { status } });
        reply.code(200).send({
            data: categories,
            message: "categories fetched by status successfully",
        });
    } catch (error) {
        reply
            .code(500)
            .send({ error: "Failed to retrieve Categorys by status." });
    }
};

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
        const Category = await i.default.findByPk(id);
        if (Category) {
            await Category.destroy();
            reply.code(200).send({ message: "Category deleted successfully." });
        } else {
            reply.code(404).send({ error: "Category not found." });
        }
    } catch (error) {
        reply.code(500).send({ error: "Failed to delete Category." });
    }
};

// Add category to Category
export const addCategoryToCategory = async (
    request: FastifyRequest<{
        Params: { CategoryId: string; categoryId: string };
    }>,
    reply: FastifyReply,
) => {
    try {
        const CategoryId: number = parseInt(request.params.CategoryId);
        const categoryId: number = parseInt(request.params.categoryId);

        await CategoryCategory.create({
            CategoryId,
            categoryId,
        });

        reply.code(200).send({
            message: "All categories of Category fetch successfully",
        });
    } catch (error) {
        reply.code(500).send({
            error: "An error occurred while adding the category to the Category.",
        });
    }
};

// Get all categories of an Category
export const getAllCategoriesOfCategory = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) => {
    try {
        const CategoryId: number = parseInt(request.params.id);
        await CategoryCategory.findAll({
            where: { CategoryId: CategoryId },
        });
        reply.code(200).send({
            message: "All category of Category fetch successfully",
        });
    } catch (error) {
        reply.code(500).send({
            error: "An error occurred while retrieving the categories of the Category.",
        });
    }
};

// Delete category of an Category
export const deleteCategoryOfCategory = async (
    request: FastifyRequest<{
        Params: { CategoryId: string; categoryId: string };
    }>,
    reply: FastifyReply,
) => {
    try {
        const CategoryId = parseInt(request.params.CategoryId);
        const categoryId = parseInt(request.params.categoryId);
        await CategoryCategory.destroy({
            where: { CategoryId: CategoryId, categoryId: categoryId },
        });
        reply.code(200).send({
            message: "category removed from Category successfully",
        });
    } catch (error) {
        reply.code(500).send({
            error: "An error occurred while deleting the category from the Category.",
        });
    }
};
