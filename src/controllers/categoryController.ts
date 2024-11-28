import { FastifyRequest, FastifyReply } from "fastify";
import * as i from "../models/Category.js";
import { RecyclotronApiErr } from "../error/recyclotronApiErr.js";

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
        throw new RecyclotronApiErr("Category", "CreationFailed");
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
        throw new RecyclotronApiErr("Category", "CreationFailed");
    }
};

// Get all Categorys
export const getAllCategories = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    try {
        const categories = await i.default.findAll();
        if (!categories) {
            return new RecyclotronApiErr("Category", "NotFound", 404);
        }
        reply.code(200).send({
            data: categories,
            message: "All categories fetched successfully",
        });
    } catch (error) {
        throw new RecyclotronApiErr("Category", "FetchAllFailed");
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
        if (!category) {
            return new RecyclotronApiErr("Category", "NotFound", 404);
        }
        reply.code(200).send({
            data: category,
            message: "category fetched by id successfully",
        });
    
    } catch (error) {
        throw new RecyclotronApiErr("Category", "FetchFailed");
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
        if (!Category) {
            return new RecyclotronApiErr("Category", "NotFound", 404);
        } 
        await Category.update({ name });
        reply.code(200).send({
            message: "Category updated successfully",
        });
    } catch (error) {
        throw new RecyclotronApiErr("Category", "UpdateFailed");
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
        if (!category) {
            return new RecyclotronApiErr("Category", "NotFound", 404);
        }
        await category.destroy();
        reply.code(200).send({ message: "category deleted successfully." });
    } catch (error) {
        throw new RecyclotronApiErr("Category", "DeletionFailed");
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
        throw new RecyclotronApiErr("Category", "FetchAllFailed");
    }
};
