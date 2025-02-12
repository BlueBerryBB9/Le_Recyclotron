import * as f from "fastify";
import * as rc from "../controllers/registrationController.js";
import * as rm from "../models/Registration.js";
import z from "zod";
import { authorize, isSelfOrAdminOr } from "../middleware/auth.js";

export default async (fastify: f.FastifyInstance) => {
    fastify.post<{ Body: rm.InputRegistration }>(
        "/registration",
        {
            schema: {
                body: rm.ZInputRegistration,
                response: {
                    201: {
                        zodSchema: z.object({
                            data: rm.ZRegistration,
                            message: z.string(),
                        }),
                    },
                },
            },
            onRequest: [authorize(["client"])],
        },
        rc.createRegistration,
    );

    fastify.get<{ Params: { id: string } }>(
        "/registration/:id",
        {
            schema: {
                params: z.object({ id: z.string() }),
                response: {
                    200: {
                        zodSchema: z.object({
                            data: rm.ZRegistration,
                            message: z.string(),
                        }),
                    },
                },
            },
            onRequest: [await isSelfOrAdminOr([], "registration")],
        },
        rc.getRegistration,
    );

    fastify.put<{ Params: { id: string }; Body: rm.PartialRegistration }>(
        "/registration/:id",
        {
            schema: {
                body: rm.ZPartialRegistration,
                params: z.object({ id: z.string() }),
                response: {
                    200: {
                        zodSchema: z.object({
                            data: rm.ZRegistrationOutput,
                            message: z.string(),
                        }),
                    },
                },
            },
            onRequest: [await isSelfOrAdminOr([], "registration")],
        },
        rc.updateRegistration,
    );

    fastify.delete<{ Params: { id: string } }>(
        "/registration/:id",
        {
            schema: {
                params: z.object({ id: z.string() }),
                response: {
                    200: {
                        zodSchema: z.object({
                            message: z.string(),
                        }),
                    },
                },
            },
            onRequest: [await isSelfOrAdminOr([], "registration")],
        },
        rc.deleteRegistration,
    );
};
