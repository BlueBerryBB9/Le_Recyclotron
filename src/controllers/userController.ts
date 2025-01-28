import {
    FastifyRequest,
    FastifyReply,
    RawServerDefault,
    FastifySchema,
    RouteHandler,
} from "fastify";
import SUser, {
    ZCreateUser,
    ZUpdateUser,
    ResetPasswordRequest,
    ResetPassword,
    UpdateUser,
    CreateUser,
} from "../models/User.js";
import SUserRole from "../models/UserRoles.js";
import SRole from "../models/Role.js";
import { BaseError, Error, Op, ValidationError } from "sequelize";
import {
    RecyclotronApiErr,
    SequelizeApiErr,
} from "../error/recyclotronApiErr.js";
import { intToString } from "../service/intToString.js";
import { userInfo } from "os";
import * as argon from "argon2";
import * as hashConfig from "../config/hash.js";
import { MailService } from "../service/emailSender.js";
import SResetPassword from "../models/ResetPassword.js";
import { EMAIL_PASSWORD, EMAIL_SENDER, FRONTEND_URL } from "../config/env.js";
import * as z from "zod";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { Type } from "@sinclair/typebox";
import { IncomingMessage } from "http";
import * as r from "../models/Registration.js";

// Create User
export const createUser: RouteHandler<{
    Body: {
        createUser: CreateUser;
        roles: number[];
    };
}> = async (request, reply) => {
    try {
        const userData = ZCreateUser.parse(request.body.createUser);

        userData.password = await argon.hash(
            userData.password,
            hashConfig.argon2Options,
        );

        const user = await SUser.create({
            userData,
        });

        for (let role of request.body.roles) {
            SUserRole.create({
                roleId: role,
                userId: user.getDataValue("id"),
            });
        }

        const userWithRoles = await SUser.findByPk(user.getDataValue("id"), {
            include: [{ model: SRole, attributes: ["id", "name"] }],
            attributes: { exclude: ["password"] },
        });

        return reply.status(201).send(userWithRoles?.dataValues);
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("User", error);
        } else throw new RecyclotronApiErr("User", "CreationFailed");
    }
};

// Get All Users
export const getAllUsers: RouteHandler = async (request, reply) => {
    try {
        const users = await SUser.findAll({
            include: [
                {
                    model: SRole,
                    as: "roles", // Match the alias in setupAssociations
                    attributes: ["id", "name"], // Select specific fields
                },
            ],
            attributes: { exclude: ["password"] }, // Exclude sensitive fields
        });

        if (users.length === 0)
            throw new RecyclotronApiErr("User", "NotFound", 404);

        return reply.send(users);
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("User", error);
        } else throw new RecyclotronApiErr("User", "FetchAllFailed");
    }
};

// Get User by ID
export const getUserById: RouteHandler<{
    Params: { id: string };
}> = async (request, reply) => {
    try {
        const user = await SUser.findByPk(request.params.id, {
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

        if (!user) throw new RecyclotronApiErr("User", "NotFound", 404);

        return reply.send(user);
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("User", error);
        } else if (error instanceof RecyclotronApiErr) {
            throw error;
        } else throw new RecyclotronApiErr("User", "FetchFailed");
    }
};

// Update User
export const updateUser: RouteHandler<{
    Params: { id: string };
    Body: UpdateUser;
}> = async (request, reply) => {
    try {
        const user = await SUser.findByPk(request.params.id);
        const userData: UpdateUser = request.body;

        if (!user) throw new RecyclotronApiErr("User", "NotFound", 404);

        user.setDataValue(
            "password",
            await argon.hash(
                user.getDataValue("password"),
                hashConfig.argon2Options,
            ),
        );

        await user.update(userData);

        const updatedUser = await SUser.findByPk(user.getDataValue("id"), {
            include: [{ model: SRole, attributes: ["id", "name"] }],
            attributes: { exclude: ["password"] },
        });

        return reply.send(updatedUser);
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("User", error);
        } else throw new RecyclotronApiErr("User", "UpdateFailed");
    }
};

// Delete User
export const deleteUser: RouteHandler<{
    Params: { id: string };
}> = async (request, reply) => {
    try {
        const user = await SUser.findByPk(request.params.id);

        if (!user) throw new RecyclotronApiErr("User", "NotFound", 404);

        await user.destroy();
        return reply.status(204).send();
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("User", error);
        } else throw new RecyclotronApiErr("User", "UpdateFailed");
    }
};

// Add User Roles
export const addUserRoles: RouteHandler<{
    Params: { id: string };
    Body: { roles: number[] };
}> = async (request, reply) => {
    try {
        const user = await SUser.findByPk(request.params.id);
        if (!user) throw new RecyclotronApiErr("User", "NotFound", 404);

        const roles = await SRole.findAll({
            where: {
                id: request.body.roles,
            },
        });
        if (roles.length === 0)
            throw new RecyclotronApiErr("RoleInUser", "NotFound", 404);

        for (let role of roles) {
            let userRole = await SUserRole.findOne({
                where: {
                    roleId: role.getDataValue("id"),
                    userId: user.getDataValue("id"),
                },
            });
            if (userRole)
                throw new RecyclotronApiErr("User", "AlreadyExists", 409);
            SUserRole.create({
                roleId: role.getDataValue("id"),
                userId: user.getDataValue("id"),
            });
        }

        const updatedUser = await SUser.findByPk(user.getDataValue("id"), {
            include: [{ model: SRole, attributes: ["id", "name"] }],
            attributes: { exclude: ["password"] },
        });

        return reply.send(updatedUser);
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("User", error);
        } else throw new RecyclotronApiErr("User", "UpdateFailed");
    }
};

// Remove User Roles
export const removeUserRoles: RouteHandler<{
    Params: { userId: string; roleId: string };
}> = async (request, reply) => {
    try {
        const userId: number = intToString(request.params.userId, "User");
        const user = await SUser.findByPk(userId);
        if (!user) throw new RecyclotronApiErr("RoleInUser", "NotFound", 404);

        const roleId: number = intToString(request.params.roleId, "RoleInUser");
        const role = await SRole.findByPk(request.params.roleId);
        if (!role) throw new RecyclotronApiErr("RoleInUser", "NotFound", 404);

        const userRole = await SUserRole.findOne({
            where: {
                roleId: roleId,
                userId: userId,
            },
        });
        if (!userRole) throw new RecyclotronApiErr("UserRole", "NotFound", 404);
        await SUserRole.destroy({ where: { userId: userId, roleId: roleId } });

        const updatedUser = await SUser.findByPk(user.getDataValue("id"), {
            include: [{ model: SRole, attributes: ["id", "name"] }],
            attributes: { exclude: ["password"] },
        });

        return reply.send(updatedUser);
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("User", error);
        } else throw new RecyclotronApiErr("User", "DeletionFailed");
    }
};

// Forgot Password
export const forgotPassword: RouteHandler<{
    Body: ResetPasswordRequest;
}> = async (request, reply) => {
    try {
        const { email } = request.body;
        const user = await SUser.findOne({ where: { email } });

        if (!user) {
            throw new RecyclotronApiErr("User", "NotFound", 404);
        }

        // Générer un code temporaire
        const tempCode = Math.random().toString(36).substring(2, 8);

        // Créer l'entrée de réinitialisation
        await SResetPassword.create({
            userId: user.getDataValue("id"),
            resetCode: tempCode,
            expiryDate: new Date(Date.now() + 3600000), // 1 heure
            used: false,
        });

        // Envoyer l'email avec le code
        const resetLink = `${FRONTEND_URL}/reset-password?code=${tempCode}&email=${email}`;
        if (!EMAIL_SENDER || !EMAIL_PASSWORD) {
            throw new RecyclotronApiErr("User", "EnvKeyMissing", 500);
        }
        let mailService = new MailService(EMAIL_SENDER, EMAIL_PASSWORD);
        await mailService.sendPasswordResetEmail(email, resetLink);

        return reply
            .status(200)
            .send({ message: "Email de réinitialisation envoyé" });
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("User", error);
        }
        throw new RecyclotronApiErr("User", "ResetRequestFailed");
    }
};

// Reset Password
export const resetPassword: RouteHandler<{
    Body: ResetPassword;
}> = async (request, reply) => {
    try {
        const { email, tempCode, newPassword } = request.body;

        const user = await SUser.findOne({ where: { email } });
        if (!user) {
            throw new RecyclotronApiErr("User", "NotFound", 404);
        }

        const resetRequest = await SResetPassword.findOne({
            where: {
                userId: user.getDataValue("id"),
                resetCode: tempCode,
                used: false,
                expiryDate: {
                    [Op.gt]: new Date(),
                },
            },
        });

        if (!resetRequest) {
            throw new RecyclotronApiErr("User", "InvalidResetCode", 400);
        }

        // Mettre à jour le mot de passe
        const hashedPassword = await argon.hash(
            newPassword,
            hashConfig.argon2Options,
        );
        await user.update({ password: hashedPassword });

        // Marquer le code comme utilisé
        await resetRequest.update({ used: true });

        return reply
            .status(200)
            .send({ message: "Mot de passe réinitialisé avec succès" });
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("User", error);
        }
        throw new RecyclotronApiErr("User", "ResetFailed");
    }
};

export const getRegistrationsByUserId = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) => {
    try {
        const id: number = intToString(req.params.id, "Registration");
        const registration = await r.default.findAll({
            where: {
                userId: id,
            },
        });
        if (!registration)
            throw new RecyclotronApiErr("Registration", "NotFound", 404);

        return rep.status(200).send({
            data: registration.map((reg) => {
                return reg.dataValues;
            }),
            message: `Registrations fetched successfully for user No ${req.params.id}`,
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Registration", error);
        } else throw new RecyclotronApiErr("Registration", "FetchFailed");
    }
};

export const getPaymentsByUserId = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) => {
    try {
        const id: number = intToString(req.params.id, "Payment");
        const payments = await r.default.findAll({
            where: {
                userId: id,
            },
        });
        if (!payments) throw new RecyclotronApiErr("Payment", "NotFound", 404);

        return rep.status(200).send({
            data: payments.map((pay) => {
                return pay.dataValues;
            }),
            message: `Payments fetched successfully for user No ${req.params.id}`,
        });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("Payment", error);
        } else throw new RecyclotronApiErr("Payment", "FetchFailed");
    }
};
