import {
    FastifyInstance,
    FastifyRequest,
    RawServerDefault,
    RouteHandlerMethod,
} from "fastify";
import * as userController from "../controllers/userController.js";
import * as u from "../models/User.js";
import { authorize, isSelfOrAdminOrRh } from "../middleware/auth.js";
import * as z from "zod";
import { IncomingMessage, ServerResponse } from "http";

export default async (fastify: FastifyInstance) => {
    // Protected routes
    fastify.post("/users", {
        schema: {
            body: z.object({
                createUser: u.ZCreateUser,
                roles: z.array(z.number()),
            }),
        },
        preHandler: [authorize(["admin", "rh"])],
        handler: userController.createUser as RouteHandlerMethod<
            RawServerDefault,
            IncomingMessage,
            ServerResponse,
            {
                Body: {
                    createUser: u.CreateUser;
                    roles: number[];
                };
            }
        >,
    });

    fastify.get(
        "/users",
        {
            // onRequest: [authorize(["Admin", "Employee"])],
        },
        userController.getAllUsers,
    );

    fastify.get(
        "/users/:id",
        {
            // onRequest: [isSelfOrAdminOrRh],
            schema: { params: z.object({ id: z.string() }) },
        },
        userController.getUserById,
    );

    fastify.put(
        "/users/:id",
        {
            // onRequest: [isSelfOrAdminOrRh],
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
            // onRequest: [authorize(["admin", "rh"])],
            schema: { params: z.object({ id: z.string() }) },
        },
        userController.deleteUser,
    );

    // Role management routes (Admin only)
    fastify.post(
        "/users/:id/roles",
        {
            // onRequest: [authorize(["admin"])],
            schema: {
                params: z.object({ userId: z.string() }),
            },
        },
        userController.addUserRoles,
    );

    fastify.delete(
        "/users/:userId/roles/:roleId",
        {
            // onRequest: [authorize(["admin"])],
            schema: {
                params: z.object({ userId: z.string(), roleId: z.string() }),
            },
        },
        userController.removeUserRoles,
    );

    fastify.get(
        "/users/:id/payment",
        {
            // onRequest: [authorize(["admin"])],
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
            // onRequest: [authorize(["admin"])],
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
            // onRequest: [authorize(["admin"])],
        },
        userController.resetPassword,
    );
};
