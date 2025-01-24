import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import SUser from "./User.js";

class SResetPassword extends Model {}

SResetPassword.init(
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                key: "id",
                model: SUser,
            },
        },
        resetCode: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        expiryDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        used: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        sequelize,
        tableName: "ResetPasswords",
    },
);

export default SResetPassword;
