import { Sequelize } from "sequelize";
import * as env from "../config/env.js";

const sequelize = new Sequelize(
    env.DB_TEST_NAME as string,
    env.DB_TEST_USER as string,
    env.DB_TEST_PASSWORD as string,
    {
        host: env.DB_TEST_HOST,
        dialect: "mysql",
        logging: false,
    },
);

export default sequelize;
