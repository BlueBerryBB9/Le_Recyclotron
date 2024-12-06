import { FastifyInstance } from "fastify";
import * as userController from "../controllers/userController.js";
import * as u from "../models/User.js";
import { authenticate, authorize, isSelfOrAdmin } from "../middleware/auth.js";
import * as z from "zod";

export default async function userRoutes(fastify: FastifyInstance) {
    // Public routes
    fastify.post("/users", userController.createUser);

    // Protected routes
    fastify.get(
        "/users",
        // {
        //     onRequest: [authenticate, authorize(["Admin", "Employee"])],
        // },
        userController.getAllUsers,
    );

    fastify.get(
        "/users/:id",
        {
            // onRequest: [authenticate, isSelfOrAdmin],
            schema: { params: z.object({ id: z.string() }) },
        },
        userController.getUserById,
    );

    fastify.put(
        "/users/:id",
        {
            // onRequest: [authenticate, isSelfOrAdmin],
            schema: {
                params: z.object({ id: z.string() }),
                body: u.ZUpdateUser,
            },
        },
        userController.updateUser,
    );

    fastify.delete(
        "/users/:id",
        {
            // onRequest: [authenticate, authorize(["Admin"])],
            schema: { params: z.object({ id: z.string() }) },
        },
        userController.deleteUser,
    );

    // Role management routes (Admin only)
    fastify.post(
        "/users/:id/roles",
        {
            // onRequest: [authenticate, authorize(["Admin"])],
            schema: {
                params: z.object({ userId: z.string() }),
            },
        },
        userController.addUserRoles,
    );

    fastify.delete(
        "/users/:userId/roles/:roleId",
        {
            // onRequest: [authenticate, authorize(["Admin"])],
            schema: {
                params: z.object({ userId: z.string(), roleId: z.string() }),
            },
        },
        userController.removeUserRoles,
    );
}
