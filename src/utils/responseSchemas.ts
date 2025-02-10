import { z } from "zod";
import * as u from "../models/User.js";
import * as rm from "../models/Registration.js";
import * as em from "../models/Event.js";
import * as pm from "../models/Payment.js";
import * as im from "../models/Item.js";
import * as cm from "../models/Category.js";

export const baseResponse = {
  message: z.string(),
};

export const errorSchema = z.object({
  statusCode: z.number(),
  error: z.string(),
  message: z.string(),
});

export const defaultErrors = {
  400: errorSchema,
  401: errorSchema,
  403: errorSchema,
  404: errorSchema,
  500: errorSchema,
};

// Generic response builders
export const listResponse = <T extends z.ZodType>(schema: T) =>
  z.object({ ...baseResponse, data: z.array(schema) });

export const singleResponse = <T extends z.ZodType>(schema: T) =>
  z.object({ ...baseResponse, data: schema });
