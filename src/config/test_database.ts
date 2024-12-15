import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_TEST_NAME as string,
    process.env.DB_TEST_USER as string,
    process.env.DB_TEST_PASSWORD as string,
    {
        host: process.env.DB_TEST_HOST,
        dialect: "mysql",
        logging: false,
    },
);

export default sequelize;
