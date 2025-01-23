import { FastifyRequest, FastifyReply } from "fastify";
import SUser, {
    ZCreateUser,
    ZUpdateUser,
    CreateUser,
    ResetPasswordRequest,
    ResetPassword,
    UpdateUser,
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

const mailService = new MailService("your-email@gmail.com", "your-password");
const tempCodes = new Map<string, { code: string; expiry: Date }>();

// Create User
export const createUser = async (
    request: FastifyRequest<{ Body: {createUser: CreateUser; roles: number[]} }>,
    reply: FastifyReply,
) => {
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

        return reply.status(201).send(userWithRoles);
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("User", error);
        } else throw new RecyclotronApiErr("User", "CreationFailed");
    }
};

// Get All Users
export const getAllUsers = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    try {
        const users = await SUser.findAll({
            include: [{ model: SRole, attributes: ["id", "name"] }],
            attributes: { exclude: ["password"] },
        });
        if (users.length === 0)
            throw new RecyclotronApiErr("User", "NotFound", 404);

        return reply.send(users);
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("User", error);
        } else throw new RecyclotronApiErr("User", "FetchAllFailed");
    }
};

// Get User by ID
export const getUserById = async (
    request: FastifyRequest<{
        Params: { id: string };
    }>,
    reply: FastifyReply,
) => {
    try {
        const user = await SUser.findByPk(request.params.id, {
            include: [{ model: SRole, attributes: ["id", "name"] }],
            attributes: { exclude: ["password"] },
        });

        if (!user) throw new RecyclotronApiErr("User", "NotFound", 404);

        return reply.send(user);
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("User", error);
        } else throw new RecyclotronApiErr("User", "FetchFailed");
    }
};

// Update User
export const updateUser = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateUser }>,
    reply: FastifyReply,
) => {
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
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("User", error);
        } else throw new RecyclotronApiErr("User", "UpdateFailed");
    }
};

// Delete User
export const deleteUser = async (
    request: FastifyRequest<{
        Params: { id: string };
    }>,
    reply: FastifyReply,
) => {
    try {
        const user = await SUser.findByPk(request.params.id);

        if (!user) throw new RecyclotronApiErr("User", "NotFound", 404);

        await user.destroy();
        return reply.status(204).send();
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("User", error);
        } else throw new RecyclotronApiErr("User", "UpdateFailed");
    }
};

// Add User Roles
export const addUserRoles = async (
    request: FastifyRequest<{
        Params: { id: string };
        Body: { roles: number[] };
    }>,
    reply: FastifyReply,
) => {
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
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("User", error);
        } else throw new RecyclotronApiErr("User", "UpdateFailed");
    }
};

// Remove User Roles
export const removeUserRoles = async (
    request: FastifyRequest<{
        Params: { userId: string; roleId: string };
    }>,
    reply: FastifyReply,
) => {
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
        if (error instanceof RecyclotronApiErr) {
            throw error;
        } else if (error instanceof BaseError) {
            throw new SequelizeApiErr("User", error);
        } else throw new RecyclotronApiErr("User", "DeletionFailed");
    }
};

export const forgotPassword = async (
    request: FastifyRequest<{ Body: ResetPasswordRequest }>,
    reply: FastifyReply,
) => {
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
            throw new RecyclotronApiErr("User", "EnvKeyMissing", 500)
        }
        let mailService = new MailService(EMAIL_SENDER, EMAIL_PASSWORD);
        await mailService.sendPasswordResetEmail(email, resetLink);

        return reply
            .status(200)
            .send({ message: "Email de réinitialisation envoyé" });
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        }
        throw new RecyclotronApiErr("User", "ResetRequestFailed");
    }
};

export const resetPassword = async (
    request: FastifyRequest<{ Body: ResetPassword }>,
    reply: FastifyReply,
) => {
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
        if (error instanceof RecyclotronApiErr) {
            throw error;
        }
        throw new RecyclotronApiErr("User", "ResetFailed");
    }
};
