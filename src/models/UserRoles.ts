import { Model } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";
import Role from "./Role.js";

class UserRole extends Model {
    public userId!: number;
    public roleId!: number;
}

UserRole.init(
    {},
    {
        sequelize,
        modelName: "UserRole",
    },
);

User.belongsToMany(Role, {
    as: "role",
    foreignKey: "roleId",
    through: UserRole,
});
Role.belongsToMany(User, {
    as: "user",
    foreignKey: "userId",
    through: UserRole,
});

export default UserRole;
