import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class SOTP extends Model {}

SOTP.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "OTPs",
        timestamps: true,
    },
);

export default SOTP;
