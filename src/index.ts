import Fastify, { FastifyReply, FastifyRequest } from "fastify";
// Local imports
import sequelize_test from "./config/test_database.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import itemsRoutes from "./routes/itemsRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { RecyclotronApiErr } from "./error/recyclotronApiErr.js";
// Zod imports
import * as z from "zod";
import { fromError } from "zod-validation-error";
import { validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import SUser from "./models/User.js";
import SRole from "./models/Role.js";
import SuserRoles from "./models/UserRoles.js";
import SEvent from "./models/Event.js";
import cors from "@fastify/cors";
import { NODE_ENV, FRONTEND_URL, JWT_SECRET } from "./config/env.js";
import { argon2Options } from "./config/hash.js";
import argon from "argon2";
import sequelize from "./config/database.js";
import setupAssociations from "./models/Associations.js";
import { corsConfig } from "./config/cors.js";
import authRoutes from "./routes/authRoutes.js";
import fastifyJwt from "@fastify/jwt";
import { where } from "sequelize";
import SRegistration from "./models/Registration.js";
import { isTokenRevoked } from "./controllers/authController.js";

async function seedDatabase() {
    const userCount = await SUser.count(); // Check if the Users table is empty
    const userRoleCount = await SuserRoles.count(); // Check if the Users table is empty
    const roleCount = await SRole.count(); // Check if the Users table is empty

    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0;");
    await SUser.destroy({ truncate: true });
    await SuserRoles.destroy({ truncate: true });
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
        await SuserRoles.bulkCreate([
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

const startServer = async () => {
    const app = Fastify({
        logger: true,
    }).withTypeProvider<ZodTypeProvider>();
    try {
        // Creating fastify instance with Zodtype to allow schemas and Zodvalidator on routes
        // Set Zod validator
        app.setValidatorCompiler(validatorCompiler);
        // Set custom fastify error handler function
        app.setErrorHandler(async function (error, _, reply) {
            if (error instanceof z.ZodError) {
                // Customizes Zoderror fastify response
                const valerror = fromError(error);
                reply.code(error.statusCode || 400);
                return {
                    status: error.statusCode,
                    message: valerror.toString(),
                };
            } else if (error instanceof RecyclotronApiErr) {
                // Customizes our error class response
                reply.code(error.statusCode || 400);
                return error.Error();
            }
        });

        setupAssociations();
        await sequelize.authenticate();
        console.log("Connected to the database.");
        await sequelize.sync({ force: true }); // Synchronization with the db, to use carefully though.
        await seedDatabase();

        if (!JWT_SECRET) {
            throw new RecyclotronApiErr("JWT", "EnvKeyMissing");
        } else {
            app.register(fastifyJwt, {
                secret: JWT_SECRET,
            });
        }
        // Register CORS
        if (NODE_ENV === "dev") {
            app.register(cors, corsConfig);
        } else {
            app.register(cors, {
                origin: `${FRONTEND_URL}`, // Adjust the origin as needed
                methods: [],
                allowedHeaders: ["Content-Type", "Authorization"],
                credentials: true,
                preflightContinue: false,
                optionsSuccessStatus: 204,
            });
        }

        app.register(categoryRoutes, { prefix: "/api" });
        app.register(eventRoutes, { prefix: "/api" });
        app.register(itemsRoutes, { prefix: "/api" });
        app.register(paymentRoutes, { prefix: "/api" });
        app.register(registrationRoutes, { prefix: "/api" });
        app.register(userRoutes, { prefix: "/api" });
        app.register(authRoutes, { prefix: "/api" });

        // Sould be:
        // - jwt verification
        // - role verification
        app.addHook(
            "onRequest",
            async (request: FastifyRequest, reply: FastifyReply) => {
                try {
                    if (request.method === "GET") {
                        reply.header("Access-Control-Allow-Origin", "*");
                        reply.header(
                            "Access-Control-Allow-Methods",
                            "GET, POST, PUT, DELETE, PATCH",
                        );
                        reply.header(
                            "Access-Control-Allow-Headers",
                            "Content-Type",
                        );
                    }
                    console.log(request.url);
                    console.log(await request.jwtVerify());
                    console.log(request.user);
                    // const user = await SUser.findByPk(1, {
                    //     include: [
                    //         {
                    //             model: SRole,
                    //             as: "roles", // Alias defined in the association
                    //             attributes: ["id", "name"], // Specify which fields to include from Role
                    //         },
                    //     ],
                    //     attributes: ["id", "first_name", "email"], // Specify which fields to include from User
                    // });
                } catch (error) {
                    console.error("Error in onRequest hook:", error);
                    throw error; // Re-throw to let Fastify handle it
                }
            },
        );
        app.addHook(
            "onResponse",
            async (request: FastifyRequest, reply: FastifyReply) => {
                console.log("Reply");
                console.log(reply.statusCode);
            },
        );

        //         app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
        //   console.log(`Incoming request: ${request.method} ${request.url}`);
        //   // Example: Block a specific route
        //   if (request.url === '/forbidden') {
        //     reply.code(403).send({ error: 'Forbidden' });
        //   }
        //   });

        await app.listen({ port: 3000 });
        console.log("Server is running on port 3000");
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
};

startServer();

//! TEST (C'est des tests Noah)

export const startServerTest = async () => {
    const app = Fastify({
        logger: true,
    }).withTypeProvider<ZodTypeProvider>();
    try {
        // Creating fastify instance with Zodtype to allow schemas and Zodvalidator on routes
        // Set Zod validator
        app.setValidatorCompiler(validatorCompiler);
        // Set custom fastify error handler function
        app.setErrorHandler(async function (error, _, reply) {
            if (error instanceof z.ZodError) {
                // Customizes Zoderror fastify response
                const valerror = fromError(error);
                reply.code(error.statusCode || 400);
                return {
                    status: error.statusCode,
                    message: valerror.toString(),
                };
            } else if (error instanceof RecyclotronApiErr) {
                // Customizes our error class response
                reply.code(error.statusCode || 400);
                return error.Error();
            }
        });
        await sequelize_test.authenticate();
        console.log("Connected to the database.");
        await sequelize_test.sync(); // Synchronisez les modèles avec la DB.

        // Register CORS
        app.register(cors, {
            origin: "*",
            methods: ["GET", "POST", "PUT", "DELETE"],
        });

        app.register(categoryRoutes, { prefix: "/api" });
        app.register(eventRoutes, { prefix: "/api" });
        app.register(itemsRoutes, { prefix: "/api" });
        app.register(paymentRoutes, { prefix: "/api" });
        app.register(registrationRoutes, { prefix: "/api" });
        app.register(userRoutes, { prefix: "/api" });

        await app.listen({ port: 3000 });
        console.log("Server is running on port 3000");
        return app;
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
};
