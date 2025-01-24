import SUser from "./User.js";
import SRole from "./Role.js";
import SUserRole from "./UserRoles.js";

// Define associations
const setupAssociations = () => {
    SUser.belongsToMany(SRole, {
        as: "users",
        foreignKey: "userId",
        through: SUserRole,
    });

    SRole.belongsToMany(SUser, {
        as: "roles",
        foreignKey: "roleId",
        through: SUserRole,
    });
};

export default setupAssociations;
