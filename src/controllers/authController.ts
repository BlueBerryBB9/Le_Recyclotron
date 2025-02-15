import { generateToken } from "../service/auth_service.js";
import SUser, { CreateUser } from "../models/User.js";
import SUserRoles from "../models/UserRoles.js";
import { FastifyReply, FastifyRequest } from "fastify";
import { intToString } from "../service/intToString.js";
import * as argon from "argon2";
import * as hashConfig from "../config/hash.js";
import { createOTP, verifyOTPservice } from "../service/otpService.js";
import { MailService } from "../service/emailSender.js";
import * as env from "../config/env.js";
import {
    RecyclotronApiErr,
    SequelizeApiErr,
} from "../error/recyclotronApiErr.js";
import SRole from "../models/Role.js";
import { EMAIL_PASSWORD, EMAIL_SENDER } from "../config/env.js";
import OTP from "../models/OTP.js";
import { BaseError } from "sequelize";

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
                    as: "roles",
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

        if (!EMAIL_SENDER || !EMAIL_PASSWORD) return;

        const mailService = new MailService(EMAIL_SENDER, EMAIL_PASSWORD);

        await mailService.sendEmail(
            user.getDataValue("email"),
            "Your OTP Code",
            `Your OTP code is: ${otpPassword}`,
        );

        // const { password: _, ...userWithoutPassword } = user.toJSON();

        return reply.send({
            statusCode: 200,
            message: "Check your email for the OTP code",
        });
    } catch (error) {
        console.log(error);
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else throw new RecyclotronApiErr("Auth", "OperationFailed");
    }
};

export const register = async (
    request: FastifyRequest<{
        Body: CreateUser;
    }>,
    reply: FastifyReply,
) => {
    try {
        const { email, password, first_name, last_name } = request.body;

        const existingUser = await SUser.findOne({ where: { email } });
        if (existingUser) {
            throw new RecyclotronApiErr("Auth", "AlreadyExists", 409);
        }

        const hashedPassword = await argon.hash(
            password,
            hashConfig.argon2Options,
        );

        const newUser = await SUser.create({
            email,
            password: hashedPassword,
            first_name,
            last_name,
        });

        const userRole = await SUserRoles.create({
            user_id: newUser.getDataValue("id"),
            role_id: 6,
        });

        return reply.send({
            statusCode: 201,
            message: "User registered successfully. Please log in.",
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else throw new RecyclotronApiErr("Auth", "OperationFailed");
    }
};

export const verifyOTP = async (
    request: FastifyRequest<{ Body: { id: string; otp: string } }>,
    reply: FastifyReply,
) => {
    let isValid = await verifyOTPservice(
        intToString(request.body.id, "Auth"),
        request.body.otp,
    );

    let user = await SUser.findByPk(request.body.id);
    if (!user) throw new RecyclotronApiErr("Auth", "NotFound", 500);

    OTP.destroy({
        where: {
            userId: request.body.id,
        },
    });

    if (!isValid) throw new RecyclotronApiErr("Auth", "InvalidInput", 400);

    return reply.send({
        statusCode: 200,
        message: "Authentication successful",
        jwt: generateToken(
            intToString(request.body.id, "Auth"),
            user.getDataValue("email"),
            await user.getRoleString(),
        ),
    });
};

export const getCurrentUser = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    try {
        request.jwtVerify();
        const id = request.user.id;
        const user = await SUser.findByPk(id, {
            include: [
                {
                    model: SRole,
                    attributes: ["id", "name"],
                    as: "roles",
                    through: { attributes: [] },
                },
            ],
            attributes: { exclude: ["password"] },
        });

        if (!user) throw new RecyclotronApiErr("Auth", "NotFound", 404);

        return reply.send(user);
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("Auth", error);
        } else if (error instanceof RecyclotronApiErr) {
            throw error;
        } else throw new RecyclotronApiErr("Auth", "OperationFailed");
    }
};

export const tokenRevocations = {
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
            id: string;
        };
    }>,
    reply: FastifyReply,
) => {
    try {
        const userId = request.params.id;
        console.log(tokenRevocations.users);
        tokenRevocations.users.delete(userId);
        console.log(tokenRevocations.users);
        tokenRevocations.users.set(userId, Date.now());
        console.log(tokenRevocations.users);
        return reply.send({
            message: "User token was revoked successfully",
        });
    } catch (error) {
        throw new RecyclotronApiErr("Auth", "OperationFailed");
    }
};

export const isTokenRevoked = (userId: number, tokenIat: number): boolean => {
    const tokenCreationDate = tokenIat * 1000;
    if (tokenRevocations.global && tokenCreationDate < tokenRevocations.global)
        return true;

    const userRevocationTime = tokenRevocations.users.get(userId.toString());
    if (userRevocationTime && tokenCreationDate < userRevocationTime)
        return true;
    return false;
};
