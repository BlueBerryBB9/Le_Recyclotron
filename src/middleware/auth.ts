import { FastifyReply, FastifyRequest } from "fastify";
import "@fastify/jwt";
import SRole from "../models/Role.js";
import { RecyclotronApiErr } from "../error/recyclotronApiErr.js";
import SUser from "../models/User.js";

export function authorize(allowedRoles: string[]) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        await request.jwtVerify();

        const userRoles = request.user.roles;

        const hasPermission = allowedRoles.some((role) =>
            userRoles.includes(role),
        );
        if (!hasPermission)
            throw new RecyclotronApiErr("MiddleWare", "PermissionDenied", 401);
    };
}
export const isSelfOrAdminOrRh = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
) => {
    await request.jwtVerify();

    const userId = parseInt(request.params.id);
    const requestingUserId = request.user.id;
    const userRoles = request.user.roles;
    const target = await SUser.findByPk(userId);
    if (!target) {
        throw new RecyclotronApiErr("Auth", "NotFound", 404);
    }
    const targetRoles = await target.getDataValue("roles");

    if (
        userId !== requestingUserId &&
        !userRoles.includes("admin") &&
        (!userRoles.includes("rh") &&
        targetRoles.includes("client"))
    ) {
        throw new RecyclotronApiErr("MiddleWare", "PermissionDenied", 401);
    }
};
