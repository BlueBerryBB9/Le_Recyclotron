import { FastifyRequest, FastifyReply, RouteHandler } from "fastify";
import SUser, {
    ZCreateUser,
    ResetPasswordRequest,
    ResetPassword,
    UpdateUser,
    CreateUser,
} from "../models/User.js";
import SUserRole from "../models/UserRoles.js";
import SRole from "../models/Role.js";
import { BaseError, Op } from "sequelize";
import {
    RecyclotronApiErr,
    SequelizeApiErr,
} from "../error/recyclotronApiErr.js";
import { stringToInt } from "../service/stringToInt.js";
import * as argon from "argon2";
import * as hashConfig from "../config/hash.js";
import { MailService } from "../service/emailSender.js";
import SResetPassword from "../models/ResetPassword.js";
import { EMAIL_SENDER, FRONTEND_URL, SENDGRID_API_KEY } from "../config/env.js";
import * as r from "../models/Registration.js";
import SPayment from "../models/Payment.js";
import { getUserWithRoles } from "../service/userService.js";
import { getAllUserWithRoles } from "../service/userService.js";
import SEvent from "../models/Event.js";

// Create User
export const createUser = async (
    request: FastifyRequest<{
        Body: { createUser: CreateUser; roles: number[] };
    }>,
    reply: FastifyReply,
) => {
    try {
        const userData = ZCreateUser.parse(request.body.createUser);

        userData.password = await argon.hash(
            userData.password,
            hashConfig.argon2Options,
        );

        const user = await SUser.create({
            ...userData,
        });

        for (const role of request.body.roles) {
            if (role === 6)
                // 6 = client and employee =/= client
                throw new RecyclotronApiErr("User", "InvalidInput", 400);

            await SUserRole.create({
                roleId: role,
                userId: user.getDataValue("id"),
            });
        }

        const userWithRoles = await getUserWithRoles(user.getDataValue("id"));

        if (!userWithRoles) throw new RecyclotronApiErr("User", "NotFound");

        return reply.status(201).send({
            data: userWithRoles.toJSON(),
            message: "User created successfully",
        });
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("User", error);
        } else throw new RecyclotronApiErr("User", "CreationFailed");
    }
};

// Récupérer tous les utilisateurs
export const getAllUsers = async (_: FastifyRequest, reply: FastifyReply) => {
    try {
        let users = await getAllUserWithRoles();

        if (users.length === 0)
            throw new RecyclotronApiErr("User", "NotFound", 404);

        users = (
            await Promise.all(
                users.map(async (user) => {
                    const roles = await user.getRoleString();
                    return roles.includes("client") && !roles.includes("admin")
                        ? null
                        : user;
                }),
            )
        ).filter((user) => user !== null);

        return reply.status(200).send({
            data: await Promise.all(users.map(async (user) => user.toJSON())),
            message: "Users fetched successfully",
        });
    } catch (error) {
        if (error instanceof BaseError) {
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
        const user = await getUserWithRoles(
            stringToInt(request.params.id, "User"),
        );

        if (!user) throw new RecyclotronApiErr("User", "NotFound", 404);

        return reply.status(200).send({
            data: user.toJSON(),
            message: "User fetched successfully",
        });
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("User", error);
        } else if (error instanceof RecyclotronApiErr) {
            throw error;
        } else throw new RecyclotronApiErr("User", "FetchFailed");
    }
};

// Update User
export const updateUser = async (
    request: FastifyRequest<{
        Body: UpdateUser;
        Params: { id: string };
    }>,
    reply: FastifyReply,
) => {
    try {
        const user = await SUser.findByPk(request.params.id);
        const userData: UpdateUser = request.body;

        if (!user) throw new RecyclotronApiErr("User", "NotFound", 404);

        const roles = await user.getRoleString();
        if (
            (request.user.roles.includes("rh") && roles.includes("client")) ||
            roles.includes("admin")
        )
            throw new RecyclotronApiErr("User", "PermissionDenied", 401);

        user.setDataValue(
            "password",
            await argon.hash(
                user.getDataValue("password"),
                hashConfig.argon2Options,
            ),
        );

        await user.update(userData);

        const updatedUser = await getUserWithRoles(
            stringToInt(request.params.id, "User"),
        );

        if (!updatedUser) throw new RecyclotronApiErr("User", "NotFound", 404);

        return reply.status(200).send({
            data: updatedUser.toJSON(),
            message: `User No ${request.params.id} updated successfully`,
        });
    } catch (error) {
        if (error instanceof BaseError) {
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
        return reply.status(200).send({
            message: `User No ${request.params.id} deleted successfully`,
        });
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("User", error);
        } else throw new RecyclotronApiErr("User", "UpdateFailed");
    }
};

// Add User Roles COHéRENCE A IMPLEMENTER --> ADMIN = TOUT, CLIENT
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

        if ((await user.getRoleString()).includes("client")) {
            throw new RecyclotronApiErr("User", "PermissionDenied", 401);
        }

        const roles = await SRole.findAll({
            where: {
                id: request.body.roles,
            },
        });
        if (roles.length === 0)
            throw new RecyclotronApiErr("RoleInUser", "NotFound", 404);

        for (const role of roles) {
            const userRole = await SUserRole.findOne({
                where: {
                    roleId: role.getDataValue("id"),
                    userId: user.getDataValue("id"),
                },
            });
            if (userRole) continue;
            await SUserRole.create({
                roleId: role.getDataValue("id"),
                userId: user.getDataValue("id"),
            });
        }

        const updatedUser = await getUserWithRoles(
            stringToInt(request.params.id, "User"),
        );

        return reply.status(200).send({
            data: updatedUser?.toJSON(),
            message: "Roles added successfully",
        });
    } catch (error) {
        if (error instanceof BaseError) {
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
        const userId: number = stringToInt(request.params.userId, "User");
        const user = await SUser.findByPk(userId);
        if (!user) throw new RecyclotronApiErr("RoleInUser", "NotFound", 404);

        const roleId: number = stringToInt(request.params.roleId, "RoleInUser");
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

        const updatedUser = await getUserWithRoles(
            stringToInt(request.params.userId, "User"),
        );

        return reply.status(200).send({
            data: updatedUser?.toJSON(),
            message: "Role removed successfully",
        });
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("User", error);
        } else throw new RecyclotronApiErr("User", "DeletionFailed");
    }
};

export const getRegistrationsByUserId = async (
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) => {
    try {
        const id: number = stringToInt(req.params.id, "Registration");
        const registration = await r.default.findAll({
            where: {
                userId: id,
            },
            include: [
                {
                    model: SEvent,
                    as: "event",
                },
            ],
        });

        if (!registration)
            throw new RecyclotronApiErr("Registration", "NotFound", 404);

        return rep.status(200).send({
            data: registration.map((reg) => {
                return reg.toJSON();
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
        const id: number = stringToInt(req.params.id, "Payment");
        const payments = await SPayment.findAll({
            where: {
                userId: id,
            },
        });
        if (!payments) throw new RecyclotronApiErr("Payment", "NotFound", 404);

        return rep.status(200).send({
            data: payments.map((pay) => {
                return pay.toJSON();
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
        if (!EMAIL_SENDER || !SENDGRID_API_KEY) {
            throw new RecyclotronApiErr("User", "EnvKeyMissing", 500);
        }
        const mailService = new MailService(SENDGRID_API_KEY, EMAIL_SENDER);
        await mailService.sendPasswordResetEmail(email, resetLink);

        return reply.status(200).send({
            message: "Email de réinitialisation envoyé",
        });
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
        if (!user) throw new RecyclotronApiErr("User", "NotFound", 404);

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

        await resetRequest.update({ used: true });

        return reply.status(200).send({
            message: "Mot de passe réinitialisé avec succès",
        });
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("User", error);
        }
        throw new RecyclotronApiErr("User", "ResetFailed");
    }
};
