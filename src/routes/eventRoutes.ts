import * as f from "fastify";
import * as ec from "../controllers/eventController.js";
import * as em from "../models/Event.js";
import * as r from "../models/Registration.js";
import z from "zod";
import { authorize } from "../middleware/auth.js";

export default async (fastify: f.FastifyInstance) => {
    fastify.post<{ Body: em.InputEvent }>(
        "/event",
        {
            schema: {
                body: em.ZInputEvent,
                response: {
                    201: {
                        zodSchema: z.object({
                            data: em.ZEvent,
                            message: z.string(),
                        }),
                    },
                },
            },
            onRequest: [authorize(["cm"])],
        },
        ec.createEvent,
    );

    fastify.get(
        "/event",
        {
            schema: {
                response: {
                    200: {
                        zodSchema: z.object({
                            data: z.array(em.ZEvent),
                            message: z.string(),
                        }),
                    },
                },
            },
        },
        ec.getAllEvents,
    );

    fastify.get<{ Params: { id: string } }>(
        "/event/:id",
        {
            schema: {
                params: z.object({ id: z.string() }),
                response: {
                    200: {
                        zodSchema: z.object({
                            data: em.ZEvent,
                            message: z.string(),
                        }),
                    },
                },
            },
        },
        ec.getEvent,
    );

    fastify.put<{ Params: { id: string }; Body: em.PartialEvent }>(
        "/event/:id",
        {
            schema: {
                body: em.ZPartialEvent,
                params: z.object({ id: z.string() }),
                response: {
                    200: {
                        zodSchema: z.object({
                            data: em.ZEvent,
                            message: z.string(),
                        }),
                    },
                },
            },
            onRequest: [authorize(["cm"])],
        },
        ec.updateEvent,
    );

    fastify.delete<{ Params: { id: string } }>(
        "/event/:id",
        {
            schema: {
                params: z.object({ id: z.string() }),
                response: {
                    200: {
                        zodSchema: z.object({ message: z.string() }),
                    },
                },
            },
            onRequest: [authorize(["cm"])],
        },
        ec.deleteEvent,
    );

    fastify.get<{ Params: { id: string } }>(
        "/event/:id/registrations",
        {
            schema: {
                params: z.object({ id: z.string() }),
                response: {
                    200: {
                        zodSchema: z.object({
                            data: r.ZEventWithRegistrations,
                            message: z.string(),
                        }),
                    },
                },
            },
            onRequest: [authorize(["employee"])],
        },
        ec.getAllEventRegistrations,
    );
};
