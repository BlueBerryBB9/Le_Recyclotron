import OTP from "../models/OTP.js";
import * as argon from "argon2";
import {
    RecyclotronApiErr,
    SequelizeApiErr,
} from "../error/recyclotronApiErr.js";
import { BaseError } from "sequelize";

export const createOTP = async (
    userId: number,
    plainPassword: string,
): Promise<OTP> => {
    try {
        const hashedPassword = await argon.hash(plainPassword);
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

export const verifyOTP = async (
    userId: number,
    plainPassword: string,
): Promise<boolean> => {
    try {
        const otp = await OTP.findOne({
            where: {
                userId: userId,
            },
            order: [["createdAt", "DESC"]], // Get the latest OTP
        });

        if (!otp) {
            return false;
        }

        const isValid = await argon.verify(otp.password, plainPassword);
        return isValid;
    } catch (error) {
        if (error instanceof BaseError) {
            throw new SequelizeApiErr("OTP", error);
        } else throw new RecyclotronApiErr("OTP", "CreationFailed", 500);
    }
};
