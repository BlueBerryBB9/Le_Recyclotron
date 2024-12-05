import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

export const validateRequest = (schema: z.ZodObject<
    { email: z.ZodString; password: z.ZodString; }, 
    "strip", z.ZodTypeAny, 
    { password: string; email: string; }, 
    { password: string; email: string; }>) => async (request: { body: unknown; }) => {
  try {
    return schema.parse(request.body);
  } catch (error) {
    throw {
      statusCode: 400,
      error: 'Validation Error',
      message: (error as z.ZodError).errors
    };
  }
};