import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export const DB_HOST = process.env.DB_HOST;
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_NAME = process.env.DB_NAME;
export const DB_TEST_HOST = process.env.DB_TEST_HOST;
export const DB_TEST_USER = process.env.DB_TEST_USER;
export const DB_TEST_PASSWORD = process.env.DB_TEST_PASSWORD;
export const DB_TEST_NAME = process.env.DB_TEST_NAME;
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;
export const EMAIL_SENDER = process.env.EMAIL_SENDER;
export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
export const FRONTEND_URL = process.env.FRONTEND_URL;
export const CORS_IN_DEVELOPMENT = process.env.CORS_IN_DEVELOPMENT;