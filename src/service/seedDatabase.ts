import SRole from "../models/Role.js";
import SUser from "../models/User.js";
import UserRole from "../models/UserRoles.js";
import { argon2Options } from "../config/hash.js";
import argon from "argon2";
import SCategory from "../models/Category.js";
import SEvent from "../models/Event.js";
import SItem from "../models/Item.js";
import SItemCategory from "../models/ItemCategories.js";
import SPayment from "../models/Payment.js";
import SRegistration from "../models/Registration.js";
import { Sequelize } from "sequelize";

export async function seedDatabase(sequelize: Sequelize) {
    // const userCount = await SUser.count();
    // const userRoleCount = await UserRole.count();
    // const roleCount = await SRole.count();
    // const eventCount = await SEvent.count();
    // const registrationCount = await SRegistration.count();
    // const categoryCount = await SCategory.count();
    // const itemCount = await SItem.count();
    // const itemCategoriesCount = await SItemCategory.count();
    // const paymentCount = await SPayment.count();

    // Allows to truncate without checking foreign key constraints
    // on joint table with foreign keys like userRole.
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");

    await SUser.destroy({ truncate: true });
    await UserRole.destroy({ truncate: true });
    await SRole.destroy({ truncate: true });
    await SEvent.destroy({ truncate: true });
    await SRegistration.destroy({ truncate: true });
    await SCategory.destroy({ truncate: true });
    await SItem.destroy({ truncate: true });
    await SItemCategory.destroy({ truncate: true });
    await SPayment.destroy({ truncate: true });

    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1;");

    await SUser.bulkCreate([
        {
            first_name: "Martin",
            last_name: "Leroy",
            email: "martin.leroy@edu.ecole-89.com",
            password: await argon.hash("ADMINADMIN", argon2Options),
        },
        {
            first_name: "Noah",
            last_name: "Chantin",
            email: "noah.chantin@edu.ecole-89.com",
            password: await argon.hash("ADMINADMIN", argon2Options),
        },
        {
            first_name: "Wissal",
            last_name: "Kerkour",
            email: "wissal.kerkour@edu.ecole-89.com",
            password: await argon.hash("ADMINADMIN", argon2Options),
        },
        {
            first_name: "Martin2",
            last_name: "Leroy2",
            email: "martin4leroy@gmail.com",
            password: await argon.hash("USERUSER", argon2Options),
        },
        {
            first_name: "Noah2",
            last_name: "Chantin2",
            email: "alyxisss@gmail.com",
            password: await argon.hash("EMPLOYEEEMPLOYEE", argon2Options),
        },
    ]);
    console.log("Default users inserted successfully!");
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
        // Noah Employee
        {
            userId: 5,
            roleId: 5,
        },
    ]);
    console.log("Default userRoles inserted successfully!");
    await SEvent.bulkCreate([
        {
            title: "title 1",
            description: "title 1 description",
            date: new Date(),
            image: "image.com",
        },
        {
            title: "title 2",
            description: "title 2 description",
            date: new Date(),
            image: "image.com",
        },
    ]);
    console.log("Default events inserted successfully!");
    await SRegistration.bulkCreate([
        {
            seats: 2,
            userId: 4,
            eventId: 1,
        },
    ]);
    console.log("Default registrations inserted successfully!");
    await SCategory.bulkCreate([
        {
            name: "Vêtements",
        },
        {
            name: "T-shirts",
            parentCategoryId: 1,
        },
        {
            name: "Electronique",
        },
        {
            name: "Câbles",
            parentCategoryId: 3,
        },
        {
            name: "T-shirts col V",
            parentCategoryId: 2,
        },
    ]);
    console.log("Default categories inserted successfully!");
    await SItem.bulkCreate([
        {
            name: "t-shirt supreme",
            status: 0,
            material: "coton",
            image: "image.com",
        },
        {
            name: "câble hdmi",
            status: 0,
            material: "metal",
            image: "image.com",
        },
    ]);
    console.log("Default items inserted successfully!");
    await SItemCategory.bulkCreate([
        {
            categoryId: 2,
            itemId: 1,
        },
        {
            categoryId: 4,
            itemId: 2,
        },
    ]);
    console.log("Default item categories inserted successfully!");
    await SPayment.bulkCreate([
        {
            userId: 4,
            id_stripe_payment: 1,
            amount: 1,
            type: 0,
            status: "finished",
        },
        {
            userId: 4,
            id_stripe_payment: 1,
            amount: 1,
            type: 0,
            status: "finished",
        },
    ]);
    console.log("Default payments inserted successfully!");
}
