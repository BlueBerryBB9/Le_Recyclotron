import { FRONTEND_URL } from "./env.js";

export const corsConfigDev = {
    origin: true,
    allowedHeaders: ["Content-Type"],
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
