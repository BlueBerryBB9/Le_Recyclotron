import { FastifyReply, FastifyRequest } from "fastify";
import SRegistration, * as r from "../models/Registration.js";
import {
    RecyclotronApiErr,
    SequelizeApiErr,
} from "../error/recyclotronApiErr.js";
import { stringToInt } from "../service/stringToInt.js";
import { BaseError } from "sequelize";

// Wrap each controller method with try/catch for error handling
export const createRegistration = async (
    req: FastifyRequest<{ Body: r.InputRegistration }>,
    rep: FastifyReply,
) => {
    try {
        const createdRegistration = await r.default.create(req.body);
        if (
            await SRegistration.findOne({
                where: {
                    userId: createdRegistration.getDataValue("userId"),
                    eventId: createdRegistration.getDataValue("eventId"),
                },
            })
        )
            throw new RecyclotronApiErr("Registration", "AlreadyExists", 409);

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

export const getRegistration = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) => {
    try {
        const id: number = stringToInt(req.params.id, "Registration");
        const registration = await r.default.findByPk(id);
        if (!registration)
            throw new RecyclotronApiErr("Registration", "NotFound", 404);

        return rep.status(200).send({
            data: registration.dataValues,
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
        Body: r.UpdateRegistration;
    }>,
    rep: FastifyReply,
) => {
    try {
        const id: number = stringToInt(req.params.id, "Registration");
        const data = req.body;

        if (data.seats !== undefined && data.seats <= 0)
            throw new RecyclotronApiErr("Registration", "InvalidInput", 400);

        const registration = await r.default.findByPk(id);

        if (!registration)
            throw new RecyclotronApiErr("Registration", "NotFound", 404);

        await registration.update(data);

        const updatedRegistration = await r.default.findByPk(id, {
            include: r.default.associations.event,
        });

        return rep.status(200).send({
            data: updatedRegistration?.dataValues,
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
    rep: FastifyReply,
) => {
    try {
        const id: number = stringToInt(req.params.id, "Registration");
        const registration = await r.default.findByPk(id);
        if (!registration)
            return new RecyclotronApiErr("Registration", "NotFound", 404);

        await registration.destroy();

        return rep.status(200).send({
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
