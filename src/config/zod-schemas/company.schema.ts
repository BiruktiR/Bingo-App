import { ZodSchema, z } from 'zod';

const nonEmptyString = z.string().refine((data) => data.trim() !== '', {
  message: 'String must not be empty',
});
export const CompanySchema: ZodSchema = z.object({
  name: z.string().min(1).trim(),
});
export const CompanyIDSchema: ZodSchema = z.object({
  id: z.string().uuid().trim(),
});
export type TCompany = z.infer<typeof CompanySchema>;
