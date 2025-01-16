import { FastifyRequest, FastifyReply } from "fastify";
import { authenticate, authorize, isSelfOrAdmin } from "../middleware/auth.js";
import argon2 from "argon2id";
import SUser, {
    ZCreateUser,
    ZUpdateUser,
    CreateUser,
    UpdateUser,
} from "../models/User.js";
import SUserRole from "../models/UserRoles.js";
import SRole from "../models/Role.js";
import { BaseError, Error, ValidationError } from "sequelize";
import {
    RecyclotronApiErr,
    SequelizeApiErr,
} from "../error/recyclotronApiErr.js";
import { intToString } from "../service/intToString.js";
import { userInfo } from "os";

// Custom type for requests with params
interface RequestWithParams extends FastifyRequest {
    params: {
        id: string;
    };
}

// Create User
export const createUser = async (
    request: FastifyRequest<{ Body: CreateUser }>,
    reply: FastifyReply,
) => {
    try {
        const userData = ZCreateUser.parse(request.body);
        userData.password = await argon2.hash(userData.password, {
            type: argon2.argon2id,
        });

        const user = await SUser.create({
            userData,
        });

        const userWithRoles = await SUser.findByPk(user.id, {
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
        const userData = request.body;

        if (!user) throw new RecyclotronApiErr("User", "NotFound", 404);

        if (userData.password)
            userData.password = await argon2.hash(userData.password, {
                type: argon2.argon2id,
            });

        await user.update(userData);

        const updatedUser = await SUser.findByPk(user.id, {
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
                    roleId: role.id,
                    userId: user.id,
                },
            });
            if (userRole)
                throw new RecyclotronApiErr("User", "AlreadyExists", 409);
            SUserRole.create({ roleId: role.id, userId: user.id });
        }

        const updatedUser = await SUser.findByPk(user.id, {
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

        const updatedUser = await SUser.findByPk(user.id, {
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
