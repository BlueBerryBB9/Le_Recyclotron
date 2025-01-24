import { Sequelize } from "sequelize";
import * as env from "../config/env.js";
import SUser from "../models/User.js";
import { argon2Options } from "./hash.js";
import SRole from "../models/Role.js";
import argon from "argon2";

const sequelize = new Sequelize(
    env.DB_NAME as string,
    env.DB_USER as string,
    env.DB_PASSWORD as string,
    {
        host: env.DB_HOST,
        dialect: "mysql",
        logging: false,
    },
);

export default sequelize;
