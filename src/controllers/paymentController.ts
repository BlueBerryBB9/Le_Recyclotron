import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import stripe from "../config/stripe.js";
import SPayment from "../models/Payment.js";

export class PaymentController {
    // Créer un abonnement mensuel
    static async createSubscription(req: FastifyRequest, res: FastifyReply) {
        try {
            const { customerId, priceId } = req.body as {
                customerId: string;
                priceId: string;
                userId: string;
            };

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
                id_user: (req.body as { userId: string }).userId,
                stripeSubscriptionId: subscription.id,
            });

            res.send({ subscriptionId: subscription.id });
        } catch (error) {
            res.status(400).send({
                error: "Erreur lors de la création de l'abonnement",
            });
        }
    }

    // Gérer un don unique
    static async createDonation(req: FastifyRequest, res: FastifyReply) {
        try {
            const { amount, paymentMethodId, userId } = req.body as {
                amount: number;
                paymentMethodId: string;
                userId: string;
            };

            // Créer l'intention de paiement
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount * 100, // Stripe utilise les centimes
                currency: "eur",
                payment_method: paymentMethodId,
                confirm: true,
                return_url: `${process.env.FRONTEND_URL}/donation/success`,
            });

            // Enregistrer dans notre base de données
            await SPayment.create({
                amount,
                type: 2, // 2 pour don
                date: new Date(),
                id_user: userId,
                stripePaymentIntentId: paymentIntent.id,
            });

            res.send({ clientSecret: paymentIntent.client_secret });
        } catch (error) {
            res.status(400).send({ error: "Erreur lors du traitement du don" });
        }
    }

    // Mettre à jour les coordonnées bancaires
    static async updatePaymentMethod(req: FastifyRequest, res: FastifyReply) {
        try {
            const { customerId, paymentMethodId } = req.body as {
                customerId: string;
                paymentMethodId: string;
            };

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

            res.send({ success: true });
        } catch (error) {
            res.status(400).send({
                error: "Erreur lors de la mise à jour du moyen de paiement",
            });
        }
    }

    // Résilier un abonnement
    static async cancelSubscription(req: FastifyRequest, res: FastifyReply) {
        try {
            const { subscriptionId } = req.params as { subscriptionId: string };

            // Annuler l'abonnement dans Stripe
            const subscription =
                await stripe.subscriptions.cancel(subscriptionId);

            // Mettre à jour notre base de données
            await SPayment.update(
                { status: "cancelled" },
                { where: { stripeSubscriptionId: subscriptionId } },
            );

            res.send({ success: true });
        } catch (error) {
            res.status(400).send({
                error: "Erreur lors de la résiliation de l'abonnement",
            });
        }
    }

    // Webhook pour gérer les événements Stripe
    static async handleWebhook(req: FastifyRequest, res: FastifyReply) {
        const sig = req.headers["stripe-signature"];

        try {
            const event = stripe.webhooks.constructEvent(
                req.body as string,
                sig as string,
                process.env.STRIPE_WEBHOOK_SECRET as string,
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

            res.send({ received: true });
        } catch (error) {
            res.status(400).send({ error: "Erreur webhook" });
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
