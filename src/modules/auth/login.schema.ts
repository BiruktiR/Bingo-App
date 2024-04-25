import { ZodSchema, z } from 'zod';

export const LoginSchema: ZodSchema = z.object({
  username: z.string().min(5),
  password: z.string(),
});
export type TLogin = z.infer<typeof LoginSchema>;

export const GenerateTokenSchema: ZodSchema = z.object({
  token: z.string().min(10),
});
export type TGeneratedToken = z.infer<typeof GenerateTokenSchema>;
