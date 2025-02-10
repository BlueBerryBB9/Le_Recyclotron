import { FastifyReply, FastifyRequest } from "fastify";
import * as r from "../models/Registration.js";
import {
    RecyclotronApiErr,
    SequelizeApiErr,
} from "../error/recyclotronApiErr.js";
import { BaseError } from "sequelize";
import { stringToInt } from "../service/stringToInt.js";

// Wrap each controller method with try/catch for error handling
export const createRegistration = async (
    req: FastifyRequest<{ Body: r.InputRegistration }>,
    rep: FastifyReply<{
        Body: {
            data: r.Registration;
            message: string;
        };
    }>,
) => {
    try {
        const createdRegistration = await r.default.create(req.body);

        return rep.status(201).send({
            data: createdRegistration.dataValues,
            message: "Registration Created",
        });
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("Registration", error);
        } else throw new RecyclotronApiErr("Registration", "CreationFailed");
    }
};

// UPGRADE TO DO : REGROUP THEM BY EVENT
export const getAllRegistrations = async (
    req: FastifyRequest,
    rep: FastifyReply<{
        Body: {
            data: r.Registration[];
            message: string;
        };
    }>,
) => {
    try {
        const registrations = await r.default.findAll();
        if (registrations.length === 0)
            throw new RecyclotronApiErr("Registration", "NotFound", 404);

        return rep.status(200).send({
            data: registrations.map((reg) => {
                return reg.dataValues;
            }),
            message: "Fetched all Registrations",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Registration", error);
        } else throw new RecyclotronApiErr("Registration", "FetchAllFailed");
    }
};

export const getRegistration = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply<{
        Body: {
            data: r.Registration;
            message: string;
        };
    }>,
) => {
    try {
        const id: number = stringToInt(req.params.id, "Registration");
        const registration = await r.default.findByPk(id);
        if (!registration)
            throw new RecyclotronApiErr("Registration", "NotFound", 404);

        return rep.status(200).send({
            data: registration,
            message: "Registration fetched successfully",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Registration", error);
        } else throw new RecyclotronApiErr("Registration", "FetchFailed");
    }
};

export const updateRegistration = async (
    req: FastifyRequest<{
        Params: { id: string };
        Body: r.PartialRegistration;
    }>,
    rep: FastifyReply<{
        Body: {
            data: r.Registration;
            message: string;
        };
    }>,
) => {
    try {
        const id: number = stringToInt(req.params.id, "Registration");
        const data = req.body;

        const registration = await r.default.findByPk(id);

        if (!registration)
            throw new RecyclotronApiErr("Registration", "NotFound", 404);

        await registration.update(data);
        return rep.status(200).send({
            data: registration.dataValues,
            message: "Registration updated successfully",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Registration", error);
        } else throw new RecyclotronApiErr("Registration", "UpdateFailed");
    }
};

export const deleteRegistration = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply<{
        Body: {
            message: string;
        };
    }>,
) => {
    try {
        const id: number = stringToInt(req.params.id, "Registration");
        const registration = await r.default.findByPk(id);
        if (!registration)
            return new RecyclotronApiErr("Registration", "NotFound", 404);

        await registration.destroy();

        return rep.status(204).send({
            message: "Registration deleted successfully",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Registration", error);
        } else throw new RecyclotronApiErr("Registration", "DeletionFailed");
    }
};
