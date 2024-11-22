// src/models/Payment.ts
import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import User from "../models/User.js";
import { z } from "zod";

class SPayment extends Model {}

SPayment.init(
    {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_stripe_payment: { type: DataTypes.STRING, allowNull: true },
        amount: { type: DataTypes.FLOAT, allowNull: false },
        type: { type: DataTypes.INTEGER },
        date: { type: DataTypes.DATE, allowNull: false },
        status: { type: DataTypes.STRING, allowNull: true },
    },
    { sequelize, modelName: "Payment" },
);

SPayment.belongsTo(User, { foreignKey: "user_id" });

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

export type SubscriptionBody = z.infer<typeof subscriptionSchema>;
export type DonationBody = z.infer<typeof donationSchema>;
export type PaymentMethodBody = z.infer<typeof paymentMethodSchema>;
