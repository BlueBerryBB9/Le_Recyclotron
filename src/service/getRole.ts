import SUserRole from "../models/UserRoles.js";
import SRole from "../models/Role.js";

// export const getRole = async (userId: number): Promise<SRole[]> => {
//     const userRoles = await SUserRole.findAll({
//         where: {
//             userId: userId,
//         },
//     });

//     const roleIds: SRole[] = userRoles.map((userRole) =>
//         userRole.getDataValue("roleId"),
//     );
//     const roles: SRole[] = await SRole.findAll({
//         where: {
//             id: roleIds,
//         },
//     });
//     return roles;
// };

export const getRole = async (userId: number): Promise<SRole[]> => {
    const roles = await SRole.findAll({
        include: [
            {
                model: SUserRole,
                where: { userId: userId },
                attributes: [],
            },
        ],
    });
    return roles;
};
