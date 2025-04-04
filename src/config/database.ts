import { Sequelize } from "sequelize";
import * as env from "../config/env.js";

const sequelize = new Sequelize(
    env.MYSQL_DATABASE as string,
    env.MYSQL_USER as string,
    env.MYSQL_PASSWORD as string,
    {
        host: env.DB_HOST,
        dialect: "mysql", // to modify if we want to use another SGDB like mariaDB
        port: Number(env.DB_PORT),
        logging: false,
    },
);

export default sequelize;
