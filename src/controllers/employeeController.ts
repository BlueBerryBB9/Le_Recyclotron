// src/controllers/employeeController.ts
import { FastifyReply, FastifyRequest } from 'fastify';
import Employee from '../models/Employee.js';

export const createEmployee = async (req: FastifyRequest, reply: FastifyReply) => {
  const { name, role } = req.body as { name: string; role: string };
  const employee = await Employee.create({ name, role });
  reply.send(employee);
};

// Ajoutez d'autres méthodes pour gérer les employés (mise à jour, suppression).
