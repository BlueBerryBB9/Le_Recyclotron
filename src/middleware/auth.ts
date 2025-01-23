import { FastifyReply, FastifyRequest } from "fastify";
import "@fastify/jwt";
import SRole from "../models/Role.js";
import { RecyclotronApiErr } from "../error/recyclotronApiErr.js";

export const authorize =
    (inputRoles: string[]) =>
    async (request: FastifyRequest, reply: FastifyReply) => {
        const allowedRoles: SRole[] = [];
        for (let role of inputRoles) {
            const foundRole = await SRole.findOne({ where: { name: role } });
            if (foundRole) {
                allowedRoles.push(foundRole);
            }
        }
        await request.jwtVerify();

        const userRoles = (request.user as any).roles;

        const hasPermission = allowedRoles.some((role) =>
            userRoles.includes(role),
        );

        if (!hasPermission) {
            throw new RecyclotronApiErr("MiddleWare", "PermissionDenied", 401);
        }
    };

export const isSelfOrAdmin = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) => {
    await request.jwtVerify();

    const userId = parseInt(request.params.id);
    const requestingUserId = (request.user as any).id;
    const userRoles = (request.user as any).roles;

    if (userId !== requestingUserId && !userRoles.includes("Admin")) {
        throw new RecyclotronApiErr("MiddleWare", "PermissionDenied", 401);
    }
};
