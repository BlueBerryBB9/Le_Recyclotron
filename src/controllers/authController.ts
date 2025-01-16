import argon2 from "argon2id";
import { generateToken } from "../config/auth.js";
import SUser from "../models/User.js";
import SRole from "../models/Role.js";
import { handleError } from "../error/error.js";
import { Identifier } from "sequelize";
import { FastifyReply, FastifyRequest } from "fastify";
import { intToString } from "../service/intToString.js";

export const login = async (
    request: FastifyRequest<{ Body: { email: string; password: string } }>,
    reply: FastifyReply,
) => {
    try {
        const { email, password } = request.body;

        const user = await SUser.findOne({
            where: { email },
            attributes: { exclude: ["password"] },
            include: [
                {
                    model: SRole,
                    attributes: ["id", "name"],
                },
            ],
        });

        if (!user) {
            return reply.status(401).send({
                error: "Authentication failed",
                message: "Invalid email or password",
            });
        }

        const isValidPassword = await argon2.verify(user.password, password);
        if (!isValidPassword) {
            return reply.status(401).send({
                error: "Authentication failed",
                message: "Invalid email or password",
            });
        }

        // const token = generateToken({id: user.id, email: user.email, roles: });
        let token = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

        return reply.send({
            token,
            user: user,
        });
    } catch (error) {
        return handleError(error, reply);
    }
};

export const getCurrentUser = async (
    request: {
        body: {
            id: string;
        };
    },
    reply: FastifyReply,
) => {
    try {
        const id = intToString(request.body.id, "Authentication");
        const user = await SUser.findByPk(id, {
            include: [
                {
                    model: SRole,
                    attributes: ["id", "name"],
                },
            ],
            attributes: { exclude: ["password"] },
        });

        if (!user) {
            return reply.status(404).send({
                error: "Not Found",
                message: "User not found",
            });
        }

        return reply.send(user);
    } catch (error) {
        return handleError(error, reply);
    }
};
