import {
    FastifyInstance,
    FastifyRequest,
    RawServerDefault,
    RouteHandlerMethod,
} from "fastify";
import * as userController from "../controllers/userController.js";
import * as u from "../models/User.js";
import { authorize, isSelfOrAdminOr } from "../middleware/auth.js";
import * as z from "zod";
import { IncomingMessage, request, ServerResponse } from "http";
import { where } from "sequelize";
import {
    defaultErrors,
    singleResponse,
    listResponse,
} from "../utils/responseSchemas.js";

export default async (fastify: FastifyInstance) => {
    // Protected routes
    fastify.post<{ Body: { createUser: u.CreateUser; roles: number[] } }>(
        "/users",
        {
            schema: {
                body: z.object({
                    createUser: u.ZCreateUser,
                    roles: z.array(z.number()),
                }),
                response: {
                    ...defaultErrors,
                    201: u.ZUserWithRole,
                },
            },
            onRequest: [authorize(["rh"])],
        },
        userController.createUser,
    );

    fastify.get(
        "/users",
        {
            schema: {
                response: {
                    ...defaultErrors,
                    200: u.ZUserWithRole,
                },
            },
            onRequest: [authorize(["rh"])],
        },
        userController.getAllUsers,
    );

    fastify.get(
        "/users/:id",
        {
            schema: {
                params: z.object({ id: z.string() }),
                response: {
                    ...defaultErrors,
                    200: u.ZUserWithRole,
                },
            },
            onRequest: [await isSelfOrAdminOr(["rh"])],
        },
        userController.getUserById,
    );

    fastify.put(
        "/users/:id",
        {
            onRequest: [await isSelfOrAdminOr(["rh"])],
            schema: {
                params: z.object({ id: z.string() }),
                body: u.ZUpdateUser,
                response: {
                    ...defaultErrors,
                    200: u.ZUserWithRole,
                },
            },
        },
        userController.updateUser,
    );

    fastify.delete<{ Params: { id: string } }>(
        "/users/:id",
        {
            onRequest: [authorize(["rh"])],
            schema: {
                params: z.object({ id: z.string() }),
                response: {
                    ...defaultErrors,
                    200: z.object({ message: z.string() }),
                },
            },
        },
        userController.deleteUser,
    );

    // Role management routes
    fastify.post<{ Params: { id: string }; Body: { roles: number[] } }>(
        "/users/:id/roles",
        {
            schema: {
                params: z.object({ id: z.string() }),
                body: z.object({ roles: z.array(z.number()) }),
            },
            onRequest: [authorize(["rh"])],
        },
        userController.addUserRoles,
    );

    fastify.delete<{ Params: { userId: string; roleId: string } }>(
        "/users/:userId/roles/:roleId",
        {
            schema: {
                params: z.object({ userId: z.string(), roleId: z.string() }),
            },
            onRequest: [authorize(["rh"])],
        },
        userController.removeUserRoles,
    );

    fastify.get<{ Params: { id: string } }>(
        "/users/:id/payments",
        {
            schema: {
                params: z.object({ id: z.string() }),
            },
            onRequest: [await isSelfOrAdminOr(["rh"])],
        },
        userController.getPaymentsByUserId,
    );

    fastify.get<{ Params: { id: string } }>(
        "/users/:id/registrations",
        {
            schema: {
                params: z.object({ id: z.string() }),
            },
            onRequest: [await isSelfOrAdminOr(["rh"])],
        },
        userController.getRegistrationsByUserId,
    );

    // Password reset routes
    fastify.post<{ Body: { email: string } }>(
        "/users/forgot-password",
        {
            schema: {
                body: z.object({ email: z.string().email() }),
            },
            onRequest: [authorize(["client"])],
        },
        userController.forgotPassword,
    );

    fastify.post<{
        Body: { email: string; tempCode: string; newPassword: string };
    }>(
        "/users/reset-password",
        {
            schema: {
                body: z.object({
                    email: z.string().email(),
                    tempCode: z.string(),
                    newPassword: z.string(),
                }),
            },
            onRequest: [authorize(["client"])],
        },
        userController.resetPassword,
    );
};
