import SUserRole from "../models/UserRoles.js";
import SRole from "../models/Role.js";
import SUser from "../models/User.js";

export const getRole = async (userId: number): Promise<SRole[]> => {
    let roles = await SRole.findAll({
        include: [
            {
                model: SUser,
                as: "users", // Must match the alias defined in setupAssociations
                where: { id: userId },
                through: { attributes: [] }, // Exclude fields from SUserRole
            },
        ],
    });
    return roles;
};

export const getRoleString = async (userId: number): Promise<string[]> => {
    let roles = await getRole(userId);
    return roles.map((role) => {
        return role.getDataValue("name");
    });
};
