import * as f from "fastify";
import * as rc from "../controllers/registrationController.js";
import * as rm from "../models/Registration.js";
import z from "zod";
import { authorize } from "../middleware/auth.js";

export default async (fastify: f.FastifyInstance) => {
    fastify.post<{ Body: rm.InputRegistration }>(
        "/registration",
        {
            schema: { body: rm.ZInputRegistration },
            onRequest: [{ authorize }],
        },
        rc.createRegistration,
    );

    fastify.get(
        "/registration",
        { onRequest: [{ authorize }] },
        rc.getAllRegistrations,
    );

    fastify.get<{ Params: { id: string } }>(
        "/registration/:id",
        {
            schema: { params: z.object({ id: z.string() }) },
            onRequest: [{ authorize }],
        },
        rc.getRegistration,
    );

    fastify.put<{ Params: { id: string }; Body: rm.PartialRegistration }>(
        "/registration/:id",
        {
            schema: {
                body: rm.ZPartialRegistration,
                params: z.object({ id: z.string() }),
            },
            onRequest: [{ authorize }],
        },
        rc.updateRegistration,
    );

    fastify.delete<{ Params: { id: string } }>(
        "/registration/:id",
        {
            schema: { params: z.object({ id: z.string() }) },
            onRequest: [{ authorize }],
        },
        rc.deleteRegistration,
    );
};
