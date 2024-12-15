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
        { schema:
            { body :
                {
                    id: z.string(),
                }
            }
        }
        authController.getCurrentUser);
}
