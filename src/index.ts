import Fastify from "fastify";
import sequelize from "./config/database.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import itemsRoutes from "./routes/itemsRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const fastify = Fastify({ logger: true });

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
