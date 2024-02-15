import { ZodSchema, z } from 'zod';

export const BranchSchema: ZodSchema = z.object({
  name: z.string().min(1).trim(),
});
export const BranchIDSchema: ZodSchema = z.object({
  id: z.string().uuid().trim(),
});
export type TBranch = z.infer<typeof BranchSchema>;
