// src/controllers/eventController.ts
import { FastifyReply, FastifyRequest } from 'fastify';
import Event from '../models/Event';

export const createEvent = async (req: FastifyRequest, reply: FastifyReply) => {
  const { title, description, date } = req.body as { title: string; description: string; date: Date };
  const event = await Event.create({ title, description, date });
  reply.send(event);
};

// Ajoutez des méthodes pour modifier ou supprimer les événements.
