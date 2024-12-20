import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import SPayment from "./Payment.js";
import z from "zod";

class SUser extends Model {
    $remove(arg0: string, roles: import("./Role.js").default[]) {
        throw new Error("Method not implemented.");
    }
    $add(arg0: string, roles: import("./Role.js").default[]) {
        throw new Error("Method not implemented.");
    }
    public id!: number;
    public first_name!: string;
    public last_name!: string;
    public email!: string;
    public phone!: string;
    public password!: string;
    public is_adherent!: boolean;
    public sub_type!: string;
}

SUser.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        first_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        phone: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique: true,
            validate: {
                is: /^\+?[\d\s-]+$/,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [8, 100],
            },
        },
        is_adherent: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        sub_type: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize,
        modelName: "User",
    },
);

//SPayment association's done here because otherwise SUser is not initialized when used in SPayment done before
SPayment.belongsTo(SUser, { foreignKey: "user_id" });
SUser.hasMany(SPayment);

export default SUser;

// Base schema with common validations
export const ZUserBase = z.object({
    first_name: z
        .string()
        .min(1, "First name is required")
        .max(100, "First name must be less than 100 characters")
        .transform((v) => v.trim()),

    last_name: z
        .string()
        .min(1, "Last name is required")
        .max(100, "Last name must be less than 100 characters")
        .transform((v) => v.trim()),

    email: z
        .string()
        .email("Invalid email format")
        .max(100, "Email must be less than 100 characters")
        .transform((v) => v.toLowerCase()),

    phone: z
        .string()
        .regex(/^\+?[\d\s-]+$/, "Invalid phone number format")
        .max(10, "Phone number must be less than 10 characters"),

    is_adherent: z.boolean().default(false),

    sub_type: z.string().nullable().optional(),
});

// Complete user schema with ID
export const ZUser = ZUserBase.extend({
    id: z.number().positive("ID must be a positive number"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password must be less than 100 characters"),
});

// Schema for creating a new user
export const ZCreateUser = ZUserBase.extend({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password must be less than 100 characters"),
    roles: z.array(z.number().positive()).default([]),
});

// Schema for updating a user (all fields optional)
export const ZUpdateUser = ZUserBase.extend({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password must be less than 100 characters"),
    roles: z.array(z.number().positive()),
}).partial();

// Schema for public user data (no sensitive information)
export const ZPublicUser = ZUser.omit({
    password: true,
});

// TypeScript types
export type User = z.infer<typeof ZUser>;
export type CreateUser = z.infer<typeof ZCreateUser>;
export type UpdateUser = z.infer<typeof ZUpdateUser>;
export type PublicUser = z.infer<typeof ZPublicUser>;
