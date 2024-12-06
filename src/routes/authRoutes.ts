import { authenticate } from "../middleware/auth.js";
import * as authController from "../controllers/authController.js";
import { Identifier } from "sequelize";
import SUser from "../models/User.js";

export default async function authRoutes(fastify: {
    post: (
        arg0: string,
        arg1: (
            request: any,
            reply: {
                status: (arg0: number) => {
                    (): any;
                    new (): any;
                    send: {
                        (arg0: { error: string; message: string }): any;
                        new (): any;
                    };
                };
                send: (arg0: {
                    token: any;
                    user: {
                        id: number;
                        email: string;
                        first_name: string;
                        last_name: string;
                        roles: any;
                    };
                }) => any;
            },
        ) => Promise<any>,
    ) => void;
    get: (
        arg0: string,
        arg1: { onRequest: ((request: any, reply: any) => Promise<void>)[] },
        arg2: (
            request: { user: { id: Identifier | undefined } },
            reply: {
                status: (arg0: number) => {
                    (): any;
                    new (): any;
                    send: {
                        (arg0: { error: string; message: string }): any;
                        new (): any;
                    };
                };
                send: (arg0: SUser) => any;
            },
        ) => Promise<any>,
    ) => void;
}) {
    // Public routes
    //fastify.post('/auth/login', authController.login);

    // Protected routes
    fastify.get(
        "/auth/me",
        { onRequest: [authenticate] },
        authController.getCurrentUser,
    );
}
