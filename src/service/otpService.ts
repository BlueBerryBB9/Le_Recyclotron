import OTP from "../models/OTP.js";
import * as argon from "argon2";
import {
    RecyclotronApiErr,
    SequelizeApiErr,
} from "../error/recyclotronApiErr.js";
import { BaseError } from "sequelize";
import { argon2Options } from "../config/hash.js";

export const createOTP = async (
    userId: number,
    plainPassword: string,
): Promise<OTP> => {
    try {
        const hashedPassword = await argon.hash(plainPassword, argon2Options);
        const otp = await OTP.create({
            password: hashedPassword,
            userId: userId,
        });
        return otp;
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("OTP", error);
        } else throw new RecyclotronApiErr("OTP", "CreationFailed", 500);
    }
};

export const verifyOTPservice = async (
    userId: number,
    plainPassword: string,
): Promise<boolean> => {
    try {
        const otps = await OTP.findAll({
            where: {
                userId: userId,
            },
            order: [["createdAt", "DESC"]],
        });

        if (otps.length === 0) return false;

        const now = new Date();
        const expiryTime = 15 * 60 * 1000;

        let isValid: boolean = false;
        for (const element of otps) {
            const createdAt = new Date(element.getDataValue("createdAt"));
            if (now.getTime() - createdAt.getTime() > expiryTime)
                throw new RecyclotronApiErr("OTP", "Expired", 400);

            if (
                await argon.verify(
                    element.getDataValue("password"),
                    plainPassword,
                )
            ) {
                isValid = true;
                element.destroy();
                break;
            }
        }

        return isValid;
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("OTP", error);
        } else throw new RecyclotronApiErr("OTP", "OperationFailed", 500);
    }
};
