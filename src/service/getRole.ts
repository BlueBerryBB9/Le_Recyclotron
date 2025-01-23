import SUserRole from "../models/UserRoles.js";
import SRole from "../models/Role.js";

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
