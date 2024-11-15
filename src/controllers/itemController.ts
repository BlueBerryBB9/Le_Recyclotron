import { FastifyRequest, FastifyReply } from 'fastify';
import Item from '../models/Item.js';

// Create a new item
interface CreateItemRequestBody {
  name: string;
  status: string;
  material: string;
  image: string;
  date: string;
}

export const createItem = async (request: FastifyRequest<{ Body: CreateItemRequestBody }>, reply: FastifyReply) => {
  try {
    const { name, status, material, image, date } = request.body;
    const newItem = await Item.create({ name, status, material, image, date });
    reply.code(201).send(newItem);
  } catch (error) {
    reply.code(500).send({ error: 'Failed to create item.' });
  }
};

// Get all items
export const getAllItems = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const items = await Item.findAll();
    reply.send(items);
  } catch (error) {
    reply.code(500).send({ error: 'Failed to retrieve items.' });
  }
};

// Get item by ID
export const getItemById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    const item = await Item.findByPk(id);
    if (item) {
      reply.send(item);
    } else {
      reply.code(404).send({ error: 'Item not found.' });
    }
  } catch (error) {
    reply.code(500).send({ error: 'Failed to retrieve item.' });
  }
};

// Get items by status
export const getItemByStatus = async (request: FastifyRequest<{ Params: { status: string } }>, reply: FastifyReply) => {
  try {
    const { status } = request.params;
    const items = await Item.findAll({ where: { status } });
    reply.send(items);
  } catch (error) {
    reply.code(500).send({ error: 'Failed to retrieve items by status.' });
  }
};

// Update item by ID
interface UpdateItemRequestBody {
  name: string;
  status: string;
  material: string;
  image: string;
  date: string;
}
export const updateItemById = async (request: FastifyRequest<{ Params: { id: string }; Body: UpdateItemRequestBody }>, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    const { name, status, material, image, date } = request.body;
    const item = await Item.findByPk(id);
    if (item) {
      await item.update({ name, status, material, image, date });
      reply.send(item);
    } else {
      reply.code(404).send({ error: 'Item not found.' });
    }
  } catch (error) {
    reply.code(500).send({ error: 'Failed to update item.' });
  }
};

// Delete item by ID
export const deleteItemById = async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
  try {
    const { id } = request.params;
    const item = await Item.findByPk(id);
    if (item) {
      await item.destroy();
      reply.send({ message: 'Item deleted successfully.' });
    } else {
      reply.code(404).send({ error: 'Item not found.' });
    }
  } catch (error) {
    reply.code(500).send({ error: 'Failed to delete item.' });
  }
};
