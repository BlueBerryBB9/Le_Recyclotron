import SUser from "./User.js";
import SRole from "./Role.js";
import SUserRole from "./UserRoles.js";
import SEvent from "./Event.js";
import SRegistration from "./Registration.js";

// Define associations
const setupAssociations = () => {
    SUser.belongsToMany(SRole, {
        as: "roles",
        foreignKey: "userId",
        through: SUserRole,
    });

    SRole.belongsToMany(SUser, {
        as: "users",
        foreignKey: "roleId",
        through: SUserRole,
    });
};

export default setupAssociations;
