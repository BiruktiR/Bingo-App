import { ZodSchema, z } from 'zod';

export const BranchSchema: ZodSchema = z.object({
  name: z.string().min(1).trim(),
});
export const BranchIDSchema: ZodSchema = z.object({
  id: z.string().uuid().trim(),
});
export type TBranch = z.infer<typeof BranchSchema>;
export const FindBranchSchema: ZodSchema = z.object({
  name: z.string().optional(),
  id: z.string().min(32).optional(),
  companyID: z.string().min(32).optional(),
  page: z
    .string()
    .refine((data) => !isNaN(Number(data)), {
      message: 'Input must be a valid number',
    })
    .optional(),
  limit: z
    .string()
    .refine((data) => !isNaN(Number(data)), {
      message: 'Input must be a valid number',
    })
    .optional(),
});

export type TFindBranchSchema = z.infer<typeof FindBranchSchema>;
