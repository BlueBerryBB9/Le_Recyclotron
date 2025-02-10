// src/models/Payment.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import SUser from "../models/User.js";
import { z } from "zod";

class SPayment extends Model {}

SPayment.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        userId: {
            type: DataTypes.INTEGER,
            references: {
                model: "Users",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        id_stripe_payment: { type: DataTypes.STRING, allowNull: true },
        amount: { type: DataTypes.FLOAT, allowNull: false },
        type: { type: DataTypes.INTEGER }, // donation = 0, subscription = 1 ?
        status: { type: DataTypes.STRING, allowNull: true },
    },
    { sequelize, modelName: "Payment" },
);

export default SPayment;

export const subscriptionSchema = z.object({
    customerId: z.string(),
    priceId: z.string(),
    userId: z.number(),
});

export const donationSchema = z.object({
    amount: z.number().positive(),
    paymentMethodId: z.string(),
    userId: z.number(),
});

export const paymentMethodSchema = z.object({
    customerId: z.string(),
    paymentMethodId: z.string(),
});

export const ZPayment = z.object({
    id: z.number(),
    userId: z.number(),
    id_stripe_payment: z.string().nullable(),
    amount: z.number(),
    type: z.number(),
    status: z.string().nullable(),
});

export type Payment = z.infer<typeof ZPayment>;
export type SubscriptionBody = z.infer<typeof subscriptionSchema>;
export type DonationBody = z.infer<typeof donationSchema>;
export type PaymentMethodBody = z.infer<typeof paymentMethodSchema>;
