import { ZodSchema, z } from 'zod';

// const innerArraySchema = z.array(z.number()).refine(
//   (data) => {
//     const uniqueSet = new Set(data);
//     return (
//       data.length === 5 &&
//       uniqueSet.size === data.length &&
//       data[0] >= 1 &&
//       data[0] <= 15 &&
//       data[1] >= 16 &&
//       data[1] <= 30 &&
//       data[2] >= 31 &&
//       data[2] <= 45 &&
//       data[3] >= 46 &&
//       data[3] <= 60 &&
//       data[4] >= 61 &&
//       data[4] <= 75
//     );
//   },
//   {
//     message: 'Invalid array structure or values.',
//   }
// );

// export const CartelaSchema = z.object({
//   board: z.array(innerArraySchema).refine(
//     (data) => {
//       const flatData = data.flat(); // Flatten the array of arrays
//       const uniqueSet = new Set(flatData);
//       return uniqueSet.size === flatData.length && data.length === 5;
//     },
//     {
//       message: 'All elements in the external array must be unique.',
//     }
//   ),
// });
const BoardSchema = z
  .array(z.array(z.number()))
  .refine(
    (matrix) => {
      // Ensure there are exactly 5 rows
      return matrix.length === 5 && matrix.every((row) => row.length === 5);
    },
    {
      message: 'Matrix must have exactly 5 rows with 5 columns each.',
    }
  )
  .refine(
    (matrix) => {
      // Flatten the matrix and remove the middle center value for uniqueness check
      const flatMatrix = matrix.flatMap((row, rowIndex) => {
        if (rowIndex === 2) return row.slice(0, 2).concat(row.slice(3));
        return row;
      });
      const uniqueSet = new Set(flatMatrix);
      return uniqueSet.size === flatMatrix.length;
    },
    {
      message:
        'All values in the matrix (except middle center) must be unique.',
    }
  )
  .refine(
    (matrix) => {
      // Check values of each column except the middle center column
      const columnRanges = [
        { range: [1, 15], columnIndex: 0 },
        { range: [16, 30], columnIndex: 1 },
        { range: [31, 45], columnIndex: 2 },
        { range: [46, 60], columnIndex: 3 },
        { range: [61, 75], columnIndex: 4 },
      ];
      return columnRanges.every(({ range, columnIndex }) =>
        matrix.every((row, rowIndex) =>
          rowIndex !== 2 || columnIndex !== 2
            ? row[columnIndex] >= range[0] && row[columnIndex] <= range[1]
            : true
        )
      );
    },
    {
      message: 'Invalid values in the matrix or column ranges.',
    }
  )
  .refine(
    (matrix) => {
      // Check if middle center value is 0
      return matrix[2][2] === 0;
    },
    {
      message: 'Middle center value must be 0.',
    }
  );
export const CartelaSchema = z.object({
  board: BoardSchema,
});
export type TCartela = z.infer<typeof CartelaSchema>;
export const MultipleCartelaSchema = z.object({
  board: z.array(BoardSchema).refine(
    (arrays) => {
      const arrayStrings = arrays.map((array) => JSON.stringify(array));
      const uniqueArrayStrings = new Set(arrayStrings);
      return uniqueArrayStrings.size === arrayStrings.length;
    },
    {
      message: 'Arrays must be unique.',
    }
  ),
});
export type TMultipleCartelaSchema = z.infer<typeof MultipleCartelaSchema>;

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
