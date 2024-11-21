import * as f from "fastify";
import * as rc from "../controllers/registrationController.js";
import * as rm from "../models/Registration.js";
import z from "zod";

export default async (fastify: f.FastifyInstance) => {
    fastify.post<{ Body: rm.InputRegistration }>(
        "/registration",
        { schema: { body: rm.ZInputRegistration } },
        rc.createRegistration,
    );

    fastify.get("/registration", rc.getAllRegistrations);

    fastify.get<{ Params: { id: string } }>(
        "/registration/:id",
        { schema: { params: z.object({ id: z.string() }) } },
        rc.getRegistration,
    );

    fastify.put<{ Params: { id: string }; Body: rm.PartialRegistration }>(
        "/registration/:id",
        {
            schema: {
                body: rm.ZPartialRegistration,
                params: z.object({ id: z.string() }),
            },
        },
        rc.updateRegistration,
    );

    fastify.delete<{ Params: { id: string } }>(
        "/registration/:id",
        { schema: { params: z.object({ id: z.string() }) } },
        rc.deleteRegistration,
    );
};
