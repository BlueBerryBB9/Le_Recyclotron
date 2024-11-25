import { FastifyInstance } from "fastify";
import * as userController from "../controllers/userController.js";
import * as um from "../models/User.js";
import z from "zod";

export default async function userRoutes(fastify: FastifyInstance) {
    // Routes CRUD de base
    fastify.post<{ Body: um.CreateUser }>(
        "/users",
        { schema: { body: um.ZCreateUser } },
        userController.createUser,
    );

    fastify.get("/users", userController.getAllUsers);

    fastify.get<{ Params: { id: string } }>(
        "/users/:id",
        { schema: { params: z.object({ id: z.string() }) } },
        userController.getUserById,
    );

    fastify.put<{ Params: { id: string }; Body: um.UpdateUser }>(
        "/users/:id",
        {
            schema: {
                body: um.ZUpdateUser,
                params: z.object({ id: z.string() }),
            },
        },
        userController.updateUser,
    );

    fastify.delete<{ Params: { id: string } }>(
        "/users/:id",
        { schema: { params: z.object({ id: z.string() }) } },
        userController.deleteUser,
    );

    // Routes pour la gestion des rôles
    fastify.post<{ Params: { id: string }; Body: { roles: number[] } }>(
        "/users/:id/roles",
        {
            schema: {
                body: z.object({ roles: z.array(z.number()) }),
                params: z.object({ id: z.string() }),
            },
        },
        userController.addUserRoles,
    );

    fastify.delete<{ Params: { id: string }; Body: { roles: number[] } }>(
        "/users/:id/roles",
        {
            schema: {
                body: z.object({ roles: z.array(z.number()) }),
                params: z.object({ id: z.string() }),
            },
        },
        userController.removeUserRoles,
    );
}
