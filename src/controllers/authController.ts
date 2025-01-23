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
import { RecyclotronApiErr } from "../error/recyclotronApiErr.js";
import SRole from "../models/Role.js";

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

        const otpPassword = Math.floor(
            100000 + Math.random() * 900000,
        ).toString();
        await createOTP(newUser.getDataValue("id"), otpPassword);

        if (!env.EMAIL_SENDER || !env.EMAIL_PASSWORD) return;

        const mailService = new MailService(
            env.EMAIL_SENDER,
            env.EMAIL_PASSWORD,
        );
        await mailService.sendEmail(
            newUser.getDataValue("email"),
            "Your OTP Code",
            `Your OTP code is: ${otpPassword}`,
        );

        const { password: _, ...userWithoutPassword } = newUser.toJSON();

        return reply.send({
            statusCode: 201,
            message:
                "User registered successfully. Check your email for the OTP code",
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
    await verifyOTPservice(
        intToString(request.body.id, "Auth"),
        request.body.otp,
    );
    let user = await SUser.findByPk(request.body.id);
    if (!user) throw new RecyclotronApiErr("Auth", "NotFound", 500);

    return reply.send({
        statusCode: 200,
        message: "Authentication successful",
        jwt: generateToken(
            intToString(request.body.id, "Auth"),
            user.getDataValue("email"),
            user.getDataValue("roles"),
        ),
    });
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

        if (!user) throw new RecyclotronApiErr("Auth", "NotFound", 404);

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
    if (tokenRevocations.global && tokenCreationDate < tokenRevocations.global)
        return true;

    if (userId) {
        const userRevocationTime = tokenRevocations.users.get(userId);
        if (userRevocationTime && tokenCreationDate < userRevocationTime) {
            return true;
        }
        return false;
    }
    return false;
};
