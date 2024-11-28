import { FastifyRequest, FastifyReply } from "fastify";
import bcrypt from "bcrypt";
import { RecyclotronApiErr } from "../error/recyclotronApiErr.js";

import SUser, {
    ZCreateUser,
    ZUpdateUser,
    CreateUser,
    UpdateUser,
} from "../models/User.js";
import SRole from "../models/Role.js";
import { BaseError, Error, ValidationError } from "sequelize";

// Custom type for requests with params
interface RequestWithParams extends FastifyRequest {
    params: {
        id: string;
    };
}


// Créer un nouvel utilisateur
export const createUser = async (
    request: FastifyRequest<{ Body: CreateUser }>,
    reply: FastifyReply,
) => {
    try {
        const userData = ZCreateUser.parse(request.body);
        // Hash the password
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = await SUser.create({
            ...userData,
            password: hashedPassword,
        });

        // If roles are provided, associate them
        if (userData.roles && userData.roles.length > 0) {
            const roles = await SRole.findAll({
                where: {
                    id: userData.roles,
                },
            });
            await user.set("roles", roles);
        }

        // Fetch the user with roles
        const userWithRoles = await SUser.findByPk(user.id, {
            include: [{ model: SRole, attributes: ["id", "name"] }],
            attributes: { exclude: ["password"] },
        });

        return reply.status(201).send(userWithRoles);
    } catch (error) {
        if (error) {
            throw new RecyclotronApiErr("User","InvalidInput",400)
        }
        throw new RecyclotronApiErr("User", "CreationFailed",500);
    }
};

// Récupérer tous les utilisateurs
export const getAllUsers = async (
    request: FastifyRequest,
    reply: FastifyReply,
) => {
    try {
        const users = await SUser.findAll({
            include: [{ model: SRole, attributes: ["id", "name"] }],
            attributes: { exclude: ["password"] },
        });
        return reply.send(users);
    } catch (error) {
        throw new RecyclotronApiErr("User","FetchAllFailed",500);
    }
};
// Récupérer un utilisateur par ID
export const getUserById = async (
    request: RequestWithParams,
    reply: FastifyReply,
) => {
    try {
        const user = await SUser.findByPk(request.params.id, {
            include: [{ model: SRole, attributes: ["id", "name"] }],
            attributes: { exclude: ["password"] },
        });

        if (!user)
                throw new RecyclotronApiErr("User","NotFound",404)

        return reply.send(user);
    } catch (error) {
        if(error instanceof RecyclotronApiErr)
            throw error;
        else if (error instanceof BaseError) {
            throw new RecyclotronApiErr(
                "User",
                "DatabaseFailed",
                500,
                error.message,
            );
        throw new RecyclotronApiErr("User", "FetchFailed",500);
        }
    }
};

// Mettre à jour un utilisateur
export const updateUser = async (
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateUser }>,
    reply: FastifyReply,
) => {
    try {
        const userData = ZUpdateUser.parse(request.body);
        const id: number = parseInt(request.params.id);
        const user = await SUser.findByPk(id);

        if (!user) {
            throw new RecyclotronApiErr("User","NotFound",404);
        }

        // If password is being updated, hash it
        if (userData.password) {
            userData.password = await bcrypt.hash(userData.password, 10);
        }

        await user.update(userData);

        // Update roles if provided
        if (userData.roles) {
            const roles = await SRole.findAll({
                where: {
                    id: userData.roles,
                },
            });
            await user.set("roles", roles);
        }

        // Fetch updated user with roles
        const updatedUser = await SUser.findByPk(user.id, {
            include: [{ model: SRole, attributes: ["id", "name"] }],
            attributes: { exclude: ["password"] },
        });

        return reply.send(updatedUser);
    } catch (error) {
        if (error instanceof ValidationError){
            throw new RecyclotronApiErr("User","InvalidInput",400, error.message);
        }
        if (error instanceof BaseError){
            throw new RecyclotronApiErr("User","DatabaseFailed",500, error.message);
        }
        throw new RecyclotronApiErr("User", "UpdateFailed",500);
    }
};

// Supprimer un utilisateur
export const deleteUser = async (
    request: RequestWithParams,
    reply: FastifyReply,
) => {
    try {
        const user = await SUser.findByPk(parseInt(request.params.id));

        if (!user) {
            throw new RecyclotronApiErr("User","NotFound",400);
        }

        await user.destroy();
        return reply.status(204).send();
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        }
        throw new RecyclotronApiErr("User", "DeletionFailed",500);
    }
};

// Ajouter des rôles à un utilisateur
export const addUserRoles = async (
    request: FastifyRequest<{
        Params: { id: string };
        Body: { roles: number[] };
    }>,
    reply: FastifyReply,
) => {
    try {
        const id: number = parseInt(request.params.id);
        const user = await SUser.findByPk(id);
        if (!user) { 
            throw new RecyclotronApiErr("User","NotFound",404);
        }
;
        const roles = await SRole.findAll({
            where: {
                id: (request.body as { roles: number[] }).roles,
            },
        });

        await user.$add("roles", roles);

        // Fetch updated user with roles
        const updatedUser = await SUser.findByPk(user.id, {
            include: [{ model: SRole, attributes: ["id", "name"] }],
            attributes: { exclude: ["password"] },
        });

        return reply.send(updatedUser);
    } catch (error) {
        if (error instanceof RecyclotronApiErr)
            throw error;
        
            throw new RecyclotronApiErr("User","OperationFailed",500)
        }
    };
// Supprimer des rôles d'un utilisateur
export const removeUserRoles = async (
    request: FastifyRequest<{
        Params: { id: string };
        Body: { roles: number[] };
    }>,
    reply: FastifyReply,
) => {
    try {
        const id: number = parseInt(request.params.id);
        const user = await SUser.findByPk(id);
        if (!user) {
            throw new RecyclotronApiErr("User", "NotFound", 404);
        }
        const roles = await SRole.findAll({
            where: {
                id: (request.body as { roles: number[] }).roles,
            },
        });
        if (roles.length === 0) {
            throw new RecyclotronApiErr("User", "InvalidInput", 400);
        }
        await user.$remove("roles", roles);
        const updatedUser = await SUser.findByPk(user.id, {
            include: [{ model: SRole, attributes: ["id", "name"] }],
            attributes: { exclude: ["password"] },
        });
        return reply.send(updatedUser);
    } catch (error) {
        if (error instanceof RecyclotronApiErr) {
            throw error;
        }
        throw new RecyclotronApiErr("User", "OperationFailed", 500);
    }
};