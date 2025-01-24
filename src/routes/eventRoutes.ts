import * as f from "fastify";
import * as ec from "../controllers/eventController.js";
import * as em from "../models/Event.js";
import z from "zod";
import { authorize } from "../middleware/auth.js";

export default async (fastify: f.FastifyInstance) => {
    fastify.post<{ Body: em.InputEvent }>(
        "/event",
        {
            schema: { body: em.ZInputEvent },
            onRequest: [authorize(['community_manager'])],
        },
        ec.createEvent,
    );

    fastify.get(
        "/event",
        // { onRequest: [authorize(['community_manager'])] },
        ec.getAllEvents,
    );

    fastify.get<{ Params: { id: string } }>(
        "/event/:id",
        {
            schema: { params: z.object({ id: z.string() }) },
            // onRequest: [authorize(['community_manager'])],
        },
        ec.getEvent,
    );

    fastify.put<{ Params: { id: string }; Body: em.PartialEvent }>(
        "/event/:id",
        {
            schema: {
                body: em.ZPartialEvent,
                params: z.object({ id: z.string() }),
            },
            // onRequest: [authorize(['community_manager'])],
        },
        ec.updateEvent,
    );

    fastify.delete<{ Params: { id: string } }>(
        "/event/:id",
        {
            schema: { params: z.object({ id: z.string() }) },
            onRequest: [authorize(['community_manager'])],
        },
        ec.deleteEvent,
    );

    fastify.get(
        "/event/:id/registration",
        // { onRequest: [authorize(['community_manager'])] },
        ec.getAllEventRegistrations,
    );
};
