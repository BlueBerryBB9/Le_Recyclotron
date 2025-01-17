import { generateToken } from "../service/auth_service.js";
import SUser from "../models/User.js";
import SRole from "../models/Role.js";
import { handleError } from "../error/error.js";
import { FastifyReply, FastifyRequest } from "fastify";
import { intToString } from "../service/intToString.js";
import * as argon from "argon2";
import * as hashConfig from "../config/hash.js";
import { getRole } from "../service/getRole.js";
import { createOTP } from "../service/otpService.js";
import { MailService } from "../service/emailSender.js";
import * as env from "../config/env.js"

export const login = async (
    request: FastifyRequest<{ Body: { email: string; password: string } }>,
    reply: FastifyReply,
) => {
    try {
        const { email, password } = request.body;

        const user = await SUser.findOne({
            where: { email },
            include: [
                {
                    model: SRole,
                    attributes: ["id", "name"],
                },
            ],
        });

        if (!user || !(await argon.verify(user.password, password))) {
            return reply.status(401).send({
                error: "Authentication failed",
                message: "Invalid email or password",
            });
        }

        const otpPassword = Math.floor(
            100000 + Math.random() * 900000,
        ).toString(); // Generate a 6-digit OTP
        await createOTP(user.id, otpPassword);

        if (!env.EMAIL_SENDER || !env.EMAIL_PASSWORD) return;

        const mailService = new MailService(
            env.EMAIL_SENDER,
            env.EMAIL_PASSWORD,
        );
        await mailService.sendEmail(
            user.email,
            "Your OTP Code",
            `Your OTP code is: ${otpPassword}`,
        );

        const { password: _, ...userWithoutPassword } = user.toJSON();

        return reply.send({
            statusCode: 200,
            message: "Check your email for the OTP code",
        });
    } catch (error) {
        return handleError(error, reply);
    }
};

export const getCurrentUser = async (
    request: FastifyRequest<{ Body: { id: string } }>,
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
const tokenRevocations = {
    global: null as number | null,
    users: new Map<string, number>(),
};

export const revokeAllTokens = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    try {
        tokenRevocations.global = Date.now();
        return reply.send({
            message: "All Tokens was revoke",
        });
    } catch (error) {
        return reply.status(500).send({
            error: "Internal Server Error",
            message: "Error during revocation tokens",
        });
    }
};

export const revokeUserTokens = async (
    request: FastifyRequest<{
        Params: {
            userid: string;
        };
    }>,
    reply: FastifyReply,
) => {
    try {
        const userId = request.params.userid;
        tokenRevocations.users.set(userId, Date.now()); //la date à mettre sur une semaine
        return reply.send({
            message: "User token was revoke with succès",
        });
    } catch (error) {
        return reply.status(500).send({
            error: "Server Error",
            message: "Error since tokens revocation",
        });
    }
};

export const isTokenRevoked = (userId: string, tokenIat: number): boolean => {
    const tokenCreationDate = tokenIat * 1000;
    if (
        tokenRevocations.global &&
        tokenCreationDate < tokenRevocations.global
    ) {
        return true;
    }
    if (userId) {
        const userRevocationTime = tokenRevocations.users.get(userId);
        if (userRevocationTime && tokenCreationDate < userRevocationTime) {
            return true;
        }
        return false;
    }
    return false;
};
