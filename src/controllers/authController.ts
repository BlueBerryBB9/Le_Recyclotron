import { generateToken } from "../service/auth_service.js";
import SUser from "../models/User.js";
import SRole from "../models/Role.js";
import { FastifyReply, FastifyRequest } from "fastify";
import { intToString } from "../service/intToString.js";
import * as argon from "argon2";
import * as hashConfig from "../config/hash.js";
import { getRole } from "../service/getRole.js";
import { createOTP } from "../service/otpService.js";
import { MailService } from "../service/emailSender.js";
import * as env from "../config/env.js";
import { RecyclotronApiErr } from "../error/recyclotronApiErr.js";

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

        if (
            !user ||
            !(await argon.verify(user.getDataValue("password"), password))
        )
            throw new RecyclotronApiErr("Auth", "InvalidInput", 401);

        const otpPassword = Math.floor(
            100000 + Math.random() * 900000,
        ).toString(); // Generate a 6-digit OTP
        await createOTP(user.getDataValue("id"), otpPassword);

        if (!env.EMAIL_SENDER || !env.EMAIL_PASSWORD) return;

        const mailService = new MailService(
            env.EMAIL_SENDER,
            env.EMAIL_PASSWORD,
        );
        await mailService.sendEmail(
            user.getDataValue("email"),
            "Your OTP Code",
            `Your OTP code is: ${otpPassword}`,
        );

        const { password: _, ...userWithoutPassword } = user.toJSON();

        return reply.send({
            statusCode: 200,
            message: "Check your email for the OTP code",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else throw new RecyclotronApiErr("Auth", "OperationFailed");
    }
};

export const getCurrentUser = async (
    request: FastifyRequest<{ Body: { id: string } }>,
    reply: FastifyReply,
) => {
    try {
        const id = intToString(request.body.id, "Auth");
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
            throw new RecyclotronApiErr("Auth", "NotFound", 404);
        }

        return reply.send(user);
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else throw new RecyclotronApiErr("Auth", "OperationFailed");
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
            message: "All Tokens were revoked",
        });
    } catch (error) {
        throw new RecyclotronApiErr("Auth", "OperationFailed");
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
        tokenRevocations.users.set(userId, Date.now());
        return reply.send({
            message: "User token was revoked successfully",
        });
    } catch (error) {
        throw new RecyclotronApiErr("Auth", "OperationFailed");
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
