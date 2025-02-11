import { FastifyInstance } from "fastify";
import { PaymentController } from "../controllers/paymentController.js";
import {
    donationSchema,
    paymentMethodSchema,
    subscriptionSchema,
    DonationBody,
    PaymentMethodBody,
    SubscriptionBody,
} from "../models/Payment.js";
import z from "zod";
import { authorize } from "../middleware/auth.js";
import { zodToJsonSchema } from "zod-to-json-schema";

export default async (fastify: FastifyInstance) => {
    // Register raw body parser for Stripe webhook
    await fastify.register(import("fastify-raw-body"), {
        field: "rawBody",
        global: false,
        encoding: "utf8",
        runFirst: true,
    });

    fastify.post<{ Body: SubscriptionBody }>(
        "/subscription",
        {
            schema: {
                body: subscriptionSchema,
                response: {
                    200: zodToJsonSchema(z.object({ subscriptionId: z.any() })),
                },
            },
            onRequest: [authorize(["client"])],
        },
        PaymentController.createSubscription,
    );
    fastify.delete<{ Params: { subscriptionId: string } }>(
        "/subscription/:id",
        {
            schema: {
                params: z.object({ subscriptionId: z.string() }),
                response: {
                    200: zodToJsonSchema(z.object({ message: z.string() })),
                },
            },
            onRequest: [authorize(["client"])],
        },
        PaymentController.cancelSubscription,
    );
    fastify.post<{ Body: DonationBody }>(
        "/donation",
        {
            schema: {
                body: donationSchema,
                response: {
                    200: zodToJsonSchema(z.object({ message: z.string() })),
                },
            },
            onRequest: [authorize(["client"])],
        },
        PaymentController.createDonation,
    );
    fastify.put<{ Body: PaymentMethodBody }>(
        "/payment-method",
        {
            schema: {
                body: paymentMethodSchema,
                response: {
                    200: zodToJsonSchema(z.object({ message: z.string() })),
                },
            },
            onRequest: [authorize(["client"])],
        },
        PaymentController.updatePaymentMethod,
    );
    fastify.post(
        "/webhook",
        {
            config: { rawBody: true },
            onRequest: [authorize(["admin"])],
        },
        PaymentController.handleWebhook,
    );
};
