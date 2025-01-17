import { authenticate } from "../middleware/auth.js";
import * as authController from "../controllers/authController.js";
import { Identifier } from "sequelize";
import SUser from "../models/User.js";
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
            },
        },
        authController.login,
    );

    // Routes protégées
    fastify.get(
        "/auth/me",
        {
            schema: {
                body: {
                    id: z.string(),
                },
            },
        },
        authController.getCurrentUser,
    );

   // Route pour révoquer tous les tokens (globalement)
   fastify.post(
    "/auth/revoke-all",
    {
        // onRequest: [authenticate],
        schema: {
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
                }
            }
        }
    },
    authController.revokeAllTokens
);

// Route pour révoquer les tokens d'un utilisateur spécifique
fastify.post(
    "/auth/revoke-user/:userId",
    {
        // onRequest: [authenticate],
        schema: {
            params: z.object({
                userId: z.string()
            }),
            response: {
                200: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' }
                    }
                }
            }
        }
    },
    authController.revokeUserTokens
);
}
