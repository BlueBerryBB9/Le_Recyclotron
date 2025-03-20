import SUser from "./User.js";
import SRole from "./Role.js";
import SUserRole from "./UserRoles.js";

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

SUser.beforeDestroy(async (user) => {
    await SUserRole.destroy({ where: { userId: user.getDataValue("id") } });
});

SRole.beforeDestroy(async (role) => {
    await SUserRole.destroy({
        where: { roleId: role.getDataValue("id") },
    });
});

export default setupAssociations;
