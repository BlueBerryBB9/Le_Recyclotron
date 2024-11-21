import * as f from "fastify";
import * as ec from "../controllers/eventController.js";
import * as em from "../models/Event.js";
import z from "zod";

export default async (fastify: f.FastifyInstance) => {
    fastify.post<{ Body: em.InputEvent }>(
        "/event",
        { schema: { body: em.ZInputEvent } },
        ec.createEvent,
    );

    fastify.get("/event", ec.getAllEvents);

    fastify.get<{ Params: { id: string } }>(
        "/event/:id",
        { schema: { params: z.object({ id: z.string() }) } },
        ec.getEvent,
    );

    fastify.put<{ Params: { id: string }; Body: em.PartialEvent }>(
        "/event/:id",
        {
            schema: {
                body: em.ZPartialEvent,
                params: z.object({ id: z.string() }),
            },
        },
        ec.updateEvent,
    );

    fastify.delete<{ Params: { id: string } }>(
        "/event/:id",
        { schema: { params: z.object({ id: z.string() }) } },
        ec.deleteEvent,
    );

    fastify.get("/event/:id/registration", ec.getAllEventRegistrations);
};
