import { FRONTEND_URL } from "./env.js";

export const corsConfigDev = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["*"],
    credentials: true,
    optionsSuccessStatus: 204,
};

export const corsConfigProd = {
    origin: `${FRONTEND_URL}`,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
    optionsSuccessStatus: 204,
};
