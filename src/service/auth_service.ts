import jwt from "jsonwebtoken";
import SRole from "../models/Role.js";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
import { RecyclotronApiErr } from "../error/recyclotronApiErr.js";

export const generateToken = (user: {
    id: number;
    email: string;
    roles: SRole[];
}) => {
    try {
        if (!JWT_SECRET) {
            throw new RecyclotronApiErr("JWT", "NotFound");
        }
        return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    } catch (error) {
        throw error;
    }
};
