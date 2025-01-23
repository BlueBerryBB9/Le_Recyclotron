import SUserRole from "../models/UserRoles.js";
import SRole from "../models/Role.js";

export const getRole = async (userId: number): Promise<SRole[]> => {
    const userRoles = await SUserRole.findAll({
        where: {
            userId: userId,
        },
    });

    const roleIds = userRoles.map((userRole) =>
        userRole.getDataValue("roleId"),
    );
    const roles: SRole[] = await SRole.findAll({
        where: {
            id: roleIds,
        },
    });
    return roles;
};
