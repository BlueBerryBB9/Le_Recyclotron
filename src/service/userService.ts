import SRole from "../models/Role.js";
import SUser from "../models/User.js";

export const getAllUserWithRoles = async () => {
    return await SUser.findAll({
        include: [
            {
                model: SRole,
                attributes: ["id", "name"],
                as: "roles",
                through: { attributes: [] },
            },
        ],
        attributes: { exclude: ["password"] },
    });
};

export const getUserWithRoles = async (id: number) => {
    return await SUser.findByPk(id, {
        include: [
            {
                model: SRole,
                attributes: ["id", "name"],
                as: "roles",
                through: { attributes: [] },
            },
        ],
        attributes: { exclude: ["password"] },
    });
};
