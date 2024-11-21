import { FastifyReply, FastifyRequest } from "fastify";
import * as r from "../models/Registration.js";

export const createRegistration = async (
    req: FastifyRequest,
    rep: FastifyReply,
) => {
    const registration = req.body as r.InputRegistration;
    const createdRegistration = await r.default.create(registration);

    return rep.status(201).send({
        data: createdRegistration,
        message: "Registration Created",
    });
};

export const getAllRegistrations = async (
    req: FastifyRequest,
    rep: FastifyReply,
) => {
    const registrations = await r.default.findAll();

    return rep.status(200).send({
        data: registrations,
        message: "Fetched all Registrations",
    });
};

export const getRegistration = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) => {
    const id: number = parseInt(req.params.id);
    const registration = await r.default.findByPk(id);

    return rep.status(200).send({
        data: registration,
        message: "Registration fetched successfully",
    });
};

export const updateRegistration = async (
    req: FastifyRequest<{
        Params: { id: string };
        Body: r.PartialRegistration;
    }>,
    rep: FastifyReply,
) => {
    const id: number = parseInt(req.params.id);
    const data = req.body;

    const registration = await r.default.findByPk(id);

    if (!registration) {
        return rep.status(404).send({ error: "Registration not found" });
    }

    await registration.update(data);
    return rep.status(200).send({
        data: registration,
        message: "Registration updated successfully",
    });
};

export const deleteRegistration = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) => {
    const id: number = parseInt(req.params.id);

    await r.default.destroy({
        where: { id },
    });

    return rep.status(200).send({
        message: "Registration deleted successfully",
    });
};
