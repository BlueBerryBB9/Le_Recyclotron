import Fastify, { FastifyReply, FastifyRequest } from "fastify";
// Local imports
import sequelize from "./config/database.js";
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
        await sequelize.authenticate();
        console.log("Connected to the database.");
        await sequelize.sync(); // Synchronisez les modèles avec la DB.

        app.register(categoryRoutes, { prefix: "/api" });
        app.register(eventRoutes, { prefix: "/api" });
        app.register(itemsRoutes, { prefix: "/api" });
        app.register(paymentRoutes, { prefix: "/api" });
        app.register(registrationRoutes, { prefix: "/api" });
        app.register(userRoutes, { prefix: "/api" });

        app.addHook(
            "onRequest",
            async (request: FastifyRequest, reply: FastifyReply) => {
                request.url == "/api/event" //get
                console.log(request.url);
                console.log(request.headers.jwt);
                throw new RecyclotronApiErr("Category", "OperationFailed", 500);
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
