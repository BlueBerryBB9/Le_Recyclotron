import dotenv from "dotenv";
import { RecyclotronApiErr } from "../error/recyclotronApiErr.js";

dotenv.config({ path: ".env.local" });

export const DB_HOST = process.env.DB_HOST;
if (!DB_HOST) throw new RecyclotronApiErr("Env", "EnvKeyMissing");

export const DB_USER = process.env.DB_USER;
if (!DB_HOST) throw new RecyclotronApiErr("Env", "EnvKeyMissing");

export const DB_PASSWORD = process.env.DB_PASSWORD;
if (!DB_PASSWORD) throw new RecyclotronApiErr("Env", "EnvKeyMissing");

export const DB_NAME = process.env.DB_NAME;
if (!DB_NAME) throw new RecyclotronApiErr("Env", "EnvKeyMissing");

export const DB_TEST_HOST = process.env.DB_TEST_HOST;
if (!DB_TEST_HOST) throw new RecyclotronApiErr("Env", "EnvKeyMissing");

export const DB_TEST_USER = process.env.DB_TEST_USER;
if (!DB_TEST_USER) throw new RecyclotronApiErr("Env", "EnvKeyMissing");

export const DB_TEST_PASSWORD = process.env.DB_TEST_PASSWORD;
if (!DB_TEST_PASSWORD) throw new RecyclotronApiErr("Env", "EnvKeyMissing");

export const DB_TEST_NAME = process.env.DB_TEST_NAME;
if (!DB_TEST_NAME) throw new RecyclotronApiErr("Env", "EnvKeyMissing");

export const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new RecyclotronApiErr("Env", "EnvKeyMissing");

export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
if (!JWT_EXPIRES_IN) throw new RecyclotronApiErr("Env", "EnvKeyMissing");

export const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
// if (!STRIPE_SECRET_KEY) throw new RecyclotronApiErr("Env", "EnvKeyMissing");

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
// if (!STRIPE_WEBHOOK_SECRET) throw new RecyclotronApiErr("Env", "EnvKeyMissing");

export const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;
// if (!STRIPE_PUBLISHABLE_KEY)
//     throw new RecyclotronApiErr("Env", "EnvKeyMissing");

export const EMAIL_SENDER = process.env.EMAIL_SENDER;
if (!EMAIL_SENDER) throw new RecyclotronApiErr("Env", "EnvKeyMissing");

export const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
if (!EMAIL_PASSWORD) throw new RecyclotronApiErr("Env", "EnvKeyMissing");

export const FRONTEND_URL = process.env.FRONTEND_URL;
if (!FRONTEND_URL) throw new RecyclotronApiErr("Env", "EnvKeyMissing");

export const NODE_ENV = process.env.NODE_ENV;
if (!NODE_ENV) throw new RecyclotronApiErr("Env", "EnvKeyMissing");
