import { FastifyReply, FastifyRequest } from "fastify";
import * as e from "../models/Event.js";
import SRegistration from "../models/Registration.js";

export const createEvent = async (
    req: FastifyRequest<{ Body: e.InputEvent }>,
    rep: FastifyReply,
) => {
    const event = await e.default.create(req.body);

    return rep.status(201).send({
        data: event,
        message: "Event Created",
    });
};

export const getAllEvents = async (req: FastifyRequest, rep: FastifyReply) => {
    const events = await e.default.findAll();

    return rep.status(200).send({
        data: events,
        message: "Fetched all events",
    });
};

export const getEvent = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) => {
    const id: number = parseInt(req.params.id);
    const event = await e.default.findByPk(id);

    return rep.status(200).send({
        data: event,
        message: "Event fetched successfully",
    });
};

export const updateEvent = async (
    req: FastifyRequest<{ Params: { id: string }; Body: e.PartialEvent }>,
    rep: FastifyReply,
) => {
    const id: number = parseInt(req.params.id);
    const data = req.body;

    const event = await e.default.findByPk(id);

    if (!event) {
        return rep.status(404).send({ error: "Event not found" });
    }

    await event.update(data);
    return rep.status(200).send({
        data: event,
        message: "Event updated successfully",
    });
};

export const deleteEvent = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) => {
    const id: number = parseInt(req.params.id);

    await e.default.destroy({
        where: { id },
    });

    return rep.status(200).send({
        message: "Event deleted successfully",
    });
};

export const getAllEventRegistrations = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) => {
    const id: number = parseInt(req.params.id);
    const registrations = await SRegistration.findAll({
        where: { EventId: id },
    });

    return rep.status(200).send({
        data: registrations,
        message: "Fetched all event registrations",
    });
};
