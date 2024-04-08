import { ZodSchema, z } from 'zod';
const RowSchema = z.array(z.boolean()).length(5);

// Define the schema for the entire 5x5 array
export const MatrixSchema = z
  .array(RowSchema)
  .length(5)
  .refine(
    (matrix) => {
      // Check if there is at least one instance of 1 in the matrix
      // const oneFound = matrix.some((row) => row.includes(true));
      // Check if the middle center is always 0
      const middleCenter = matrix[2][2] === false;
      return middleCenter;
    },
    {
      message: 'The middle center should always be false',
    }
  );
// const patternRow = z
//   .array(z.literal(0).or(z.literal(1)))
//   .refine((data) => data.length === 5, {
//     message: 'Each row should have exactly 5 elements.',
//   })
//   .refine((data) => data[1] !== 1, {
//     message: 'The value at position [2, 2] should always be 0.',
//   });

export const AddGameSchema: ZodSchema = z.object({
  pattern: MatrixSchema,
  type: z.number(),
  bet: z.number(),
  cartelas: z.array(z.number()).refine(
    (data) => {
      const uniqueSet = new Set(data);
      return uniqueSet.size === data.length;
    },
    {
      message: 'Array should not contain duplicate numbers.',
    }
  ),
});
export type TGameSchema = z.infer<typeof AddGameSchema>;

export const FindGameSchema: ZodSchema = z.object({
  id: z.string().min(32).optional(),
  branchID: z.string().min(32).optional(),
  start_date: z
    .string()
    .refine(
      (data) => {
        const parsedDate = new Date(data);

        return !isNaN(parsedDate.getTime());
      },
      {
        message: 'Invalid date string format.',
      }
    )
    .optional(),
  end_date: z
    .string()
    .refine(
      (data) => {
        const parsedDate = new Date(data);

        return !isNaN(parsedDate.getTime());
      },
      {
        message: 'Invalid date string format.',
      }
    )
    .optional(),
  cartelaID: z.number().optional(),
  userID: z.string().min(32).optional(),
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
export type TFindGameSchema = z.infer<typeof FindGameSchema>;
export const CheckGameSchema: ZodSchema = z.object({
  steps: z.number().min(1).max(75),
});
export type TCheckGameSchema = z.infer<typeof AddGameSchema>;
