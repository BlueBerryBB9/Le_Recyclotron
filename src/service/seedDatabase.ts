import SRole from "../models/Role.js";
import SUser from "../models/User.js";
import UserRole from "../models/UserRoles.js";
import { argon2Options } from "../config/hash.js";
import argon from "argon2";

export async function seedDatabase(sequelize: any) {
    const userCount = await SUser.count(); // Check if the Users table is empty
    const userRoleCount = await UserRole.count(); // Check if the Users table is empty
    const roleCount = await SRole.count(); // Check if the Users table is empty

    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
    await SUser.destroy({ truncate: true });
    await UserRole.destroy({ truncate: true });
    await SRole.destroy({ truncate: true });
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");

    if (userCount === 0) {
        console.log("Inserting default users...");
        await SUser.bulkCreate([
            {
                first_name: "Martin",
                last_name: "Leroy",
                email: "martin.leroy@edu.ecole-89.com",
                password: await argon.hash("ADMIN", argon2Options),
            },
            {
                first_name: "Noah",
                last_name: "Chantin",
                email: "noah.chantin@edu.ecole-89.com",
                password: await argon.hash("ADMIN", argon2Options),
            },
            {
                first_name: "Wissal",
                last_name: "Kerkour",
                email: "wissal.kerkour@edu.ecole-89.com",
                password: await argon.hash("ADMIN", argon2Options),
            },
            {
                first_name: "Martin2",
                last_name: "Leroy2",
                email: "martin4leroy@gmail.com",
                password: await argon.hash("USER", argon2Options),
            },
        ]);
        console.log("Default users inserted successfully!");
    }
    if (roleCount === 0) {
        await SRole.bulkCreate([
            {
                id: 1,
                name: "admin",
            },
            {
                id: 2,
                name: "rh",
            },
            {
                id: 3,
                name: "repairer",
            },
            {
                id: 4,
                name: "cm",
            },
            {
                id: 5,
                name: "employee",
            },
            {
                id: 6,
                name: "client",
            },
        ]);
        console.log("Default roles inserted successfully!");
    }
    if (userRoleCount === 0) {
        await UserRole.bulkCreate([
            // Martin Admin
            {
                userId: 1,
                roleId: 1,
            },
            {
                userId: 1,
                roleId: 2,
            },
            {
                userId: 1,
                roleId: 3,
            },
            {
                userId: 1,
                roleId: 4,
            },
            {
                userId: 1,
                roleId: 5,
            },
            {
                userId: 1,
                roleId: 6,
            },
            // Noah Admin
            {
                userId: 2,
                roleId: 1,
            },
            {
                userId: 2,
                roleId: 2,
            },
            {
                userId: 2,
                roleId: 3,
            },
            {
                userId: 2,
                roleId: 4,
            },
            {
                userId: 2,
                roleId: 5,
            },
            {
                userId: 2,
                roleId: 6,
            },
            // Wissal Admin
            {
                userId: 3,
                roleId: 1,
            },
            {
                userId: 3,
                roleId: 2,
            },
            {
                userId: 3,
                roleId: 3,
            },
            {
                userId: 3,
                roleId: 4,
            },
            {
                userId: 3,
                roleId: 5,
            },
            {
                userId: 3,
                roleId: 6,
            },
            // Martin User
            {
                userId: 4,
                roleId: 6,
            },
        ]);
        console.log("Default UserRoles inserted successfully!");
    }
}
