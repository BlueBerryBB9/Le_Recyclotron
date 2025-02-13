import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";
import z from "zod";
import SRole, { ZRole } from "./Role.js";
import SUserRole from "./UserRoles.js";
import { getRole, getRoleString } from "../service/getRole.js";

class SUser extends Model {
    async getRole() {
        return await getRole(this.getDataValue("id"));
    }
    async getRoleString() {
        return await getRoleString(this.getDataValue("id"));
    }
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
            allowNull: true,
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
        token_revocation_timestamp: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        sequelize,
        modelName: "User",
        timestamps: true,
    },
);

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
        .max(10, "Phone number must be less than 10 characters")
        .nullable()
        .optional(),

    is_adherent: z.boolean().default(false),

    sub_type: z.string().nullable().optional(),

    createdAt: z.date(),

    updatedAt: z.date(),
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
});

// Schema for updating a user (all fields optional)
export const ZUpdateUser = ZUserBase.extend({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password must be less than 100 characters"),
}).partial();

// Schema for public user data (no sensitive information)
export const ZPublicUser = ZUser.omit({
    password: true,
});

// Ajouter aux types existants
export const ZResetPasswordRequest = z.object({
    email: z.string().email(),
});

export const ZResetPassword = z.object({
    email: z.string().email(),
    tempCode: z.string().min(6).max(6),
    newPassword: z.string().min(6),
});

export const ZUserWithRole = ZPublicUser.extend({
    roles: z.array(ZRole),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const ZUserListOutput = z.array(ZUserWithRole);

export type UserWithRole = z.infer<typeof ZUserWithRole>;
export type UserListOutput = z.infer<typeof ZUserListOutput>;

export type ResetPasswordRequest = z.infer<typeof ZResetPasswordRequest>;
export type ResetPassword = z.infer<typeof ZResetPassword>;

// TypeScript types
export type User = z.infer<typeof ZUser>;
export type CreateUser = z.infer<typeof ZCreateUser>;
export type UpdateUser = z.infer<typeof ZUpdateUser>;
export type PublicUser = z.infer<typeof ZPublicUser>;

export default SUser;
