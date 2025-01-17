import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";
import Role from "./Role.js";

class UserRole extends Model {
    public userId!: number;
    public roleId!: number;
}

UserRole.init(
    {
        userId: {
            type: DataTypes.INTEGER,
            references: {
                model: User,
                key: "id",
            },
        },
        roleId: {
            type: DataTypes.INTEGER,
            references: {
                model: Role,
                key: "id",
            },
        },
    },
    {
        sequelize,
        modelName: "UserRole",
    },
);

User.belongsToMany(Role, {
    as: "roles",
    foreignKey: "userId",
    through: UserRole,
});

Role.belongsToMany(User, {
    as: "users",
    foreignKey: "roleId",
    through: UserRole,
});

export default UserRole;
