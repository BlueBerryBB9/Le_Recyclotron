import { FastifyRequest, FastifyReply } from 'fastify';
import Category from '../models/Category.js';

//* Create a new category
export const createCategory = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { name } = request.body;
    const newcategory = await Category.create({ name });
    reply.code(201).send(newcategory);
  } catch (error) {
    reply.code(500).send({ error: 'Failed to create category.' });
  }
};

//* Get all categories
export const getAllCategories = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const categorys = await Category.findAll();
    reply.send(categorys);
  } catch (error) {
    reply.code(500).send({ error: 'Failed to retrieve categorys.' });
  }
};

//* Get category by ID
export const getCategoryById = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    const category = await Category.findByPk(id);
    if (category) {
      reply.send(category);
    } else {
      reply.code(404).send({ error: 'category not found.' });
    }
  } catch (error) {
    reply.code(500).send({ error: 'Failed to retrieve category.' });
  }
};

//* Update category by ID
export const updateCategoryById = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    const { name, status, material, image, date } = request.body;
    const category = await Category.findByPk(id);
    if (category) {
      await category.update({ name, status, material, image, date });
      reply.send(category);
    } else {
      reply.code(404).send({ error: 'category not found.' });
    }
  } catch (error) {
    reply.code(500).send({ error: 'Failed to update category.' });
  }
};

//* Delete category by ID
export const deleteCategoryById = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    const category = await Category.findByPk(id);
    if (category) {
      await category.destroy();
      reply.send({ message: 'category deleted successfully.' });
    } else {
      reply.code(404).send({ error: 'category not found.' });
    }
  } catch (error) {
    reply.code(500).send({ error: 'Failed to delete category.' });
  }
};
