import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class OTP extends Model {
    public id!: number;
    public password!: string;
    public userId!: number;
}

OTP.init(
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
        modelName: "OTP",
        tableName: "otps",
        timestamps: true,
    },
);

export default OTP;
