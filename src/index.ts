import Fastify from "fastify";
// Local imports
import sequelize from "./config/database.js";
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

// Creating fastify instance with Zodtype to allow schemas and Zodvalidator on routes
const fastify = Fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();
// Set Zod validator
fastify.setValidatorCompiler(validatorCompiler);
// Set custom fastify error handler function
fastify.setErrorHandler(async function (error, _, reply) {
    if (error instanceof z.ZodError) {
        // Customizes Zoderror fastify response
        const valerror = fromError(error);
        reply.code(error.statusCode || 400);
        return { status: error.statusCode, message: valerror.toString() };
    } else if (error instanceof RecyclotronApiErr) {
        // Customizes our error class response
        reply.code(error.statusCode || 400);
        return error.Error();
    }
});

const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connected to the database.");

        await sequelize.sync(); // Synchronisez les modèles avec la DB.

        fastify.register(categoryRoutes, { prefix: "/api" });
        fastify.register(eventRoutes, { prefix: "/api" });
        fastify.register(itemsRoutes, { prefix: "/api" });
        fastify.register(paymentRoutes, { prefix: "/api" });
        fastify.register(registrationRoutes, { prefix: "/api" });
        fastify.register(userRoutes, { prefix: "/api" });

        await fastify.listen({ port: 3000 });
        console.log("Server is running on port 3000");
    } catch (error) {
        fastify.log.error(error);
        process.exit(1);
    }
};

startServer();
