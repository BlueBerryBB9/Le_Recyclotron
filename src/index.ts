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
import cors from "@fastify/cors";
import { NODE_ENV, FRONTEND_URL, JWT_SECRET } from "./config/env.js";
import sequelize from "./config/database.js";
import setupAssociations from "./models/Associations.js";
import { corsConfig } from "./config/cors.js";
import authRoutes from "./routes/authRoutes.js";
import fastifyJwt from "@fastify/jwt";
import { seedDatabase } from "./service/seedDatabase.js";

export const startServer = async () => {
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
        await seedDatabase(sequelize);

        if (!JWT_SECRET) {
            throw new RecyclotronApiErr("JWT", "EnvKeyMissing");
        } else {
            app.register(fastifyJwt, {
                secret: JWT_SECRET,
            });
        }

        // Register CORS
        console.log(NODE_ENV);
        if (NODE_ENV === "dev") {
            console.log(NODE_ENV);
            app.register(cors, corsConfig);
        } else {
            app.register(cors, {
                origin: `${FRONTEND_URL}`, // Adjust the origin as needed
                methods: ["GET", "POST", "PUT", "DELETE"],
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
                    // REPLACING CORS HEADER
                    // if (request.method === "GET") {
                    //     reply.header("Access-Control-Allow-Origin", "*");
                    //     reply.header(
                    //         "Access-Control-Allow-Methods",
                    //         "GET, POST, PUT, DELETE, PATCH",
                    //     );
                    //     reply.header(
                    //         "Access-Control-Allow-Headers",
                    //         "Content-Type",
                    //     );
                    // }
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

        await app.listen({ port: 3000 });
        console.log("Server is running on port 3000");
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
};

startServer();

//! TEST (C'est des tests Noah, Alban dit que t'es con et que tu devrais réfléchir)

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

        setupAssociations();
        await sequelize_test.authenticate();
        console.log("Connected to the TEST database.");
        await sequelize_test.sync({ force: true }); // Synchronization with the db, to use carefully though.
        await seedDatabase(sequelize_test);

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
                } catch (error) {
                    console.error("Error in onRequest hook:", error);
                    throw error;
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
        console.log("Server test is live.");
        return app;
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
};
