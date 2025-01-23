import SUser from "../models/User.js"; // Import the User model
import { Sequelize } from "sequelize";
import * as env from "../config/env.js";
import { argon2Options } from "./hash.js";
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

export async function seedDatabase() {
    const userCount = await SUser.count(); // Check if the Users table is empty

    if (userCount === 0) {
        console.log("Inserting default users...");
        await SUser.bulkCreate([
            {
                first_name: "Martin",
                last_name: "Leroy",
                email: "martin.leroy@edu.ecole-89.com",
                password: argon.hash("ADMIN", argon2Options), // Replace with a properly hashed password
            },
            {
                first_name: "Noah",
                last_name: "Chantin",
                email: "noah.chantin@edu.ecole-89.com",
                password: argon.hash("ADMIN", argon2Options), // Replace with a properly hashed password
            },
            {
                first_name: "Wissal",
                last_name: "Kerkour",
                email: "wissal.kerkour@edu.ecole-89.com",
                password: argon.hash("ADMIN", argon2Options), // Replace with a properly hashed password
            },
        ]);
        console.log("Default users inserted successfully!");
    } else {
        console.log("Default data already exists. No changes made.");
    }
}

sequelize.afterSync(async () => {
    console.log("Database synced! Running seeder...");
    await seedDatabase();
});

export default sequelize;
