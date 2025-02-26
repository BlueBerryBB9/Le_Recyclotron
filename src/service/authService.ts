import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
import { RecyclotronApiErr } from "../error/recyclotronApiErr.js";
import SUser from "../models/User.js";
import SRole from "../models/Role.js";

export const generateToken = (id: number, email: string, roles: string[]) => {
    try {
        if (!JWT_SECRET) throw new RecyclotronApiErr("JWT", "EnvKeyMissing");

        return jwt.sign(
            {
                id: id,
                email: email,
                roles: roles,
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }, // actually 2 weeks, format : "336h"
        );
    } catch (error) {
        throw error;
    }
};

