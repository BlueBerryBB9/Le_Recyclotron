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
    as: "roles", // Plural alias for clarity
    foreignKey: "userId", // Correct foreign key for User
    through: UserRole,
});

Role.belongsToMany(User, {
    as: "users", // Plural alias for clarity
    foreignKey: "roleId", // Correct foreign key for Role
    through: UserRole,
});

export default UserRole;
