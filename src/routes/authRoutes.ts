import { authorize, isSelfOrAdminOr } from "../middleware/auth.js";
import { ZUserWithRole } from "../models/User.js";
import * as authController from "../controllers/authController.js";
import { ZCreateUser } from "../models/User.js";
import { FastifyInstance } from "fastify";
import * as z from "zod";

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
                    200: {
                        zodSchema: z.object({
                            message: z.string(),
                        }),
                    },
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
                    201: {
                        zodSchema: z.object({
                            data: z.object({ id: z.string() }),
                            message: z.string(),
                        }),
                    },
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
                    200: {
                        zodSchema: z.object({
                            data: z.object({ jwt: z.string() }),
                            message: z.string(),
                        }),
                    },
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
                    200: {
                        zodSchema: z.object({
                            data: ZUserWithRole,
                            message: z.string(),
                        }),
                    },
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
                        zodSchema: z.object({
                            message: z.string(),
                        }),
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

                response: {
                    200: {
                        zodSchema: z.object({
                            message: z.string(),
                        }),
                    },
                },
            },
        },
        authController.revokeUserTokens,
    );
}
