import { FastifyReply, FastifyRequest } from "fastify";
import "@fastify/jwt";
import SRole from "../models/Role.js";
import SRegistration from "../models/Registration.js";
import { RecyclotronApiErr } from "../error/recyclotronApiErr.js";
import SUser from "../models/User.js";

export function authorize(allowedRoles: string[]) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            await request.jwtVerify();

            console.log(request.user);
            const userRoles = request.user.roles;

            console.log(allowedRoles);
            console.log(userRoles);
            const hasPermission = allowedRoles.some((role) => {
                console.log(role);
                userRoles.includes(role);
            });
            if (!hasPermission) {
                console.log("TELL ME SOMETHING AAAAAAAAAAAAAA222222222222");
                throw new RecyclotronApiErr(
                    "MiddleWare",
                    "PermissionDenied",
                    401,
                );
            }
        } catch (error) {
            console.log(error);
            throw new RecyclotronApiErr("Auth", "PermissionDenied", 401);
        }
    };
}

export async function isSelfOrAdminOr(
    roles: string[] | null = null,
    where: string = "user",
) {
    return async (
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply,
    ) => {
        await request.jwtVerify();

        const requestingUserId = request.user.id;
        const requestingUserRoles = request.user.roles;
        let targetUserId: number;

        if (where === "user") {
            targetUserId = parseInt(request.params.id);
        } else if (where === "registration") {
            const targetRegistrationId = parseInt(request.params.id);
            const targetRegistration =
                await SRegistration.findByPk(targetRegistrationId);
            if (!targetRegistration)
                throw new RecyclotronApiErr(
                    "MiddleWare",
                    "InvalidLocation",
                    400,
                );
            targetUserId = targetRegistration.getDataValue("userId");
        } else {
            throw new RecyclotronApiErr("MiddleWare", "InvalidLocation", 400);
        }

        if (
            targetUserId === requestingUserId ||
            requestingUserRoles.includes("admin")
        )
            return;
        if (!roles)
            throw new RecyclotronApiErr("MiddleWare", "PermissionDenied", 401);

        const hasRolePermission = roles.some((role) =>
            requestingUserRoles.includes(role),
        );
        if (hasRolePermission) return;

        throw new RecyclotronApiErr("MiddleWare", "PermissionDenied", 401);
    };
}
