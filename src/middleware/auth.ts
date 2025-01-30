import { FastifyReply, FastifyRequest } from "fastify";
import "@fastify/jwt";
import SRole from "../models/Role.js";
import SRegistration from "../models/Registration.js";
import { RecyclotronApiErr } from "../error/recyclotronApiErr.js";
import SUser from "../models/User.js";
import { isTokenRevoked } from "../controllers/authController.js";

interface MyCustomPayload {
    user: { id: number; email: string; roles: string[] };
    iat: number;
}

export function authorize(allowedRoles: string[]) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            console.log(request.headers.authorization);
            await request.jwtVerify();
            const decodedToken = await request.jwtDecode<MyCustomPayload>();
            console.log(decodedToken);

            if (isTokenRevoked(request.user.id, Number(decodedToken.iat)))
                throw new RecyclotronApiErr("Auth", "PermissionDenied", 401);

            const userRoles = request.user.roles;

            if (
                !allowedRoles.some((role) => {
                    return userRoles.includes(role);
                })
            ) {
                throw new RecyclotronApiErr(
                    "MiddleWare",
                    "PermissionDenied",
                    401,
                );
            }
        } catch (error) {
            if (error instanceof RecyclotronApiErr) {
                throw error;
            } else {
                throw new RecyclotronApiErr("Auth", "PermissionDenied", 401);
            }
        }
    };
}

export async function isSelfOrAdminOr(
    roles: string[] | null = null,
    entity: string = "user",
) {
    return async (
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply,
    ) => {
        await request.jwtVerify();

        const decodedToken = await request.jwtDecode<MyCustomPayload>();
        console.log(decodedToken);

        if (isTokenRevoked(request.user.id, Number(decodedToken.iat)))
            throw new RecyclotronApiErr("Auth", "PermissionDenied");

        const requestingUserId = request.user.id;
        const requestingUserRoles = request.user.roles;
        let targetUserId: number;

        if (entity === "user") {
            targetUserId = parseInt(request.params.id);
        } else if (entity === "registration") {
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

        const targetUser = await SUser.findByPk(targetUserId);
        if (!targetUser)
            throw new RecyclotronApiErr("MiddleWare", "PermissionDenied", 401);

        if (
            requestingUserRoles.includes("rh") &&
            (await targetUser.getRoleString()).includes("client")
        ) {
            throw new RecyclotronApiErr("MiddleWare", "PermissionDenied", 401);
        }
        const hasRolePermission = roles.some((role) =>
            requestingUserRoles.includes(role),
        );
        if (hasRolePermission) return;

        throw new RecyclotronApiErr("MiddleWare", "PermissionDenied", 401);
    };
}
