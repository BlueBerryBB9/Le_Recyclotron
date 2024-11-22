import { FastifyInstance } from "fastify";
import { PaymentController } from "../controllers/paymentController.js";

export default async (fastify: FastifyInstance) => {
    // Register raw body parser for Stripe webhook
    await fastify.register(import("fastify-raw-body"), {
        field: "rawBody",
        global: false,
        encoding: "utf8",
        runFirst: true,
    });

    fastify.post("/subscription", PaymentController.createSubscription);
    fastify.delete(
        "/subscription/:subscriptionId",
        PaymentController.cancelSubscription,
    );
    fastify.post("/donation", PaymentController.createDonation);
    fastify.post("/payment-method", PaymentController.updatePaymentMethod);
    fastify.post(
        "/webhook",
        { config: { rawBody: true } },
        PaymentController.handleWebhook,
    );
};
