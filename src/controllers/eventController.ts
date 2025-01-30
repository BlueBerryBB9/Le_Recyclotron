import { FastifyReply, FastifyRequest } from "fastify";
import * as e from "../models/Event.js";
import SRegistration from "../models/Registration.js";
import {
    RecyclotronApiErr,
    SequelizeApiErr,
} from "../error/recyclotronApiErr.js";
import { BaseError } from "sequelize";
import { stringToInt } from "../service/stringToInt.js";

export const createEvent = async (
    req: FastifyRequest<{ Body: e.InputEvent }>,
    rep: FastifyReply,
) => {
    try {
        const event = await e.default.create(req.body);
        return rep.status(201).send({
            data: event.dataValues,
            message: "Event Created",
        });
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("Event", error);
        } else throw new RecyclotronApiErr("Event", "CreationFailed");
    }
};

export const getAllEvents = async (req: FastifyRequest, rep: FastifyReply) => {
    try {
        const events = await e.default.findAll();
        if (events.length === 0)
            throw new RecyclotronApiErr("Event", "NotFound", 404);

        return rep.status(200).send({
            data: events.map((event) => {
                return event.dataValues;
            }),
            message: "Fetched all events",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Event", error);
        } else throw new RecyclotronApiErr("Event", "FetchAllFailed");
    }
};

export const getEvent = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) => {
    try {
        const id: number = stringToInt(req.params.id, "Event");
        const event = await e.default.findByPk(id);
        if (!event) return new RecyclotronApiErr("Event", "NotFound", 404);

        return rep.status(200).send({
            data: event.dataValues,
            message: "Event fetched successfully",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Event", error);
        } else throw new RecyclotronApiErr("Event", "FetchFailed");
    }
};

export const updateEvent = async (
    req: FastifyRequest<{ Params: { id: string }; Body: e.PartialEvent }>,
    rep: FastifyReply,
) => {
    try {
        const id: number = stringToInt(req.params.id, "Event");
        const data = req.body;
        const event = await e.default.findByPk(id);
        if (!event) return new RecyclotronApiErr("Event", "NotFound", 404);

        await event.update(data);
        return rep.status(200).send({
            data: event.dataValues,
            message: "Event updated successfully",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Event", error);
        } else throw new RecyclotronApiErr("Event", "UpdateFailed");
    }
};

export const deleteEvent = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) => {
    try {
        const id: number = stringToInt(req.params.id, "Event");
        const event = await e.default.findByPk(id);
        if (!event) return new RecyclotronApiErr("Event", "NotFound", 404);

        await event.destroy();
        return rep.status(200).send({
            message: "Event deleted successfully",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Event", error);
        } else throw new RecyclotronApiErr("Event", "DeletionFailed");
    }
};

export const getAllEventRegistrations = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    response: FastifyReply,
) => {
    try {
        const id: number = stringToInt(request.params.id, "Event");
        const registrations = await SRegistration.findAll({
            where: { EventId: id },
        });
        if (registrations.length === 0)
            throw new RecyclotronApiErr("RegistrationInEvent", "NotFound", 404);

        return response.status(200).send({
            data: registrations,
            message: "Fetched all event registrations",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Event", error);
        } else
            throw new RecyclotronApiErr(
                "RegistrationInEvent",
                "FetchAllFailed",
            );
    }
};
