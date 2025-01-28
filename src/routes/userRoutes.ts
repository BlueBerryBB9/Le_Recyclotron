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

export default async (fastify: FastifyInstance) => {
    // Protected routes
    fastify.post("/users", {
        schema: {
            body: z.object({
                createUser: u.ZCreateUser,
                roles: z.array(z.number()),
            }),
        },
        preHandler: [authorize(["rh"])],
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

    try {
        fastify.get("/users", {
            preHandler: [authorize(["rh"])],
            handler: userController.getAllUsers as RouteHandlerMethod,
        });
    } catch (error) {
        console.log(error);
    }

    fastify.get("/users/:id", {
        schema: { params: z.object({ id: z.string() }) },
        preHandler: [await isSelfOrAdminOr()],
        handler: userController.getUserById as RouteHandlerMethod<
            RawServerDefault,
            IncomingMessage,
            ServerResponse,
            {
                Params: { id: string };
            }
        >,
    });

    fastify.put("/users/:id", {
        // preHandler: [isSelfOrAdminOr()],
        schema: {
            params: z.object({ id: z.string() }),
            body: u.ZUpdateUser,
        },
        handler: userController.updateUser as RouteHandlerMethod<
            RawServerDefault,
            IncomingMessage,
            ServerResponse,
            {
                Params: { id: string };
                Body: u.UpdateUser;
            }
        >,
    });

    fastify.delete("/users/:id", {
        preHandler: [authorize(["rh"])],
        schema: { params: z.object({ id: z.string() }) },
        handler: userController.deleteUser as RouteHandlerMethod<
            RawServerDefault,
            IncomingMessage,
            ServerResponse,
            {
                Params: { id: string };
            }
        >,
    });

    // Role management routes (Admin only)
    fastify.post("/users/:id/roles", {
        preHandler: [authorize(["rh"])],
        schema: {
            params: z.object({ userId: z.string() }),
        },
        handler: userController.addUserRoles as RouteHandlerMethod<
            RawServerDefault,
            IncomingMessage,
            ServerResponse,
            {
                Params: { id: string };
                Body: { roles: number[] };
            }
        >,
    });

    fastify.delete("/users/:userId/roles/:roleId", {
        preHandler: [authorize(["rh"])],
        schema: {
            params: z.object({ userId: z.string(), roleId: z.string() }),
        },
        handler: userController.removeUserRoles as RouteHandlerMethod<
            RawServerDefault,
            IncomingMessage,
            ServerResponse,
            {
                Params: { userId: string; roleId: string };
            }
        >,
    });

    // fastify.get("/users/:id/payment", {
    //     preHandler: [isSelfOrAdminOr()],
    //     schema: {
    //         params: z.object({ userId: z.string(), roleId: z.string() }),
    //     },
    //     handler: userController.getPaymentsByUserId as RouteHandlerMethod<
    //         RawServerDefault,
    //         IncomingMessage,
    //         ServerResponse,
    //         {
    //             Params: { userId: string; roleId: string };
    //         }
    //     >,
    // });

    // fastify.get("/users/:id/registrations", {
    //     preHandler: [authorize(["admin"])],
    //     schema: {
    //         params: z.object({ userId: z.string(), roleId: z.string() }),
    //     },
    //     handler: userController.getRegistrationsByUserId as RouteHandlerMethod<
    //         RawServerDefault,
    //         IncomingMessage,
    //         ServerResponse,
    //         {
    //             Params: { userId: string; roleId: string };
    //         }
    //     >,
    // });

    // Password reset routes
    fastify.post("/users/forgot-password", {
        schema: {
            body: z.object({ email: z.string().email() }),
        },
        preHandler: [authorize(["client"])],
        handler: userController.forgotPassword as RouteHandlerMethod<
            RawServerDefault,
            IncomingMessage,
            ServerResponse,
            {
                Body: u.ResetPasswordRequest;
            }
        >,
    });

    fastify.post("/users/reset-password", {
        schema: {
            body: z.object({
                email: z.string().email(),
                tempCode: z.string(),
                newPassword: z.string(),
            }),
        },
        preHandler: [authorize(["client"])],
        handler: userController.resetPassword as RouteHandlerMethod<
            RawServerDefault,
            IncomingMessage,
            ServerResponse,
            {
                Body: u.ResetPassword;
            }
        >,
    });
};
