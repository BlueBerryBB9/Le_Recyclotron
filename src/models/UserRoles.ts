import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class SUserRole extends Model {}

SUserRole.init(
    {
        userId: {
            type: DataTypes.INTEGER,
            references: {
                model: "Users",
                key: "id",
            },
        },
        roleId: {
            type: DataTypes.INTEGER,
            references: {
                model: "Roles",
                key: "id",
            },
        },
    },
    {
        sequelize,
        modelName: "UserRole",
    },
);

export default SUserRole;
