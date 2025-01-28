import { authorize, isSelfOrAdminOr } from "../middleware/auth.js";
import * as authController from "../controllers/authController.js";
import { Identifier } from "sequelize";
import SUser from "../models/User.js";
import { FastifyInstance, RawServerDefault, RouteHandlerMethod } from "fastify";
import * as z from "zod";
import { IncomingMessage, ServerResponse } from "http";

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
            },
        },
        authController.login,
    );

    fastify.post(
        "/auth/verify_otp",
        {
            schema: {
                body: z.object({
                    id: z.string(),
                    otp: z.string(),
                }),
            },
        },
        authController.verifyOTP,
    );

    // Routes protégées
    fastify.get(
        "/auth/me",
        {
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
                        type: "object",
                        properties: {
                            message: { type: "string" },
                        },
                    },
                },
            },
        },
        authController.revokeAllTokens,
    );

    // Route pour révoquer les tokens d'un utilisateur spécifique
    fastify.post("/auth/revoke-user/:id", {
        preHandler: [await isSelfOrAdminOr()],
        schema: {
            params: z.object({
                id: z.string(),
            }),
        },
        handler: authController.revokeUserTokens as RouteHandlerMethod<
            RawServerDefault,
            IncomingMessage,
            ServerResponse,
            {
                Params: { id: string };
            }
        >,
    });
}
