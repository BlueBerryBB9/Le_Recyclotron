import jwt from "jsonwebtoken";
import SRole from "../models/Role.js";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/auth.js";

export const generateToken = (user: {
    id: number;
    email: string;
    roles: SRole[];
}) => {
    return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
