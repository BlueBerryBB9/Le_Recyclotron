import { authorize, isSelfOrAdminOr } from "../middleware/auth.js";
import { ZUserWithRole } from "../models/User.js";
import * as authController from "../controllers/authController.js";
import { Identifier } from "sequelize";
import SUser, { ZCreateUser } from "../models/User.js";
import { FastifyInstance, RawServerDefault, RouteHandlerMethod } from "fastify";
import * as z from "zod";
import { IncomingMessage, ServerResponse } from "http";
import { defaultErrors, singleResponse } from "../utils/responseSchemas.js";

export default async function authRoutes(fastify: FastifyInstance) {
    // Routes publiques
    fastify.post(
        "/auth/login",
        {
            schema: {
                body: z.object({
                    email: z.string(),
                    password: z.string(),
                }),
                response: {
                    ...defaultErrors,
                    200: z.object({
                        message: z.string(),
                    }),
                },
            },
        },
        authController.login,
    );

    fastify.post(
        "/auth/register",
        {
            schema: {
                body: ZCreateUser,
                response: {
                    ...defaultErrors,
                    201: z.object({
                        data: z.object({ id: z.string() }),
                        message: z.string(),
                    }),
                },
            },
        },
        authController.register,
    );

    fastify.post(
        "/auth/verify_otp",
        {
            schema: {
                body: z.object({
                    id: z.string(),
                    otp: z.string(),
                }),
                response: {
                    ...defaultErrors,
                    200: z.object({
                        data: z.object({ jwt: z.string() }),
                        message: z.string(),
                    }),
                },
            },
        },
        authController.verifyOTP,
    );

    // Routes protégées
    fastify.get(
        "/auth/me",
        {
            schema: {
                response: {
                    ...defaultErrors,
                    200: ZUserWithRole,
                },
            },
            onRequest: [authorize(["client", "employee"])],
        },
        authController.getCurrentUser,
    );

    // Route pour révoquer tous les tokens (globalement)
    fastify.post(
        "/auth/revoke-all",
        {
            onRequest: [authorize(["admin"])],
            schema: {
                response: {
                    200: {
                        ...defaultErrors,
                        message: z.string(),
                    },
                },
            },
        },
        authController.revokeAllTokens,
    );

    // Route pour révoquer les tokens d'un utilisateur spécifique
    fastify.post(
        "/auth/revoke-user/:id",
        {
            onRequest: [await isSelfOrAdminOr()],
            schema: {
                params: z.object({
                    id: z.string(),
                }),
                schema: {
                    response: {
                        200: {
                            ...defaultErrors,
                            message: z.string(),
                        },
                    },
                },
            },
        },
        authController.revokeUserTokens,
    );
}
