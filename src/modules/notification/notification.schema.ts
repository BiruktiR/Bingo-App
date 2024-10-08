import { ZodSchema, z } from 'zod';

export const FindNotificationSchema: ZodSchema = z.object({
  id: z.string().min(32).optional(),
  type: z.string().optional(),
  userID: z.string().min(32).optional(),
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
export type TFindNotificationSchema = z.infer<typeof FindNotificationSchema>;
