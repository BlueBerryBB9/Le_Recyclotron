import { FastifyInstance } from "fastify";
import * as userController from "../controllers/userController.js";
import * as u from "../models/User.js";
import { authorize, isSelfOrAdmin } from "../middleware/auth.js";
import * as z from "zod";

export default async (fastify: FastifyInstance) => {
    // Public routes
    fastify.post(
        "/users",
        {
            schema: { body: u.ZCreateUser },
            onRequest: [authorise],
        },
        userController.createUser,
    );

    // Protected routes
    fastify.get(
        "/users",
        {
            onRequest: [authorise, authorize(["Admin", "Employee"])],
        },
        userController.getAllUsers,
    );

    fastify.get(
        "/users/:id",
        {
            onRequest: [authorise, isSelfOrAdmin],
            schema: { params: z.object({ id: z.string() }) },
        },
        userController.getUserById,
    );

    fastify.put(
        "/users/:id",
        {
            onRequest: [authorise, isSelfOrAdmin],
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
            onRequest: [authorise, authorize(["Admin"])],
            schema: { params: z.object({ id: z.string() }) },
        },
        userController.deleteUser,
    );

    // Role management routes (Admin only)
    fastify.post(
        "/users/:id/roles",
        {
            onRequest: [authorise, authorize(["Admin"])],
            schema: {
                params: z.object({ userId: z.string() }),
            },
        },
        userController.addUserRoles,
    );

    fastify.delete(
        "/users/:userId/roles/:roleId",
        {
            onRequest: [authorise, authorize(["Admin"])],
            schema: {
                params: z.object({ userId: z.string(), roleId: z.string() }),
            },
        },
        userController.removeUserRoles,
    );

    fastify.get(
        "/users/:id/payment",
        {
            onRequest: [authorise],
            schema: {
                params: z.object({ userId: z.string(), roleId: z.string() }),
            },
        },
        userController.removeUserRoles,
    );

    // Password reset routes
    fastify.post(
        "/users/forgot-password",
        {
            schema: {
                body: z.object({ email: z.string().email() }),
            },
            onRequest: [authorise],
        },
        userController.forgotPassword,
    );

    fastify.post(
        "/users/reset-password",
        {
            schema: {
                body: z.object({
                    email: z.string().email(),
                    tempCode: z.string(),
                    newPassword: z.string(),
                }),
            },
            onRequest: [authorise],
        },
        userController.resetPassword,
    );
};
