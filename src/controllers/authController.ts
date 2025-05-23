import { generateToken } from "../service/authService.js";
import SUser, { CreateUser, ZCreateUser } from "../models/User.js";
import SUserRoles from "../models/UserRoles.js";
import { FastifyReply, FastifyRequest } from "fastify";
import { stringToInt } from "../service/stringToInt.js";
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
import { BaseError } from "sequelize";
import { getUserWithRoles } from "../service/userService.js";

//* login
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

        const mailService = new MailService();

        await mailService.sendEmail(
            user.getDataValue("email"),
            "Your Recyclotron OTP Code",
            `Your OTP code is: ${otpPassword}`,
        );

        return reply.status(200).send({
            message: "Check your email for the OTP code",
            id: user.getDataValue("id"),
        });
    } catch (error) {
        console.log(error);
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else throw new RecyclotronApiErr("Auth", "OperationFailed");
    }
};

//* register
export const register = async (
    request: FastifyRequest<{
        Body: CreateUser;
    }>,
    reply: FastifyReply,
) => {
    try {
        const userData = ZCreateUser.parse(request.body);

        const existingUser = await SUser.findOne({
            where: { email: userData.email },
        });
        if (existingUser)
            throw new RecyclotronApiErr("Auth", "AlreadyExists", 409);

        userData.password = await argon.hash(
            userData.password,
            hashConfig.argon2Options,
        );

        const newUser = await SUser.create({
            ...userData,
        });

        await SUserRoles.create({
            userId: newUser.getDataValue("id"),
            roleId: 6,
        });

        return reply.status(201).send({
            message: "User registered successfully. Please log in.",
        });
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("Auth", error);
        } else if (error instanceof RecyclotronApiErr) {
            throw error;
        } else throw new RecyclotronApiErr("Auth", "OperationFailed");
    }
};

//* verifOTP
export const verifyOTP = async (
    request: FastifyRequest<{ Body: { id: string; otp: string } }>,
    reply: FastifyReply,
) => {
    try {
        const isValid = await verifyOTPservice(
            stringToInt(request.body.id, "Auth"),
            request.body.otp,
        );
        if (!isValid) throw new RecyclotronApiErr("Auth", "InvalidInput", 400);

        const user = await SUser.findByPk(request.body.id);
        if (!user) throw new RecyclotronApiErr("Auth", "NotFound", 404);

        return reply.status(200).send({
            jwt: generateToken(
                stringToInt(request.body.id, "Auth"),
                user.getDataValue("email"),
                await user.getRoleString(),
            ),
            message: "Authentication successful",
        });
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("Auth", error);
        } else if (error instanceof RecyclotronApiErr) {
            throw error;
        } else throw new RecyclotronApiErr("Auth", "OperationFailed");
    }
};

//* getCurrentUser
export const getCurrentUser = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    try {
        request.jwtVerify();
        const id = request.user.id;
        const user = await getUserWithRoles(id);

        if (!user) throw new RecyclotronApiErr("Auth", "NotFound", 404);

        return reply.status(200).send({
            message: "Authentication successful",
            data: user.toJSON(),
        });
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("Auth", error);
        } else if (error instanceof RecyclotronApiErr) {
            throw error;
        } else throw new RecyclotronApiErr("Auth", "OperationFailed");
    }
};

//* revokeToken

export let tokenRevocations: {
    global: number | null;
    users: Map<string, number>;
};

if (env.NODE_ENV === "dev") {
    tokenRevocations = {
        global: null as number | null,
        users: new Map<string, number>(),
    };
} else {
    tokenRevocations = {
        global: Date.now() as number | null,
        users: new Map<string, number>(),
    };
}

//* revokeAllTokens
export const revokeAllTokens = async (
    _: FastifyRequest,
    reply: FastifyReply,
) => {
    try {
        tokenRevocations.global = Date.now();
        return reply.send({
            message: "All Tokens were revoked",
        });
    } catch {
        throw new RecyclotronApiErr("Auth", "OperationFailed");
    }
};

//* revokeUserTokens
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
        tokenRevocations.users.delete(userId);
        tokenRevocations.users.set(userId, Date.now());
        return reply.send({
            message: "User token was revoked successfully",
        });
    } catch {
        throw new RecyclotronApiErr("Auth", "OperationFailed", 401);
    }
};

//* isTokenRevoked
export const isTokenRevoked = (userId: number, tokenIat: number): boolean => {
    const tokenCreationDate = tokenIat * 1000;
    if (tokenRevocations.global && tokenCreationDate < tokenRevocations.global)
        return true;

    const userRevocationTime = tokenRevocations.users.get(userId.toString());
    if (userRevocationTime && tokenCreationDate < userRevocationTime)
        return true;
    return false;
};
