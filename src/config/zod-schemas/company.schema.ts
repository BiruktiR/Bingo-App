import { ZodSchema, z } from 'zod';

export const CompanySchema: ZodSchema = z.object({
  name: z.string().trim(),
});
export const CompanyIDSchema: ZodSchema = z.object({
  id: z.string().uuid().trim(),
});
export type TCompany = z.infer<typeof CompanySchema>;
