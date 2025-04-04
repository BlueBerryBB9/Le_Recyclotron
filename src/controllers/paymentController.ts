import { FastifyRequest, FastifyReply } from "fastify";
import stripe from "../config/stripe.js";
import SPayment from "../models/Payment.js";
import { request } from "http";
import {
    donationSchema,
    paymentMethodSchema,
    subscriptionSchema,
    DonationBody,
    PaymentMethodBody,
    SubscriptionBody,
} from "../models/Payment.js";
import * as env from "../config/env.js";
import { BaseError } from "sequelize";
import {
    RecyclotronApiErr,
    SequelizeApiErr,
} from "../error/recyclotronApiErr.js";

export class PaymentController {
    // Créer un abonnement mensuel
    static async createSubscription(
        request: FastifyRequest<{ Body: SubscriptionBody }>,
        reply: FastifyReply,
    ) {
        try {
            const validateData = subscriptionSchema.parse(request.body);
            const { customerId, priceId, userId } = validateData;

            // Créer l'abonnement dans Stripe
            const subscription = await stripe.subscriptions.create({
                customer: customerId,
                items: [{ price: priceId }],
                payment_behavior: "default_incomplete",
                expand: ["latest_invoice.payment_intent"],
            });

            // Enregistrer dans notre base de données
            await SPayment.create({
                amount: subscription.items.data[0].price.unit_amount! / 100,
                type: 1, // 1 pour abonnement
                date: new Date(),
                id_user: userId,
                id_stripe_payment: subscription.id,
            });

            return reply.status(200).send({
                subscriptionId: subscription.id,
                message: "Abonnement créé",
            });
        } catch (error) {
            if (error instanceof BaseError) {
                throw new SequelizeApiErr("Payment", error);
            } else throw new RecyclotronApiErr("Payment", "OperationFailed");
        }
    }

    // Créer un don unique
    static async createDonation(
        request: FastifyRequest<{ Body: DonationBody }>,
        reply: FastifyReply,
    ) {
        try {
            const validateData = donationSchema.parse(request.body);
            const { amount, paymentMethodId, userId } = validateData;

            // Créer l'intention de paiement
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount * 100, // Stripe utilise les centimes
                currency: "eur",
                payment_method: paymentMethodId,
                confirm: true,
                return_url: `${env.FRONTEND_URL}/donation/success`,
            });

            // Enregistrer dans notre base de données
            await SPayment.create({
                amount,
                type: 2, // 2 pour don
                date: new Date(),
                id_user: userId,
                id_stripe_payment: paymentIntent.id,
            });
            return reply.status(200).send({
                clientSecret: paymentIntent.client_secret,
                message: "Don créé",
            });
        } catch (error) {
            if (error instanceof BaseError) {
                throw new SequelizeApiErr("Payment", error);
            } else throw new RecyclotronApiErr("Payment", "CreationFailed");
        }
    }

    // Mettre à jour les coordonnées bancaires
    static async updatePaymentMethod(
        request: FastifyRequest<{ Body: PaymentMethodBody }>,
        reply: FastifyReply,
    ) {
        try {
            const validateData = paymentMethodSchema.parse(request.body);
            const { customerId, paymentMethodId } = validateData;

            // Attacher la nouvelle méthode de paiement au client
            await stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId,
            });

            // La définir comme méthode par défaut
            await stripe.customers.update(customerId, {
                invoice_settings: {
                    default_payment_method: paymentMethodId,
                },
            });
            return reply
                .status(200)
                .send({ message: "Moyen de paiement mis à jour" });
        } catch {
            throw new RecyclotronApiErr("Payment", "CreationFailed");
        }
    }

    // Résilier un abonnement
    static async cancelSubscription(
        request: FastifyRequest<{ Params: { subscriptionId: string } }>,
        reply: FastifyReply,
    ) {
        try {
            const { subscriptionId } = request.params;

            await SPayment.update(
                { status: "cancelled" },
                { where: { stripeSubscriptionId: subscriptionId } },
            );

            return reply.status(200).send({ message: "Abonnement résilié" });
        } catch {
            return reply.status(400).send({
                error: "Erreur lors de la résiliation de l'abonnement",
            });
        }
    }

    // Webhook pour gérer les événements Stripe
    static async handleWebhook(req: FastifyRequest, reply: FastifyReply) {
        const sig = req.headers["stripe-signature"];
        const rawBody = (request as any).rawBody;

        try {
            const event = stripe.webhooks.constructEvent(
                rawBody,
                sig as string,
                env.STRIPE_WEBHOOK_SECRET as string,
            );

            switch (event.type) {
                case "invoice.payment_succeeded":
                    // Mettre à jour le statut du paiement
                    await PaymentController.handleSuccessfulPayment(
                        event.data.object,
                    );
                    break;
                case "invoice.payment_failed":
                    // Gérer l'échec du paiement
                    await PaymentController.handleFailedPayment(
                        event.data.object,
                    );
                    break;
            }

            return reply.send({ received: true });
        } catch {
            return reply.status(400).send({ error: "Erreur webhook" });
        }
    }

    private static async handleSuccessfulPayment(invoice: any) {
        await SPayment.update(
            { status: "succeeded" },
            { where: { stripeSubscriptionId: invoice.subscription } },
        );
    }

    private static async handleFailedPayment(invoice: any) {
        await SPayment.update(
            { status: "failed" },
            { where: { stripeSubscriptionId: invoice.subscription } },
        );
    }
}
