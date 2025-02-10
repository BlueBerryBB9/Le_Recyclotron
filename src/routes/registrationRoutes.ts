import * as f from "fastify";
import * as rc from "../controllers/registrationController.js";
import * as rm from "../models/Registration.js";
import z from "zod";
import { authorize, isSelfOrAdminOr } from "../middleware/auth.js";
import { where } from "sequelize";
import { defaultErrors, singleResponse, listResponse } from "../utils/responseSchemas.js";

export default async (fastify: f.FastifyInstance) => {
    fastify.post<{ Body: rm.InputRegistration }>(
        "/registration",
        {
            schema: {
                body: rm.ZInputRegistration,
                response: {
                    ...defaultErrors,
                    201: singleResponse(rm.ZRegistration)
                }
            },
            onRequest: [authorize(["client"])],
        },
        rc.createRegistration,
    );

    fastify.get(
        "/registration",
        {
            schema: {
                response: {
                    ...defaultErrors,
                    200: listResponse(rm.ZRegistration)
                }
            },
            onRequest: [authorize(["cm"])],
        },
        rc.getAllRegistrations,
    );

    fastify.get<{ Params: { id: string } }>(
        "/registration/:id",
        {
            schema: { params: z.object({ id: z.string() }) },
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
            },
            onRequest: [await isSelfOrAdminOr([], "registration")],
        },
        rc.updateRegistration,
    );

    fastify.delete<{ Params: { id: string } }>(
        "/registration/:id",
        {
            schema: { params: z.object({ id: z.string() }) },
            onRequest: [await isSelfOrAdminOr([], "registration")],
        },
        rc.deleteRegistration,
    );
};
