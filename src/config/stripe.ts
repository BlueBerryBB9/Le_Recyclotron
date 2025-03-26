import Stripe from "stripe";
import * as env from "../config/env.js";

if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY must be defined");
}

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
});

export default stripe;
