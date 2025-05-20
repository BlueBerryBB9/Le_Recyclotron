import dotenv from "dotenv";
import { RecyclotronApiErr } from "../error/recyclotronApiErr.js";

dotenv.config({ path: ".env" });

/**
 * Utility function to get environment variables with validation.
 * @param key - The environment variable key.
 * @returns The value of the environment variable.
 * @throws RecyclotronApiErr if the environment variable is missing.
 */
function getEnvVar(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new RecyclotronApiErr("Env", "EnvKeyMissing", 500, key);
    }
    return value;
}

// PROD BOOLEAN
export const NODE_ENV = getEnvVar("NODE_ENV");

// DB
export const DB_HOST = getEnvVar("DB_HOST");
export const DB_PORT = getEnvVar("DB_PORT");
export const MYSQL_USER = getEnvVar("MYSQL_USER");
export const MYSQL_PASSWORD = getEnvVar("MYSQL_PASSWORD");
export const MYSQL_DATABASE = getEnvVar("MYSQL_DATABASE");

// DB TEST
export const DB_TEST_HOST = getEnvVar("DB_TEST_HOST");
export const DB_TEST_USER = getEnvVar("DB_TEST_USER");
export const DB_TEST_PASSWORD = getEnvVar("DB_TEST_PASSWORD");
export const DB_TEST_NAME = getEnvVar("DB_TEST_NAME");

// JWT
export const JWT_SECRET = getEnvVar("JWT_SECRET");
export const JWT_EXPIRES_IN = getEnvVar("JWT_EXPIRES_IN");

// STRIPE (optional keys)
export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

// EMAIL
export const EMAIL_SENDER = getEnvVar("EMAIL_SENDER");
export const EMAIL_PASSWORD = getEnvVar("EMAIL_PASSWORD");
// export const MAILERSEND_SENDER_EMAIL = getEnvVar("MAILERSEND_SENDER_EMAIL");
// export const MAILERSEND_API_KEY = getEnvVar("MAILERSEND_API_KEY");µ

// URLS
export const FRONTEND_URL = getEnvVar(
    NODE_ENV === "dev" ? "FRONTEND_URL_DEV" : "FRONTEND_URL_PROD",
);
export const PORT = getEnvVar("PORT");
