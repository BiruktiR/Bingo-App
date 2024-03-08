import { ZodSchema, z } from 'zod';

const innerArraySchema = z.array(z.number()).refine(
  (data) => {
    const uniqueSet = new Set(data);
    return (
      data.length === 5 &&
      uniqueSet.size === data.length &&
      data[0] >= 1 &&
      data[0] <= 15 &&
      data[1] >= 16 &&
      data[1] <= 30 &&
      data[2] >= 31 &&
      data[2] <= 45 &&
      data[3] >= 46 &&
      data[3] <= 60 &&
      data[4] >= 61 &&
      data[4] <= 75
    );
  },
  {
    message: 'Invalid array structure or values.',
  }
);

export const CartelaSchema = z.object({
  board: z.array(innerArraySchema).refine(
    (data) => {
      const flatData = data.flat(); // Flatten the array of arrays
      const uniqueSet = new Set(flatData);
      return uniqueSet.size === flatData.length && data.length === 5;
    },
    {
      message: 'All elements in the external array must be unique.',
    }
  ),
});
export type TCartela = z.infer<typeof CartelaSchema>;
export const FindCartelaSchema: ZodSchema = z.object({
  id: z
    .string()
    .refine((data) => !isNaN(Number(data)), {
      message: 'Input must be a valid number',
    })
    .optional(),
  branchID: z.string().min(32).optional(),
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

export type TFindCartelaSchema = z.infer<typeof FindCartelaSchema>;
