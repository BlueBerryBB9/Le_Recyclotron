import { FastifyInstance } from "fastify";
import { PaymentController } from "../controllers/paymentController.js";
import {
    donationSchema,
    paymentMethodSchema,
    subscriptionSchema,
    DonationBody,
    PaymentMethodBody,
    SubscriptionBody,
    ZSubscription as pm,
} from "../models/Payment.js";
import z from "zod";
import { authorize } from "../middleware/auth.js";
import { defaultErrors, singleResponse } from "../utils/responseSchemas.js";

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
                    ...defaultErrors,
                    200: singleResponse(pm.ZSubscription)
                }
            },
            onRequest: [authorize(["client"])],
        },
        PaymentController.createSubscription,
    );
    fastify.delete<{ Params: { subscriptionId: string } }>(
        "/subscription/:id",
        {
            schema: { params: z.object({ subscriptionId: z.string() }) },
            onRequest: [authorize(["client"])],
        },
        PaymentController.cancelSubscription,
    );
    fastify.post<{ Body: DonationBody }>(
        "/donation",
        {
            schema: { body: donationSchema },
            onRequest: [authorize(["client"])],
        },
        PaymentController.createDonation,
    );
    fastify.put<{ Body: PaymentMethodBody }>(
        "/payment-method",
        {
            schema: { body: paymentMethodSchema },
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
